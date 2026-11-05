import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { CANCEL_SYMBOL, multiselect } from "@clack/prompts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { init } from "../src/cli/init.ts";
import { output } from "../src/cli/output.ts";

vi.mock(import("@clack/prompts"), async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, multiselect: vi.fn() };
});

describe("init 命令", () => {
  let cwd: string;
  let originalExitCode: typeof process.exitCode;

  beforeEach(async () => {
    cwd = await mkdtemp(join(tmpdir(), "lint-kit-init-"));
    originalExitCode = process.exitCode;
    vi.resetAllMocks();
    vi.mocked(multiselect).mockResolvedValue([]);
    vi.spyOn(output, "info").mockImplementation(() => {
      return undefined;
    });
    vi.spyOn(output, "success").mockImplementation(() => {
      return undefined;
    });
    vi.spyOn(output, "warn").mockImplementation(() => {
      return undefined;
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.exitCode = originalExitCode;
    await rm(cwd, { recursive: true, force: true });
  });

  it("只为选择的工具生成相应配置", async () => {
    vi.mocked(multiselect).mockResolvedValueOnce(["eslint", "commitlint"]);

    await init({ cwd });

    expect(multiselect).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        options: [
          { value: "prettier", label: "Prettier" },
          { value: "eslint", label: "ESLint" },
          { value: "stylelint", label: "Stylelint" },
          { value: "commitlint", label: "Commitlint" },
        ],
        initialValues: ["prettier", "eslint", "stylelint", "commitlint"],
        required: false,
      }),
    );
    expect(multiselect).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        options: [{ label: "ESLint", value: "eslint" }],
        initialValues: ["eslint"],
        required: false,
      }),
    );
    expect((await readdir(cwd)).sort()).toEqual([
      "commitlint.config.mjs",
      "eslint.config.mjs",
    ]);
    expect(await readFile(join(cwd, "eslint.config.mjs"), "utf8")).toBe(
      'import config from "@kriac/lint-kit/eslint";\n\nexport default config();\n',
    );
    expect(await readFile(join(cwd, "commitlint.config.mjs"), "utf8")).toBe(
      'import config from "@kriac/lint-kit/commitlint";\n\nexport default config();\n',
    );
    expect(output.success).toHaveBeenCalledTimes(2);
    expect(output.success).toHaveBeenNthCalledWith(
      1,
      "已生成 eslint.config.mjs",
    );
    expect(output.success).toHaveBeenNthCalledWith(
      2,
      "已生成 commitlint.config.mjs",
    );
  });

  it("生成 Stylelint 配置", async () => {
    vi.mocked(multiselect).mockResolvedValueOnce(["stylelint"]);

    await init({ cwd });

    expect(await readFile(join(cwd, "stylelint.config.mjs"), "utf8")).toBe(
      'export default {\n  extends: ["@kriac/lint-kit/stylelint"],\n};\n',
    );
    expect(await readdir(cwd)).toEqual(["stylelint.config.mjs"]);
  });

  it("选择 Prettier 时生成配置并提供 Prettier 插件集成", async () => {
    vi.mocked(multiselect)
      .mockResolvedValueOnce(["prettier"])
      .mockResolvedValueOnce(["prettier"]);

    await init({ cwd });

    expect(multiselect).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        options: [{ label: "Prettier", value: "prettier" }],
        initialValues: ["prettier"],
      }),
    );
    expect(await readFile(join(cwd, "prettier.config.mjs"), "utf8")).toBe(
      "export default {};\n",
    );
    const settings = JSON.parse(
      await readFile(join(cwd, ".vscode", "settings.json"), "utf8"),
    );
    const extensions = JSON.parse(
      await readFile(join(cwd, ".vscode", "extensions.json"), "utf8"),
    );
    expect(settings).toEqual({
      "editor.codeActionsOnSave": {},
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.formatOnSave": true,
      "prettier.prettierPath":
        "node_modules/@kriac/lint-kit/node_modules/prettier",
    });
    expect(extensions.recommendations).toEqual(["esbenp.prettier-vscode"]);
    expect(output.warn).not.toHaveBeenCalled();
  });

  it("不覆盖已有配置并继续生成其他文件", async () => {
    await writeFile(join(cwd, "eslint.config.mjs"), "existing");
    vi.mocked(multiselect).mockResolvedValueOnce(["eslint", "stylelint"]);

    await init({ cwd });

    expect(await readFile(join(cwd, "eslint.config.mjs"), "utf8")).toBe(
      "existing",
    );
    expect(await readdir(cwd)).toContain("stylelint.config.mjs");
    expect(output.success).toHaveBeenNthCalledWith(
      1,
      "已配置 eslint.config.mjs",
    );
    expect(output.success).toHaveBeenNthCalledWith(
      2,
      "已生成 stylelint.config.mjs",
    );
    expect(output.warn).not.toHaveBeenCalled();
  });

  it("所有工具配置已存在时逐个输出配置状态", async () => {
    await writeFile(join(cwd, "eslint.config.mjs"), "existing eslint");
    await writeFile(join(cwd, "stylelint.config.mjs"), "existing stylelint");
    vi.mocked(multiselect).mockResolvedValueOnce(["eslint", "stylelint"]);

    await init({ cwd });

    expect(await readFile(join(cwd, "eslint.config.mjs"), "utf8")).toBe(
      "existing eslint",
    );
    expect(await readFile(join(cwd, "stylelint.config.mjs"), "utf8")).toBe(
      "existing stylelint",
    );
    expect(output.success).toHaveBeenCalledTimes(2);
    expect(output.success).toHaveBeenNthCalledWith(
      1,
      "已配置 eslint.config.mjs",
    );
    expect(output.success).toHaveBeenNthCalledWith(
      2,
      "已配置 stylelint.config.mjs",
    );
    expect(output.warn).not.toHaveBeenCalled();
  });

  it("未选择工具和插件时不生成文件", async () => {
    vi.mocked(multiselect).mockResolvedValue([]);

    await init({ cwd });

    expect(multiselect).toHaveBeenCalledTimes(2);
    expect(await readdir(cwd)).toEqual([]);
    expect(output.info).toHaveBeenCalledExactlyOnceWith(
      "未选择任何工具，无需生成配置文件",
    );
  });

  it.each([
    {
      selection: ["prettier"],
      expected: ["esbenp.prettier-vscode"],
    },
    {
      selection: ["eslint"],
      expected: ["dbaeumer.vscode-eslint"],
    },
    {
      selection: ["stylelint"],
      expected: ["stylelint.vscode-stylelint"],
    },
    {
      selection: ["eslint", "stylelint"],
      expected: ["dbaeumer.vscode-eslint", "stylelint.vscode-stylelint"],
    },
  ])(
    "未选择工具时仍可集成 $selection 插件",
    async ({ selection, expected }) => {
      vi.mocked(multiselect)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(selection);

      await init({ cwd });

      expect(multiselect).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          options: [
            { label: "Prettier", value: "prettier" },
            { label: "ESLint", value: "eslint" },
            { label: "Stylelint", value: "stylelint" },
          ],
          initialValues: ["prettier", "eslint", "stylelint"],
          required: false,
        }),
      );
      expect(await readdir(cwd)).toEqual([".vscode"]);
      const extensions = JSON.parse(
        await readFile(join(cwd, ".vscode", "extensions.json"), "utf8"),
      );
      const settings = JSON.parse(
        await readFile(join(cwd, ".vscode", "settings.json"), "utf8"),
      );
      expect(extensions.recommendations).toEqual(expected);
      expect(settings["eslint.nodePath"] !== undefined).toBe(
        selection.includes("eslint"),
      );
      expect(settings["editor.defaultFormatter"] !== undefined).toBe(
        selection.includes("prettier"),
      );
      expect(settings["stylelint.stylelintPath"] !== undefined).toBe(
        selection.includes("stylelint"),
      );
      expect(output.info).not.toHaveBeenCalled();
      expect(output.success).toHaveBeenCalledTimes(2);
      expect(output.success).toHaveBeenNthCalledWith(
        1,
        `已更新 ${join(".vscode", "settings.json")}`,
      );
      expect(output.success).toHaveBeenNthCalledWith(
        2,
        `已更新 ${join(".vscode", "extensions.json")}`,
      );
    },
  );

  it("取消选择时不生成文件并返回取消退出码", async () => {
    vi.mocked(multiselect).mockResolvedValue(CANCEL_SYMBOL);

    await init({ cwd });

    expect(await readdir(cwd)).toEqual([]);
    expect(process.exitCode).toBe(130);
  });

  it("只集成用户勾选的 VS Code 插件", async () => {
    vi.mocked(multiselect)
      .mockResolvedValueOnce(["eslint", "stylelint"])
      .mockResolvedValueOnce(["stylelint"]);

    await init({ cwd });

    expect(multiselect).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        options: [
          { label: "ESLint", value: "eslint" },
          { label: "Stylelint", value: "stylelint" },
        ],
        initialValues: ["eslint", "stylelint"],
      }),
    );
    const settings = JSON.parse(
      await readFile(join(cwd, ".vscode", "settings.json"), "utf8"),
    );
    const extensions = JSON.parse(
      await readFile(join(cwd, ".vscode", "extensions.json"), "utf8"),
    );
    expect(settings["eslint.nodePath"]).toBeUndefined();
    expect(settings["stylelint.stylelintPath"]).toBe(
      "node_modules/@kriac/lint-kit/node_modules/stylelint",
    );
    expect(extensions.recommendations).toEqual(["stylelint.vscode-stylelint"]);
    expect(output.success).toHaveBeenCalledTimes(4);
    expect(output.success).toHaveBeenNthCalledWith(
      1,
      "已生成 eslint.config.mjs",
    );
    expect(output.success).toHaveBeenNthCalledWith(
      2,
      "已生成 stylelint.config.mjs",
    );
    expect(output.success).toHaveBeenNthCalledWith(
      3,
      `已更新 ${join(".vscode", "settings.json")}`,
    );
    expect(output.success).toHaveBeenNthCalledWith(
      4,
      `已更新 ${join(".vscode", "extensions.json")}`,
    );
  });

  it("逐个输出工具和 VS Code 配置的更新及已存在文件", async () => {
    await writeFile(join(cwd, "eslint.config.mjs"), "existing");
    vi.mocked(multiselect)
      .mockResolvedValueOnce(["eslint", "stylelint"])
      .mockResolvedValueOnce(["stylelint"]);

    await init({ cwd });

    expect(output.success).toHaveBeenCalledTimes(4);
    expect(output.success).toHaveBeenNthCalledWith(
      1,
      "已配置 eslint.config.mjs",
    );
    expect(output.success).toHaveBeenNthCalledWith(
      2,
      "已生成 stylelint.config.mjs",
    );
    expect(output.success).toHaveBeenNthCalledWith(
      3,
      `已更新 ${join(".vscode", "settings.json")}`,
    );
    expect(output.success).toHaveBeenNthCalledWith(
      4,
      `已更新 ${join(".vscode", "extensions.json")}`,
    );
    expect(await readFile(join(cwd, "eslint.config.mjs"), "utf8")).toBe(
      "existing",
    );
  });

  it("VS Code 配置解析失败时不输出成功信息", async () => {
    await mkdir(join(cwd, ".vscode"));
    await writeFile(join(cwd, ".vscode", "extensions.json"), "{ invalid");
    vi.mocked(multiselect)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(["stylelint"]);

    await expect(init({ cwd })).rejects.toThrow("无法解析");
    expect(output.success).not.toHaveBeenCalled();
  });

  it("后续 VS Code 配置失败时仍显示已生成的文件", async () => {
    await mkdir(join(cwd, ".vscode"));
    await writeFile(join(cwd, ".vscode", "extensions.json"), "{ invalid");
    vi.mocked(multiselect)
      .mockResolvedValueOnce(["eslint"])
      .mockResolvedValueOnce(["eslint"]);

    await expect(init({ cwd })).rejects.toThrow("无法解析");

    expect(output.success).toHaveBeenCalledExactlyOnceWith(
      "已生成 eslint.config.mjs",
    );
  });

  it("取消插件选择时不生成任何配置", async () => {
    vi.mocked(multiselect)
      .mockResolvedValueOnce(["eslint"])
      .mockResolvedValueOnce(CANCEL_SYMBOL);

    await init({ cwd });

    expect(await readdir(cwd)).toEqual([]);
    expect(process.exitCode).toBe(130);
  });

  it("未选择工具并取消插件选择时不生成任何配置", async () => {
    vi.mocked(multiselect)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(CANCEL_SYMBOL);

    await init({ cwd });

    expect(await readdir(cwd)).toEqual([]);
    expect(process.exitCode).toBe(130);
  });

  it("只选择 Commitlint 时不询问 VS Code 插件", async () => {
    vi.mocked(multiselect).mockResolvedValueOnce(["commitlint"]);

    await init({ cwd });

    expect(multiselect).toHaveBeenCalledTimes(1);
    expect(await readdir(cwd)).toEqual(["commitlint.config.mjs"]);
  });

  it("目标不是目录时抛出错误", async () => {
    const file = join(cwd, "file");
    await writeFile(file, "");

    await expect(init({ cwd: file })).rejects.toThrow("不是一个目录");
    expect(multiselect).not.toHaveBeenCalled();
  });
});
