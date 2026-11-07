import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import packageJson from "../package.json" with { type: "json" };

const cliPath = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
const tempDirectories: string[] = [];

async function createProject() {
  const cwd = await mkdtemp(resolve(tmpdir(), "lint-kit-cli-"));
  tempDirectories.push(cwd);
  await writeFile(
    resolve(cwd, ".prettierrc.json"),
    JSON.stringify({ singleQuote: true }),
  );
  return cwd;
}

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) => {
      return rm(directory, { force: true, recursive: true });
    }),
  );
});

describe("CLI entrypoint", () => {
  it("prints help and version through the executable entrypoint", () => {
    const help = spawnSync(process.execPath, [cliPath, "--help"], {
      encoding: "utf8",
    });
    const version = spawnSync(process.execPath, [cliPath, "--version"], {
      encoding: "utf8",
    });

    expect(help.status).toBe(0);
    expect(help.stdout).toContain("check [...files]");
    expect(help.stdout).toContain("staged");
    expect(version.status).toBe(0);
    expect(version.stdout).toContain(`lint-kit/${packageJson.version}`);
  });

  it("applies the selected formatter in the requested project directory", async () => {
    const cwd = await createProject();
    const filePath = resolve(cwd, "example.js");
    await writeFile(filePath, 'const message = "hello";\n');

    const result = spawnSync(
      process.execPath,
      [cliPath, "check", "--cwd", cwd, "--prettier", "--fix", "example.js"],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    expect(result.status).toBe(0);
    expect(await readFile(filePath, "utf8")).toBe("const message = 'hello';\n");
    expect(result.stdout).toContain("检查完成");
  });

  it("returns a failing exit code when a selected check finds unformatted code", async () => {
    const cwd = await createProject();
    await writeFile(resolve(cwd, "example.js"), 'const message = "hello";\n');

    const result = spawnSync(
      process.execPath,
      [cliPath, "check", "--cwd", cwd, "--prettier", "example.js"],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("检查完成");
  });
});
