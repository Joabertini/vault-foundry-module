import { createServer } from "node:http";
import { buildBuilderOptionsPayload } from "./builder-options.js";
import { createFiveToolsClient } from "./five-tools-client.js";
import { createUpstreamCache } from "./upstream-cache.js";
import {
  buildBackgroundsDataset,
  buildClassSpellDataset,
  buildClassesDataset,
  buildDatasetMeta,
  buildEquipmentDataset,
  buildFeatsDataset,
  buildItemDetails,
  buildItemsIndex,
  buildRacesDataset,
  buildSpellDetails,
  buildSpellsIndex,
  buildSpellsDataset,
  findClassEntry,
} from "./datasets.js";
import {
  buildHybridBackgroundsDataset,
  defaultUpstreamBackgroundsPath,
  normalizeUpstreamBackgroundsPayload,
} from "./upstream-backgrounds.js";
import {
  buildHybridClassesDataset,
  defaultUpstreamClassesPath,
  normalizeUpstreamClassesPayload,
} from "./upstream-classes.js";
import {
  buildHybridEquipmentDataset,
  defaultUpstreamEquipmentPath,
  normalizeUpstreamEquipmentPayload,
} from "./upstream-equipment.js";
import {
  buildHybridFeatsDataset,
  defaultUpstreamFeatsPath,
  normalizeUpstreamFeatsPayload,
} from "./upstream-feats.js";
import {
  buildHybridRacesDataset,
  defaultUpstreamRacesPath,
  normalizeUpstreamRacesPayload,
} from "./upstream-races.js";
import {
  buildHybridSpellsDataset,
  defaultUpstreamSpellsPath,
  normalizeUpstreamSpellsPayload,
} from "./upstream-spells.js";

type ServerOptions = {
  baseUrl?: string;
};

