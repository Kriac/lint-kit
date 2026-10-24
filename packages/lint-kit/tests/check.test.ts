import type { CheckOptions } from "../src/cli/check.ts";
import { resolve } from "node:path";
import { EventEmitter } from "node:events";
import { spawn } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { check } from "../src/cli/check.ts";
import { findConfigPath, resolveBinaryPath } from "../src/cli/config.ts";

vi.mock("node:child_process", () => {
  return { spawn: vi.fn() };
});
vi.mock("../src/cli/config.ts", () => {
  return { findConfigPath: vi.fn(), resolveBinaryPath: vi.fn() };
});

const cwd = process.cwd();
const stylePattern = "**/*.{css,scss,sass,less,styl,vue,html}";
let originalExitCode: typeof process.exitCode;

function mockChildExit(code: null | number) {
  const child = new EventEmitter();
  queueMicrotask(() => {
    child.emit("close", code);
  });
  return child as ReturnType<typeof spawn>;
}

describe("check 命令", () => {
  beforeEach(() => {
    originalExitCode = process.exitCode;
    vi.resetAllMocks();
    vi.spyOn(console, "log").mockImplementation(vi.fn());
    vi.mocked(findConfigPath).mockImplementation(async (linter) => {
      return resolve(cwd, `${linter}.config.js`);
    });
    vi.mocked(resolveBinaryPath).mockImplementation(async (linter) => {
      return `${linter}.js`;
    });
    vi.mocked(spawn).mockImplementation(() => {
      return mockChildExit(0);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = originalExitCode;
  });

  it("默认依次执行 ESLint 和 Stylelint，保留最高退出码", async () => {
    vi.mocked(spawn).mockImplementationOnce(() => {
      return mockChildExit(2);
    });

    await check();

    expect(spawn).toHaveBeenCalledTimes(2);
    expect(spawn).toHaveBeenNthCalledWith(
      1,
      process.execPath,
      ["eslint.js", "--config", resolve(cwd, "eslint.config.js"), "--", "."],
      { cwd, stdio: ["ignore", "inherit", "inherit"] },
    );
    expect(spawn).toHaveBeenNthCalledWith(
      2,
      process.execPath,
      [
        "stylelint.js",
        "--config",
        resolve(cwd, "stylelint.config.js"),
        "--allow-empty-input",
        "--",
        stylePattern,
      ],
      { cwd, stdio: ["ignore", "inherit", "inherit"] },
    );
    expect(process.exitCode).toBe(2);
  });

  it.each<{ args: string[]; linter: string; options: CheckOptions }>([
    {
      options: { eslint: true, cwd: ".", fix: true },
      linter: "eslint",
      args: ["--fix", "--", "src"],
    },
    {
      options: { commitlint: "message.txt" },
      linter: "commitlint",
      args: ["--edit", resolve(cwd, "message.txt")],
    },
  ])(
    "显式选择 $linter 时只执行该工具并传递参数",
    async ({ options, linter, args }) => {
      await check(["src"], options);

      expect(findConfigPath).toHaveBeenCalledExactlyOnceWith(
        linter,
        cwd,
        expect.any(Array),
      );
      expect(spawn).toHaveBeenCalledExactlyOnceWith(
        process.execPath,
        [
          `${linter}.js`,
          "--config",
          resolve(cwd, `${linter}.config.js`),
          ...args,
        ],
        { cwd, stdio: ["ignore", "inherit", "inherit"] },
      );
      expect(process.exitCode).toBe(0);
    },
  );

  it("缺少配置时跳过该工具，继续执行其他工具", async () => {
    vi.mocked(findConfigPath).mockResolvedValueOnce(undefined);

    await check();

    expect(findConfigPath).toHaveBeenCalledTimes(2);
    expect(resolveBinaryPath).toHaveBeenCalledExactlyOnceWith("stylelint");
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBe(0);
  });

  it("禁用 ESLint 且目标只有已存在的非样式文件时不启动进程", async () => {
    await check([import.meta.filename], { eslint: false });

    expect(findConfigPath).toHaveBeenCalledExactlyOnceWith(
      "stylelint",
      cwd,
      expect.any(Array),
    );
    expect(spawn).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(0);
  });

  it("子进程没有退出码时视为失败", async () => {
    vi.mocked(spawn).mockImplementationOnce(() => {
      return mockChildExit(null);
    });

    await check([], { eslint: true });

    expect(process.exitCode).toBe(1);
  });

  it("子进程启动失败时抛出原始错误", async () => {
    const error = new Error("启动失败");
    vi.mocked(spawn).mockImplementationOnce(() => {
      const child = new EventEmitter();
      queueMicrotask(() => {
        child.emit("error", error);
      });
      return child as ReturnType<typeof spawn>;
    });

    await expect(check([], { eslint: true })).rejects.toBe(error);
  });

  it("项目目录不是文件夹时拒绝执行", async () => {
    await expect(check([], { cwd: import.meta.filename })).rejects.toThrow(
      "项目目录不是文件夹",
    );
    expect(findConfigPath).not.toHaveBeenCalled();
    expect(spawn).not.toHaveBeenCalled();
  });
});
