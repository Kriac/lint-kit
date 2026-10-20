import type { PluginOptions } from "../src/types";
import { describe, expect, it } from "vitest";
import lint from "@commitlint/lint";
import createConfig, { commitTypes } from "../src/index";

async function lintMessage(message: string, options?: PluginOptions) {
  const config = createConfig(options);
  const rules = Object.fromEntries(
    await Promise.all(
      Object.entries(config.rules ?? {}).map(async ([name, rule]) => {
        return [name, typeof rule === "function" ? await rule() : rule];
      }),
    ),
  );
  return lint(message, rules, {
    defaultIgnores: false,
  });
}

describe("默认配置", () => {
  it("不传选项和传入空选项时配置一致", () => {
    expect(createConfig()).toEqual(createConfig({}));
    expect(createConfig()).toEqual(createConfig({ rules: {} }));
  });

  it("只启用 type-empty 和 type-enum 两条错误级别的规则", () => {
    expect(createConfig().rules).toEqual({
      "type-empty": [2, "never"],
      "type-enum": [2, "always", commitTypes],
    });
  });
});

describe("默认规则校验", () => {
  it.each(commitTypes)("允许提交类型 %s", async (type) => {
    const result = await lintMessage(`${type}: update config`);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it.each(["build", "Feat"])("拒绝不在枚举范围内的类型 %s", async (type) => {
    const result = await lintMessage(`${type}: update config`);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      expect.objectContaining({ name: "type-enum", level: 2 }),
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("拒绝无法解析出类型的提交", async () => {
    const result = await lintMessage("update config");

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "type-empty", level: 2 }),
      ]),
    );
  });
});

describe("自定义规则", () => {
  it("覆盖一条规则时保留其他默认规则", async () => {
    const result = await lintMessage("update config", {
      rules: { "type-enum": [0] },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      expect.objectContaining({ name: "type-empty", level: 2 }),
    ]);
  });

  it.each([
    {
      name: "允许自定义类型 build",
      message: "build: bundle packages",
      valid: true,
    },
    {
      name: "拒绝被替换的默认类型 feat",
      message: "feat: add config",
      valid: false,
    },
  ])("覆盖类型枚举后，$name", async ({ message, valid }) => {
    const result = await lintMessage(message, {
      rules: { "type-enum": [2, "always", ["build"]] },
    });

    expect(result.valid).toBe(valid);
    expect(
      result.errors.map((error) => {
        return error.name;
      }),
    ).toEqual(valid ? [] : ["type-enum"]);
  });
});
