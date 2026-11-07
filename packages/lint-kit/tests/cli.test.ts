import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

  it("prints help when no command or options are provided", () => {
    const result = spawnSync(process.execPath, [cliPath], {
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("check [...files]");
  });

  it.each([
    ["unknown command", "not-a-command", "Unknown command `not-a-command`"],
    ["unknown option", "--bogus", "Unknown option `--bogus`"],
  ])("rejects an %s", (_label, argument, message) => {
    const result = spawnSync(process.execPath, [cliPath, argument], {
      encoding: "utf8",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(message);
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

  it("returns a failing exit code for style violations in hidden directories", async () => {
    const cwd = await createProject();
    await writeFile(
      resolve(cwd, "stylelint.config.mjs"),
      'export default { rules: { "color-no-invalid-hex": true } };\n',
    );
    await mkdir(resolve(cwd, ".hidden"));
    await writeFile(
      resolve(cwd, ".hidden", "invalid.css"),
      ".example { color: #ggg; }\n",
    );

    const result = spawnSync(
      process.execPath,
      [cliPath, "check", "--cwd", cwd, "--stylelint"],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    const output = `${result.stdout}\n${result.stderr}`;
    expect(result.status).not.toBe(0);
    expect(output).toContain("invalid.css");
    expect(output).toContain("color-no-invalid-hex");
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