export function createApiServer(options: ServerOptions = {}) {
  const fiveToolsClient = createFiveToolsClient(options.baseUrl);
  const upstreamCache = createUpstreamCache();
  const allowedUpstreamPrefixes = ["/data/", "/api/"];
  const allowedUpstreamExactPaths = new Set([
    defaultUpstreamClassesPath,
    defaultUpstreamRacesPath,
    defaultUpstreamBackgroundsPath,
    defaultUpstreamFeatsPath,
    defaultUpstreamEquipmentPath,
    defaultUpstreamSpellsPath,
  ]);

  function isAllowedUpstreamPath(path: string) {
    return (
      allowedUpstreamExactPaths.has(path) ||
      allowedUpstreamPrefixes.some((prefix) => path.startsWith(prefix))
    );
  }

  function sendJson(
    response: import("node:http").ServerResponse,
    statusCode: number,
    payload: unknown,
  ) {
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

    if (request.method === "GET" && url.pathname === "/classes") {
      sendJson(response, 200, buildClassesDataset());
      return;
    }

    const classMatch = url.pathname.match(/^\/classes\/([^/]+)$/);
    if (request.method === "GET" && classMatch) {
      const classEntry = findClassEntry(decodeURIComponent(classMatch[1] ?? ""));

      if (!classEntry) {
        sendJson(response, 404, { error: "Class not found", path: url.pathname });
        return;
      }

      sendJson(response, 200, {
        ...classEntry,
        subclasses: buildBuilderOptionsPayload().subclasses[classEntry.id] ?? [],
      });
      return;
    }

    const subclassesMatch = url.pathname.match(/^\/classes\/([^/]+)\/subclasses$/);
    if (request.method === "GET" && subclassesMatch) {
      const classEntry = findClassEntry(decodeURIComponent(subclassesMatch[1] ?? ""));

      if (!classEntry) {
        sendJson(response, 404, { error: "Class not found", path: url.pathname });
        return;
      }

      sendJson(response, 200, {
        ...buildDatasetMeta(),
        classId: classEntry.id,
        items: buildBuilderOptionsPayload().subclasses[classEntry.id] ?? [],
      });
      return;
    }

    const classSpellsMatch = url.pathname.match(/^\/classes\/([^/]+)\/spells$/);
    if (request.method === "GET" && classSpellsMatch) {
      const classEntry = findClassEntry(decodeURIComponent(classSpellsMatch[1] ?? ""));

      if (!classEntry) {
        sendJson(response, 404, { error: "Class not found", path: url.pathname });
        return;
      }

      sendJson(response, 200, buildClassSpellDataset(classEntry.id));
      return;
    }

    if (request.method === "GET" && url.pathname === "/spells") {
      const classEntry = url.searchParams.get("class")
        ? findClassEntry(url.searchParams.get("class") ?? "")
        : null;
      const levelParam = url.searchParams.get("level");
      const level = levelParam === null ? null : Number.parseInt(levelParam, 10);

      sendJson(
        response,
        200,
        buildSpellsIndex({
          classId: classEntry?.id ?? null,
          level: Number.isNaN(level ?? Number.NaN) ? null : level,
          school: url.searchParams.get("school"),
        }),
      );
      return;
    }

    const spellMatch = url.pathname.match(/^\/spells\/([^/]+)$/);
    if (request.method === "GET" && spellMatch) {
      const payload = buildSpellDetails(decodeURIComponent(spellMatch[1] ?? ""));

      if (!payload) {
        sendJson(response, 404, { error: "Spell not found", path: url.pathname });
        return;
      }

      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "GET" && url.pathname === "/items") {
      sendJson(response, 200, buildItemsIndex());
      return;
    }

    const itemMatch = url.pathname.match(/^\/items\/([^/]+)$/);
    if (request.method === "GET" && itemMatch) {
      const payload = buildItemDetails(decodeURIComponent(itemMatch[1] ?? ""));

      if (!payload) {
        sendJson(response, 404, { error: "Item not found", path: url.pathname });
        return;
      }

      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "GET" && url.pathname === "/datasets/meta") {
      sendJson(response, 200, buildDatasetMeta());
      return;
    }

    if (request.method === "GET" && url.pathname === "/datasets/classes") {
      const sourceMode = url.searchParams.get("source") ?? "local";

      if (sourceMode === "local") {
        sendJson(response, 200, buildClassesDataset());
        return;
      }

      const upstreamPath = url.searchParams.get("upstreamPath") ?? defaultUpstreamClassesPath;

      if (!isAllowedUpstreamPath(upstreamPath)) {
        sendJson(response, 400, {
          error: "Upstream path not allowed for classes dataset",
          path: upstreamPath,
          allowedPrefixes: allowedUpstreamPrefixes,
        });
        return;
      }

      try {
        const cacheKey = `classes:${upstreamPath}`;
        const cachedPayload = upstreamCache.get(cacheKey);
        const upstreamPayload = cachedPayload ?? (await fiveToolsClient.get(upstreamPath));

        if (cachedPayload === undefined) {
          upstreamCache.set(cacheKey, upstreamPayload);
        }

        const normalized = normalizeUpstreamClassesPayload(upstreamPayload);

        if (sourceMode === "upstream") {
          sendJson(response, 200, normalized);
          return;
        }

        sendJson(response, 200, buildHybridClassesDataset(normalized.items));
      } catch (error) {
        if (sourceMode === "upstream") {
          sendJson(response, 502, {
            error: "Upstream classes request failed",
            path: upstreamPath,
            detail: error instanceof Error ? error.message : "Unknown upstream error",
          });
          return;
        }

        sendJson(response, 200, {
          ...buildClassesDataset(),
          warning: "Hybrid upstream unavailable, local dataset returned",
          attemptedUpstreamPath: upstreamPath,
        });
      }

      return;
    }

    if (request.method === "GET" && url.pathname === "/datasets/races") {
      const sourceMode = url.searchParams.get("source") ?? "local";

      if (sourceMode === "local") {
        sendJson(response, 200, buildRacesDataset());
        return;
      }

      const upstreamPath = url.searchParams.get("upstreamPath") ?? defaultUpstreamRacesPath;

      if (!isAllowedUpstreamPath(upstreamPath)) {
        sendJson(response, 400, {
          error: "Upstream path not allowed for races dataset",
          path: upstreamPath,
          allowedPrefixes: allowedUpstreamPrefixes,
        });
        return;
      }

      try {
        const cacheKey = `races:${upstreamPath}`;
        const cachedPayload = upstreamCache.get(cacheKey);
        const upstreamPayload = cachedPayload ?? (await fiveToolsClient.get(upstreamPath));

        if (cachedPayload === undefined) {
          upstreamCache.set(cacheKey, upstreamPayload);
        }

        const normalized = normalizeUpstreamRacesPayload(upstreamPayload);

        if (sourceMode === "upstream") {
          sendJson(response, 200, normalized);
          return;
        }

        sendJson(response, 200, buildHybridRacesDataset(normalized.items));
      } catch (error) {
        if (sourceMode === "upstream") {
          sendJson(response, 502, {
            error: "Upstream races request failed",
            path: upstreamPath,
            detail: error instanceof Error ? error.message : "Unknown upstream error",
          });
          return;
        }

        sendJson(response, 200, {
          ...buildRacesDataset(),
          warning: "Hybrid upstream unavailable, local dataset returned",
          attemptedUpstreamPath: upstreamPath,
        });
      }

      return;
    }

    if (request.method === "GET" && url.pathname === "/datasets/backgrounds") {
      const sourceMode = url.searchParams.get("source") ?? "local";

      if (sourceMode === "local") {
        sendJson(response, 200, buildBackgroundsDataset());
        return;
      }

      const upstreamPath = url.searchParams.get("upstreamPath") ?? defaultUpstreamBackgroundsPath;

      if (!isAllowedUpstreamPath(upstreamPath)) {
        sendJson(response, 400, {
          error: "Upstream path not allowed for backgrounds dataset",
          path: upstreamPath,
          allowedPrefixes: allowedUpstreamPrefixes,
        });
        return;
      }

      try {
        const cacheKey = `backgrounds:${upstreamPath}`;
        const cachedPayload = upstreamCache.get(cacheKey);
        const upstreamPayload = cachedPayload ?? (await fiveToolsClient.get(upstreamPath));

        if (cachedPayload === undefined) {
          upstreamCache.set(cacheKey, upstreamPayload);
        }

        const normalized = normalizeUpstreamBackgroundsPayload(upstreamPayload);

        if (sourceMode === "upstream") {
          sendJson(response, 200, normalized);
          return;
        }

        sendJson(response, 200, buildHybridBackgroundsDataset(normalized.items));
      } catch (error) {
        if (sourceMode === "upstream") {
          sendJson(response, 502, {
            error: "Upstream backgrounds request failed",
            path: upstreamPath,
            detail: error instanceof Error ? error.message : "Unknown upstream error",
          });
          return;
        }

        sendJson(response, 200, {
          ...buildBackgroundsDataset(),
          warning: "Hybrid upstream unavailable, local dataset returned",
          attemptedUpstreamPath: upstreamPath,
        });
      }

      return;
    }

    if (request.method === "GET" && url.pathname === "/datasets/feats") {
      const sourceMode = url.searchParams.get("source") ?? "local";

      if (sourceMode === "local") {
        sendJson(response, 200, buildFeatsDataset());
        return;
      }

      const upstreamPath = url.searchParams.get("upstreamPath") ?? defaultUpstreamFeatsPath;

      if (!isAllowedUpstreamPath(upstreamPath)) {
        sendJson(response, 400, {
          error: "Upstream path not allowed for feats dataset",
          path: upstreamPath,
          allowedPrefixes: allowedUpstreamPrefixes,
        });
        return;
      }

      try {
        const cacheKey = `feats:${upstreamPath}`;
        const cachedPayload = upstreamCache.get(cacheKey);
        const upstreamPayload = cachedPayload ?? (await fiveToolsClient.get(upstreamPath));

        if (cachedPayload === undefined) {
          upstreamCache.set(cacheKey, upstreamPayload);
        }

        const normalized = normalizeUpstreamFeatsPayload(upstreamPayload);

        if (sourceMode === "upstream") {
          sendJson(response, 200, normalized);
          return;
        }

        sendJson(response, 200, buildHybridFeatsDataset(normalized.items));
      } catch (error) {
        if (sourceMode === "upstream") {
          sendJson(response, 502, {
            error: "Upstream feats request failed",
            path: upstreamPath,
            detail: error instanceof Error ? error.message : "Unknown upstream error",
          });
          return;
        }

        sendJson(response, 200, {
          ...buildFeatsDataset(),
          warning: "Hybrid upstream unavailable, local dataset returned",
          attemptedUpstreamPath: upstreamPath,
        });
      }

      return;
    }

    if (request.method === "GET" && url.pathname === "/datasets/equipment") {
      const sourceMode = url.searchParams.get("source") ?? "local";

      if (sourceMode === "local") {
        sendJson(response, 200, buildEquipmentDataset());
        return;
      }

      const upstreamPath = url.searchParams.get("upstreamPath") ?? defaultUpstreamEquipmentPath;

      if (!isAllowedUpstreamPath(upstreamPath)) {
        sendJson(response, 400, {
          error: "Upstream path not allowed for equipment dataset",
          path: upstreamPath,
          allowedPrefixes: allowedUpstreamPrefixes,
        });
        return;
      }

      try {
        const cacheKey = `equipment:${upstreamPath}`;
        const cachedPayload = upstreamCache.get(cacheKey);
        const upstreamPayload = cachedPayload ?? (await fiveToolsClient.get(upstreamPath));

        if (cachedPayload === undefined) {
          upstreamCache.set(cacheKey, upstreamPayload);
        }

        const normalized = normalizeUpstreamEquipmentPayload(upstreamPayload);

        if (sourceMode === "upstream") {
          sendJson(response, 200, normalized);
          return;
        }

        sendJson(response, 200, buildHybridEquipmentDataset(normalized));
      } catch (error) {
        if (sourceMode === "upstream") {
          sendJson(response, 502, {
            error: "Upstream equipment request failed",
            path: upstreamPath,
            detail: error instanceof Error ? error.message : "Unknown upstream error",
          });
          return;
        }

        sendJson(response, 200, {
          ...buildEquipmentDataset(),
          warning: "Hybrid upstream unavailable, local dataset returned",
          attemptedUpstreamPath: upstreamPath,
        });
      }

      return;
    }

    if (request.method === "GET" && url.pathname === "/datasets/spells") {
      const sourceMode = url.searchParams.get("source") ?? "local";

      if (sourceMode === "local") {
        sendJson(response, 200, buildSpellsDataset());
        return;
      }

      const upstreamPath = url.searchParams.get("upstreamPath") ?? defaultUpstreamSpellsPath;

      if (!isAllowedUpstreamPath(upstreamPath)) {
        sendJson(response, 400, {
          error: "Upstream path not allowed for spells dataset",
          path: upstreamPath,
          allowedPrefixes: allowedUpstreamPrefixes,
        });
        return;
      }

      try {
        const cacheKey = `spells:${upstreamPath}`;
        const cachedPayload = upstreamCache.get(cacheKey);
        const upstreamPayload = cachedPayload ?? (await fiveToolsClient.get(upstreamPath));

        if (cachedPayload === undefined) {
          upstreamCache.set(cacheKey, upstreamPayload);
        }

        const normalized = normalizeUpstreamSpellsPayload(upstreamPayload);

        if (sourceMode === "upstream") {
          sendJson(response, 200, normalized);
          return;
        }

        sendJson(response, 200, buildHybridSpellsDataset(normalized));
      } catch (error) {
        if (sourceMode === "upstream") {
          sendJson(response, 502, {
            error: "Upstream spells request failed",
            path: upstreamPath,
            detail: error instanceof Error ? error.message : "Unknown upstream error",
          });
          return;
        }

        sendJson(response, 200, {
          ...buildSpellsDataset(),
          warning: "Hybrid upstream unavailable, local dataset returned",
          attemptedUpstreamPath: upstreamPath,
        });
      }

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

  return { server, fiveToolsClient, upstreamCache };
}
