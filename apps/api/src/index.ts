import { createServer } from "node:http";
import { buildBuilderOptionsPayload } from "./builder-options.js";
import { createFiveToolsClient } from "./five-tools-client.js";
import { createUpstreamCache } from "./upstream-cache.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
const fiveToolsClient = createFiveToolsClient();
const upstreamCache = createUpstreamCache();
const allowedUpstreamPrefixes = ["/data/", "/api/"];

function isAllowedUpstreamPath(path: string) {
  return allowedUpstreamPrefixes.some((prefix) => path.startsWith(prefix));
}

function sendJson(response: import("node:http").ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  response.end(JSON.stringify(payload, null, 2));
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 400, { error: "Missing request URL" });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? "127.0.0.1"}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    response.end();
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, {
      status: "ok",
      app: "@bertinis-vault/api",
      upstream: fiveToolsClient.baseUrl,
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/datasets/builder-options") {
    sendJson(response, 200, buildBuilderOptionsPayload());
    return;
  }

  if (request.method === "GET" && url.pathname === "/upstream/status") {
    sendJson(response, 200, {
      upstream: fiveToolsClient.baseUrl,
      mode: "configured-client",
      note: "Selective upstream proxy enabled via /upstream/json?path=...",
      allowedPrefixes: allowedUpstreamPrefixes,
      cache: upstreamCache.stats(),
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/upstream/json") {
    const upstreamPath = url.searchParams.get("path");

    if (!upstreamPath) {
      sendJson(response, 400, {
        error: "Missing required query param: path",
      });
      return;
    }

    if (!isAllowedUpstreamPath(upstreamPath)) {
      sendJson(response, 400, {
        error: "Upstream path not allowed",
        path: upstreamPath,
        allowedPrefixes: allowedUpstreamPrefixes,
      });
      return;
    }

    const cachedPayload = upstreamCache.get(upstreamPath);

    if (cachedPayload !== undefined) {
      sendJson(response, 200, {
        source: "cache",
        path: upstreamPath,
        upstream: fiveToolsClient.baseUrl,
        payload: cachedPayload,
      });
      return;
    }

    try {
      const payload = await fiveToolsClient.get(upstreamPath);
      upstreamCache.set(upstreamPath, payload);

      sendJson(response, 200, {
        source: "upstream",
        path: upstreamPath,
        upstream: fiveToolsClient.baseUrl,
        payload,
      });
    } catch (error) {
      sendJson(response, 502, {
        error: "Upstream request failed",
        path: upstreamPath,
        detail: error instanceof Error ? error.message : "Unknown upstream error",
      });
    }

    return;
  }

  sendJson(response, 404, {
    error: "Not found",
    path: url.pathname,
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Bertini's Vault API listening on http://127.0.0.1:${port}`);
});
