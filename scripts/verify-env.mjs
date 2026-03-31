import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const isWindows = process.platform === "win32";
const command = isWindows ? "cmd.exe" : "corepack";
const root = process.cwd();

const checks = [
  {
    name: "Node.js",
    ok: Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10) >= 22,
    detail: `Detected ${process.versions.node}; recommended 22+`,
  },
  {
    name: "apps/api/.env.example",
    ok: existsSync(resolve(root, "apps/api/.env.example")),
    detail: "Expected example API environment file",
  },
  {
    name: "apps/web/.env.example",
    ok: existsSync(resolve(root, "apps/web/.env.example")),
    detail: "Expected example web environment file",
  },
];

function checkCommand(args, label) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: false,
  });

  checks.push({
    name: label,
    ok: result.status === 0 && !result.error,
    detail:
      result.error?.message ||
      (result.stdout || result.stderr || "").trim() ||
      `Exit ${result.status ?? "unknown"}`,
  });
}

checkCommand(isWindows ? ["/c", "corepack", "pnpm", "--version"] : ["pnpm", "--version"], "pnpm via corepack");

const hasFailures = checks.some((check) => !check.ok);

console.log("Bertini's Vault environment check");
for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}: ${check.detail}`);
}

if (hasFailures) {
  process.exitCode = 1;
}
