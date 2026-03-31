import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const command = isWindows ? "cmd.exe" : "corepack";

const processes = [
  {
    name: "api",
    args: isWindows ? ["/c", "corepack", "pnpm", "api:dev"] : ["pnpm", "api:dev"],
  },
  {
    name: "web",
    args: isWindows ? ["/c", "corepack", "pnpm", "web:dev"] : ["pnpm", "web:dev"],
  },
];

const children = [];
let shuttingDown = false;

function stopAll(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }

  setTimeout(() => {
    process.exit(code);
  }, 250);
}

for (const processConfig of processes) {
  const child = spawn(command, processConfig.args, {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    if (signal || code) {
      console.error(`[${processConfig.name}] exited with ${signal ?? code}`);
      stopAll(code ?? 1);
    }
  });

  child.on("error", (error) => {
    console.error(`[${processConfig.name}] failed to start: ${error.message}`);
    stopAll(1);
  });

  children.push(child);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
