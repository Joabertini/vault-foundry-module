import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";

import { createApiServer } from "../dist/index.js";

async function startServer() {
  const { server } = createApiServer({ baseUrl: "https://example.invalid" });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Unable to resolve test server address");
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

async function startServerWithHooks() {
  const api = createApiServer({ baseUrl: "https://example.invalid" });
  api.server.listen(0, "127.0.0.1");
  await once(api.server, "listening");
  const address = api.server.address();

  if (!address || typeof address === "string") {
    throw new Error("Unable to resolve test server address");
  }

  return {
    ...api,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

test("GET /health returns service metadata", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, "ok");
    assert.equal(payload.app, "@bertinis-vault/api");
  } finally {
    server.close();
  }
});

test("GET /datasets/builder-options returns canonical sections", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/datasets/builder-options`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(payload.classes));
    assert.ok(Array.isArray(payload.races));
    assert.ok(Array.isArray(payload.backgrounds));
    assert.ok(Array.isArray(payload.feats));
    assert.ok(Array.isArray(payload.spells.cantrips));
    assert.ok(Array.isArray(payload.spells.spells));
    assert.ok(Array.isArray(payload.equipment.gear));
    assert.ok(Array.isArray(payload.equipment.armor));
    assert.ok(Array.isArray(payload.equipment.weapons));
  } finally {
    server.close();
  }
});

test("GET /classes returns enriched class metadata", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/classes`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(payload.items));
    assert.ok(payload.items.some((entry) => entry.id === "wizard" && entry.spellcastingAbility === "int"));
  } finally {
    server.close();
  }
});

test("GET /classes/:name/subclasses returns subclass options for the class", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/classes/wizard/subclasses`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.classId, "wizard");
    assert.ok(payload.items.some((entry) => entry.id === "school-of-evocation"));
  } finally {
    server.close();
  }
});

test("GET /classes/:name/spells returns class spell options", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/classes/wizard/spells`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.classId, "wizard");
    assert.ok(payload.items.some((entry) => entry.id === "shield"));
  } finally {
    server.close();
  }
});

test("GET /spells supports class and level filters", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/spells?class=wizard&level=1`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(payload.items.length > 0);
    assert.ok(payload.items.every((entry) => entry.level === 1));
    assert.ok(payload.items.every((entry) => entry.classes.includes("wizard")));
  } finally {
    server.close();
  }
});

test("GET /spells/:name returns detailed spell metadata", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/spells/shield`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.id, "shield");
    assert.ok(Array.isArray(payload.classes));
    assert.ok(payload.classes.includes("wizard"));
  } finally {
    server.close();
  }
});

test("GET /items and /items/:name expose flattened equipment data", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const indexResponse = await fetch(`${baseUrl}/items`);
    const indexPayload = await indexResponse.json();
    const detailResponse = await fetch(`${baseUrl}/items/quarterstaff`);
    const detailPayload = await detailResponse.json();

    assert.equal(indexResponse.status, 200);
    assert.ok(indexPayload.items.some((entry) => entry.id === "quarterstaff"));
    assert.equal(detailResponse.status, 200);
    assert.equal(detailPayload.id, "quarterstaff");
    assert.equal(detailPayload.category, "weapon");
  } finally {
    server.close();
  }
});

test("GET /datasets/spells returns cantrips and leveled spells", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/datasets/spells`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(payload.cantrips));
    assert.ok(Array.isArray(payload.spells));
    assert.ok(payload.cantrips.every((entry) => entry.level === 0));
    assert.ok(payload.spells.every((entry) => entry.level > 0));
  } finally {
    server.close();
  }
});

test("GET /datasets/equipment returns gear, armor, and weapons", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/datasets/equipment`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(payload.gear));
    assert.ok(Array.isArray(payload.armor));
    assert.ok(Array.isArray(payload.weapons));
    assert.ok(payload.weapons.some((entry) => entry.attackType));
  } finally {
    server.close();
  }
});

test("GET /datasets/classes rejects disallowed upstreamPath", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(
      `${baseUrl}/datasets/classes?source=upstream&upstreamPath=/forbidden/classes.json`,
    );
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.error, /not allowed/i);
  } finally {
    server.close();
  }
});

