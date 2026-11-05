import type { CheckOptions, Linter } from "../src/cli/check-utils.ts";
import { resolve } from "node:path";
import { EventEmitter } from "node:events";
import { spawn } from "node:child_process";
import { performance } from "node:perf_hooks";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { check } from "../src/cli/check.ts";
import { findConfigPath, resolveBinaryPath } from "../src/cli/check-utils.ts";
import pc from "picocolors";

vi.mock("node:child_process", () => {
  return { spawn: vi.fn() };
});
vi.mock(import("../src/cli/check-utils.ts"), async (importOriginal) => {
  return { ...(await importOriginal()), findConfigPath: vi.fn() };
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
    vi.spyOn(process.stdout, "write").mockImplementation(() => {
      return true;
    });
    vi.spyOn(process.stderr, "write").mockImplementation(() => {
      return true;
    });
    vi.mocked(findConfigPath).mockImplementation(async (linter) => {
      return resolve(cwd, `${linter}.config.js`);
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
      [
        await resolveBinaryPath("eslint"),
        "--config",
        resolve(cwd, "eslint.config.js"),
        "--",
        ".",
      ],
      { cwd, stdio: ["ignore", "inherit", "inherit"] },
    );
    expect(spawn).toHaveBeenNthCalledWith(
      2,
      process.execPath,
      [
        await resolveBinaryPath("stylelint"),
        "--config",
        resolve(cwd, "stylelint.config.js"),
        "--allow-empty-input",
        "--",
        stylePattern,
      ],
      { cwd, stdio: ["ignore", "inherit", "inherit"] },
    );
    expect(process.exitCode).toBe(2);
    expect(process.stderr.write).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(/✖.*检查结束，耗时 /),
    );
    expect(process.stdout.write).not.toHaveBeenCalledWith(
      expect.stringContaining("检查结束"),
    );
  });

  it.each<{ args: string[]; linter: Linter; options: CheckOptions }>([
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

      expect(findConfigPath).toHaveBeenCalledExactlyOnceWith(linter, cwd);
      expect(spawn).toHaveBeenCalledExactlyOnceWith(
        process.execPath,
        [
          await resolveBinaryPath(linter),
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
    expect(spawn).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBe(0);
    expect(process.stdout.write).not.toHaveBeenCalledWith(
      expect.stringContaining("ESLint"),
    );
  });

  it("禁用 ESLint 且目标只有已存在的非样式文件时不启动进程", async () => {
    await check([import.meta.filename], { eslint: false });

    expect(findConfigPath).toHaveBeenCalledExactlyOnceWith("stylelint", cwd);
    expect(spawn).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(0);
    expect(process.stdout.write).toHaveBeenCalledTimes(1);
    expect(process.stdout.write).toHaveBeenCalledWith(
      expect.stringMatching(/✔.*检查结束，耗时 /),
    );
    expect(process.stderr.write).not.toHaveBeenCalled();
  });

  it("所有工具缺少配置时也输出检查结束和耗时", async () => {
    vi.mocked(findConfigPath).mockResolvedValue(undefined);

    await check();

    expect(spawn).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(0);
    expect(process.stdout.write).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(/✔.*检查结束，耗时 /),
    );
    expect(process.stderr.write).not.toHaveBeenCalled();
  });

  it("成功时只输出任务开始信息和总耗时", async () => {
    await check();

    expect(process.stdout.write).toHaveBeenCalledTimes(3);
    expect(process.stdout.write).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("正在检查 ESLint"),
    );
    expect(process.stdout.write).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("正在检查 Stylelint"),
    );
    expect(process.stdout.write).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(/✔.*检查结束，耗时 /),
    );
    expect(process.stderr.write).not.toHaveBeenCalled();
  });

  it.each([
    { duration: 10_000, expected: "\u001b[32m10,000ms\u001b[39m" },
    { duration: 10_000.001, expected: "\u001b[33m10,001ms\u001b[39m" },
  ])("总耗时 $duration ms 使用对应颜色", async ({ duration, expected }) => {
    vi.spyOn(pc, "green").mockImplementation((text) => {
      return `\u001b[32m${text}\u001b[39m`;
    });
    vi.spyOn(pc, "yellow").mockImplementation((text) => {
      return `\u001b[33m${text}\u001b[39m`;
    });
    vi.spyOn(performance, "now")
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(100 + duration);

    await check([], { eslint: true });

    expect(process.stdout.write).toHaveBeenLastCalledWith(
      expect.stringContaining(expected),
    );
  });

  it.each([
    { duration: 10_000, expected: "10,000ms" },
    { duration: 10_000.001, expected: "10,001ms" },
  ])("检查失败时总耗时 $duration ms 不着色", async ({ duration, expected }) => {
    const green = vi.spyOn(pc, "green");
    const yellow = vi.spyOn(pc, "yellow");
    vi.spyOn(pc, "red").mockImplementation((text) => {
      return `\u001b[31m${text}\u001b[39m`;
    });
    vi.spyOn(performance, "now")
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(100 + duration);
    vi.mocked(spawn).mockImplementationOnce(() => {
      return mockChildExit(1);
    });

    await check([], { eslint: true });

    expect(process.stderr.write).toHaveBeenCalledExactlyOnceWith(
      `\u001b[31m✖\u001b[39m 检查结束，耗时 ${expected}\n`,
    );
    expect(green).not.toHaveBeenCalled();
    expect(yellow).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it("子进程没有退出码时视为失败", async () => {
    vi.mocked(spawn).mockImplementationOnce(() => {
      return mockChildExit(null);
    });

    await check([], { eslint: true });

    expect(process.exitCode).toBe(1);
    expect(process.stderr.write).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(/✖.*检查结束，耗时 /),
    );
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
    expect(process.stderr.write).not.toHaveBeenCalled();
    expect(process.stdout.write).not.toHaveBeenCalledWith(
      expect.stringContaining("检查结束"),
    );
  });

  it("项目目录不是文件夹时拒绝执行", async () => {
    await expect(check([], { cwd: import.meta.filename })).rejects.toThrow(
      "项目目录不是文件夹",
    );
    expect(findConfigPath).not.toHaveBeenCalled();
    expect(spawn).not.toHaveBeenCalled();
  });
});
