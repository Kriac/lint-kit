import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { dirname, relative, resolve, sep } from "node:path";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import {
  writeLinterConfigs,
  writeVscodeConfig,
} from "../src/cli/init-utils.ts";
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

function runCheck(cwd: string, ...args: string[]) {
  return spawnSync(
    process.execPath,
    [cliPath, "check", "--cwd", cwd, ...args],
    {
      encoding: "utf8",
      timeout: 10_000,
    },
  );
}

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) => {
      return rm(directory, { force: true, recursive: true });
    }),
  );
});

describe("CLI entrypoint", () => {
  it("generates a lint-staged configuration", async () => {
    const cwd = await createProject();

    await writeLinterConfigs(cwd, ["lint-staged"]);

    const config = await readFile(
      resolve(cwd, "lint-staged.config.mjs"),
      "utf8",
    );
    expect(config).toContain(
      '"*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue,css,scss,less,html,json,jsonc,json5,yaml,yml,md,mdx,graphql,gql}": "lint-kit check"',
    );
  });

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

    const result = runCheck(cwd, "--prettier", "--fix", "example.js");

    expect(result.status).toBe(0);
    expect(await readFile(filePath, "utf8")).toBe("const message = 'hello';\n");
    expect(result.stdout).toContain("检查完成");
  });

  it("starts the other tools before the first check finishes", async () => {
    const cwd = await createProject();
    await writeFile(resolve(cwd, "example.js"), "export {};\n");
    await writeFile(resolve(cwd, "example.css"), ".example {}\n");
    await writeFile(
      resolve(cwd, "eslint.config.mjs"),
      `import { access } from "node:fs/promises";
import { setTimeout } from "node:timers/promises";
const ready = new URL("./stylelint-ready", import.meta.url);
const deadline = Date.now() + 5000;
while (true) {
  try {
    await access(ready);
    break;
  } catch (error) {
    if (Date.now() >= deadline || error.code !== "ENOENT") throw error;
    await setTimeout(25);
  }
}
export default [{ rules: { "no-debugger": "error" } }];
`,
    );
    await writeFile(
      resolve(cwd, "stylelint.config.mjs"),
      `import { writeFile } from "node:fs/promises";
await writeFile(new URL("./stylelint-ready", import.meta.url), "");
export default { rules: { "color-no-invalid-hex": true } };
`,
    );

    const result = runCheck(
      cwd,
      "--eslint",
      "--stylelint",
      "example.js",
      "example.css",
    );
    expect(result.status, result.stderr).toBe(0);
  }, 15_000);

  it("finishes formatting before the next tool reads the same file in fix mode", async () => {
    const cwd = await createProject();
    const filePath = resolve(cwd, "example.js");
    await writeFile(filePath, 'const message = "hello";\n');
    await writeFile(
      resolve(cwd, "eslint.config.mjs"),
      `import { readFile } from "node:fs/promises";
const source = await readFile(new URL("./example.js", import.meta.url), "utf8");
if (!source.includes("'hello'")) throw new Error("Prettier has not finished");
export default [{ rules: { "no-debugger": "error" } }];
`,
    );

    const result = runCheck(cwd, "--fix", "example.js");
    expect(result.status, result.stderr).toBe(0);
    expect(await readFile(filePath, "utf8")).toBe("const message = 'hello';\n");
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

    const result = runCheck(cwd, "--stylelint");

    const output = `${result.stdout}\n${result.stderr}`;
    expect(result.status).not.toBe(0);
    expect(output).toContain("invalid.css");
    expect(output).toContain("color-no-invalid-hex");
  });

  it("uses lint-kit dependencies for the VS Code extensions", async () => {
    const cwd = await createProject();
    const packagePath = (name: string) => {
      return fileURLToPath(import.meta.resolve(`${name}/package.json`));
    };
    const expectedPackagePath = (name: string) => {
      return relative(cwd, dirname(packagePath(name)))
        .split(sep)
        .join("/");
    };
    const expectedNodeModulesPath = (name: string) => {
      return relative(cwd, dirname(dirname(packagePath(name))))
        .split(sep)
        .join("/");
    };

    await writeVscodeConfig(cwd, ["eslint", "prettier", "stylelint"]);

    const settings = JSON.parse(
      await readFile(resolve(cwd, ".vscode", "settings.json"), "utf8"),
    );
    expect(settings).toMatchObject({
      "eslint.nodePath": expectedNodeModulesPath("eslint"),
      "prettier.prettierPath": expectedPackagePath("prettier"),
      "stylelint.stylelintPath": expectedPackagePath("stylelint"),
    });

    for (const name of ["eslint", "prettier", "stylelint"]) {
      const settingsPath =
        name === "eslint"
          ? settings["eslint.nodePath"]
          : (settings[`${name}.prettierPath`] ??
            settings[`${name}.stylelintPath`]);
      const installedPackagePath =
        name === "eslint"
          ? resolve(cwd, settingsPath, name, "package.json")
          : resolve(cwd, settingsPath, "package.json");
      expect(
        JSON.parse(await readFile(installedPackagePath, "utf8")),
      ).toMatchObject({ name });
    }
  });

  it("returns a failing exit code when a selected check finds unformatted code", async () => {
    const cwd = await createProject();
    await writeFile(resolve(cwd, "example.js"), 'const message = "hello";\n');

    const result = runCheck(cwd, "--prettier", "example.js");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("检查完成");
  });

  it.each([
    { mode: "check", flags: [] },
    { mode: "fix", flags: ["--fix"] },
  ])("rechecks ESLint rule dependencies in $mode mode", async ({ flags }) => {
    const cwd = await createProject();
    const dependencyPath = resolve(cwd, "dependency.txt");
    await writeFile(resolve(cwd, "example.js"), "export {};\n");
    await writeFile(dependencyPath, "valid");
    await writeFile(
      resolve(cwd, "eslint.config.mjs"),
      `import { readFileSync } from "node:fs";
const dependency = new URL("./dependency.txt", import.meta.url);
const rule = {
  create(context) {
    return {
      Program(node) {
        if (readFileSync(dependency, "utf8") !== "valid") {
          context.report({ node, message: "Invalid dependency" });
        }
      },
    };
  },
};
export default [{
  plugins: { local: { rules: { dependency: rule } } },
  rules: { "local/dependency": "error" },
}];
`,
    );

    const args = ["--eslint", ...flags, "example.js"];
    const firstCheck = runCheck(cwd, ...args);
    expect(firstCheck.status, firstCheck.stderr).toBe(0);

    await writeFile(dependencyPath, "invalid");
    const changedCheck = runCheck(cwd, ...args);
    expect(changedCheck.status).toBe(1);
    expect(changedCheck.stdout).toContain("local/dependency");
  });

  it("persists Prettier and Stylelint caches and rechecks changed files", async () => {
    const cwd = await createProject();
    const scriptPath = resolve(cwd, "example.js");
    const stylePath = resolve(cwd, "example.css");
    await writeFile(scriptPath, "const message = 'hello';\n");
    await writeFile(stylePath, ".example {\n  color: #fff;\n}\n");
    await writeFile(
      resolve(cwd, "stylelint.config.mjs"),
      'export default { rules: { "color-no-invalid-hex": true } };\n',
    );

    const targets = ["example.js", "example.css"];
    const firstCheck = runCheck(cwd, ...targets);
    expect(firstCheck.status, firstCheck.stderr).toBe(0);
    const cacheFiles = await readdir(
      resolve(cwd, "node_modules", ".cache", "lint-kit"),
    );
    expect(cacheFiles).toEqual(
      expect.arrayContaining(["prettier-check.json", "stylelint-check.json"]),
    );

    const repeatedCheck = runCheck(cwd, ...targets);
    expect(repeatedCheck.status, repeatedCheck.stderr).toBe(0);

    await writeFile(scriptPath, 'const message = "hello";\n');
    await writeFile(stylePath, ".example {\n  color: #ggg;\n}\n");
    const changedCheck = runCheck(cwd, ...targets);
    expect(changedCheck.status).not.toBe(0);
    expect(changedCheck.stderr).toContain("Code style issues found");
    expect(changedCheck.stderr).toContain("color-no-invalid-hex");
  });
});
