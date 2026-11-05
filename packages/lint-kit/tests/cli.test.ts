import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { check } from "../src/cli/check.ts";
import { output } from "../src/cli/output.ts";

vi.mock(import("../src/cli/check.ts"), () => {
  return { check: vi.fn() };
});

vi.mock(import("../src/cli/output.ts"), async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, output: { ...original.output, error: vi.fn() } };
});

const originalArgv = process.argv;
const originalExitCode = process.exitCode;

describe("CLI 入口", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    process.argv = [process.execPath, "lint-kit", "check"];
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exitCode = originalExitCode;
    vi.restoreAllMocks();
  });

  it("只输出异步命令的错误消息并设置失败退出码", async () => {
    const error = new Error("项目目录不是文件夹");
    vi.mocked(check).mockRejectedValue(error);

    await import("../src/cli.ts");

    expect(output.error).toHaveBeenCalledExactlyOnceWith(error.message);
    expect(process.exitCode).toBe(1);
  });

  it("处理非 Error 类型的异常", async () => {
    vi.mocked(check).mockRejectedValue("执行失败");

    await import("../src/cli.ts");

    expect(output.error).toHaveBeenCalledExactlyOnceWith("执行失败");
    expect(process.exitCode).toBe(1);
  });

  it("处理命令参数解析错误", async () => {
    process.argv.push("--unknown-option");

    await import("../src/cli.ts");

    expect(output.error).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("Unknown option `--unknownOption`"),
    );
    expect(process.exitCode).toBe(1);
    expect(check).not.toHaveBeenCalled();
  });

  it("保留命令返回的退出码", async () => {
    vi.mocked(check).mockImplementation(async () => {
      process.exitCode = 2;
    });

    await import("../src/cli.ts");

    expect(check).toHaveBeenCalledTimes(1);
    expect(output.error).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(2);
  });

  it("显示帮助时不执行命令", async () => {
    process.argv = [process.execPath, "lint-kit", "--help"];
    vi.spyOn(console, "log").mockImplementation(() => {
      return undefined;
    });

    await import("../src/cli.ts");

    expect(check).not.toHaveBeenCalled();
    expect(output.error).not.toHaveBeenCalled();
  });
});
