import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import { createApiServer } from "./server.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
const { server } = createApiServer();

const currentModulePath = fileURLToPath(import.meta.url);
const entryPath = process.argv[1] ? resolve(process.argv[1]) : "";
const isDirectRun = entryPath !== "" && currentModulePath === entryPath;

if (isDirectRun) {
  server.listen(port, "127.0.0.1", () => {
    console.log(`Bertini's Vault API listening on http://127.0.0.1:${port}`);
  });
}

export { createApiServer };
