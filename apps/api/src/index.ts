import { createServer } from "node:http";
import { buildBuilderOptionsPayload } from "./builder-options.js";
import { createFiveToolsClient } from "./five-tools-client.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
const fiveToolsClient = createFiveToolsClient();

function sendJson(response: import("node:http").ServerResponse, statusCode: number, payload: unknown) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload, null, 2));
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 400, { error: "Missing request URL" });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? "127.0.0.1"}`);

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
      note: "Client scaffold ready; selective proxy routes come next.",
    });
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