test("GET /upstream/json requires path query param", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/upstream/json`);
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.error, /missing required query param/i);
  } finally {
    server.close();
  }
});

test("GET /upstream/json rejects disallowed paths", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/upstream/json?path=/forbidden/data.json`);
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.error, /not allowed/i);
  } finally {
    server.close();
  }
});

test("GET /upstream/json caches upstream payloads after the first fetch", async () => {
  const { server, baseUrl, fiveToolsClient } = await startServerWithHooks();
  let calls = 0;

  fiveToolsClient.get = async (path) => {
    calls += 1;
    return { path, ok: true, calls };
  };

  try {
    const firstResponse = await fetch(`${baseUrl}/upstream/json?path=/data/test-cache.json`);
    const firstPayload = await firstResponse.json();
    const secondResponse = await fetch(`${baseUrl}/upstream/json?path=/data/test-cache.json`);
    const secondPayload = await secondResponse.json();

    assert.equal(firstResponse.status, 200);
    assert.equal(firstPayload.source, "upstream");
    assert.equal(secondResponse.status, 200);
    assert.equal(secondPayload.source, "cache");
    assert.equal(calls, 1);
    assert.deepEqual(secondPayload.payload, firstPayload.payload);
  } finally {
    server.close();
  }
});

test("GET /datasets/spells in hybrid mode falls back cleanly when upstream fails", async () => {
  const { server, baseUrl, fiveToolsClient } = await startServerWithHooks();

  fiveToolsClient.get = async () => {
    throw new Error("simulated upstream outage");
  };

  try {
    const response = await fetch(`${baseUrl}/datasets/spells?source=hybrid`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.warning, "Hybrid upstream unavailable, local dataset returned");
    assert.ok(Array.isArray(payload.cantrips));
    assert.ok(Array.isArray(payload.spells));
    assert.equal(payload.attemptedUpstreamPath, "/spells");
  } finally {
    server.close();
  }
});

test("GET /datasets/spells in upstream mode preserves richer spell metadata when available", async () => {
  const { server, baseUrl, fiveToolsClient } = await startServerWithHooks();

  fiveToolsClient.get = async () => ({
    spells: [
      {
        name: "Magic Missile",
        level: 1,
        school: "evo",
        summary: "Three glowing darts of magical force.",
        castingTime: "1 action",
        range: "120 feet",
        duration: "Instantaneous",
        components: ["V", "S"],
        classes: ["wizard", "sorcerer"],
      },
    ],
  });

  try {
    const response = await fetch(`${baseUrl}/datasets/spells?source=upstream`);
    const payload = await response.json();
    const magicMissile = payload.spells.find((entry) => entry.id === "magic-missile");

    assert.equal(response.status, 200);
    assert.equal(magicMissile.school, "evo");
    assert.equal(magicMissile.summary, "Three glowing darts of magical force.");
    assert.equal(magicMissile.castingTimeLabel, "1 action");
    assert.equal(magicMissile.rangeLabel, "120 feet");
    assert.equal(magicMissile.durationLabel, "Instantaneous");
    assert.equal(magicMissile.componentsLabel, "V, S");
    assert.deepEqual(magicMissile.classes, ["wizard", "sorcerer"]);
  } finally {
    server.close();
  }
});

test("GET /datasets/classes in upstream mode reports upstream failures as 502", async () => {
  const { server, baseUrl, fiveToolsClient } = await startServerWithHooks();

  fiveToolsClient.get = async () => {
    throw new Error("simulated upstream outage");
  };

  try {
    const response = await fetch(`${baseUrl}/datasets/classes?source=upstream`);
    const payload = await response.json();

    assert.equal(response.status, 502);
    assert.equal(payload.error, "Upstream classes request failed");
    assert.match(payload.detail, /simulated upstream outage/i);
    assert.equal(payload.path, "/classes");
  } finally {
    server.close();
  }
});

test("unknown routes return 404 payloads", async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/does-not-exist`);
    const payload = await response.json();

    assert.equal(response.status, 404);
    assert.equal(payload.error, "Not found");
    assert.equal(payload.path, "/does-not-exist");
  } finally {
    server.close();
  }
});
