import { performance } from "node:perf_hooks";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDuration, measureTask, output } from "../src/cli/output.ts";
import pc from "picocolors";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CLI 输出", () => {
  it.each([
    { duration: 9999, text: "9,999ms", color: "green" },
    { duration: 10000, text: "10,000ms", color: "green" },
    { duration: 10000.001, text: "10,001ms", color: "yellow" },
  ])("根据原始耗时为 $duration ms 着色", ({ duration, text, color }) => {
    const green = vi.spyOn(pc, "green");
    const yellow = vi.spyOn(pc, "yellow");

    formatDuration(duration);

    expect(color === "green" ? green : yellow).toHaveBeenCalledExactlyOnceWith(
      text,
    );
    expect(color === "green" ? yellow : green).not.toHaveBeenCalled();
  });

  it("可格式化不着色的耗时", () => {
    const green = vi.spyOn(pc, "green");
    const yellow = vi.spyOn(pc, "yellow");

    expect(formatDuration(10_000.001, false)).toBe("10,001ms");
    expect(green).not.toHaveBeenCalled();
    expect(yellow).not.toHaveBeenCalled();
  });

  it("使用 picocolors 输出状态及耗时颜色", () => {
    const stdout = vi.spyOn(process.stdout, "write").mockImplementation(() => {
      return true;
    });
    const stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => {
      return true;
    });
    vi.spyOn(pc, "green").mockImplementation((text) => {
      return `[green]${text}`;
    });
    vi.spyOn(pc, "yellow").mockImplementation((text) => {
      return `[yellow]${text}`;
    });
    vi.spyOn(pc, "red").mockImplementation((text) => {
      return `[red]${text}`;
    });

    output.success(`执行完成 ${output.duration(100)}`);
    output.warn("需要注意");
    output.error("执行失败");

    expect(stdout).toHaveBeenCalledWith("[green]✔ 执行完成 [green]100ms\n");
    expect(stderr).toHaveBeenCalledWith("[yellow]⚠ 需要注意\n");
    expect(stderr).toHaveBeenCalledWith("[red]✖ 执行失败\n");
  });

  it("执行异步任务并返回原始结果和耗时", async () => {
    vi.spyOn(performance, "now")
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(35);
    const result = { value: "任务结果" };
    const task = vi.fn(async () => {
      return result;
    });

    await expect(measureTask(task)).resolves.toEqual({
      result,
      durationMs: 25,
    });
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("异步任务失败时保留原始错误", async () => {
    const error = new Error("任务失败");
    const task = vi.fn(async () => {
      throw error;
    });

    await expect(measureTask(task)).rejects.toBe(error);
    expect(task).toHaveBeenCalledTimes(1);
  });
});
