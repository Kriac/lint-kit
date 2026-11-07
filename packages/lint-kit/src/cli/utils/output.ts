import { performance } from "node:perf_hooks";
import pc from "picocolors";

const slowTaskThresholdMs = 10_000;

/**
 * 将耗时格式化为毫秒数，可选择是否使用语义颜色。
 */
export function formatDuration(durationMs: number, color = true) {
  const text = `${Math.ceil(durationMs).toLocaleString("en-US")}ms`;
  if (!color) {
    return text;
  }
  return durationMs > slowTaskThresholdMs ? pc.yellow(text) : pc.green(text);
}

function write(stream: NodeJS.WriteStream, symbol: string, message: string) {
  stream.write(`${symbol} ${message}\n`);
}

/**
 * 输出 CLI 状态信息。
 */
export const output = {
  info(message: string) {
    write(process.stdout, pc.cyan("ℹ"), message);
  },
  success(message: string) {
    write(process.stdout, pc.green("✔"), message);
  },
  warn(message: string) {
    write(process.stderr, pc.yellow("⚠"), message);
  },
  error(message: string) {
    write(process.stderr, pc.red("✖"), message);
  },
  duration(durationMs: number, color = true) {
    return formatDuration(durationMs, color);
  },
};

/**
 * 执行异步任务，返回任务结果和耗时。
 */
export async function measureTask<T>(
  task: () => Promise<T>,
): Promise<{ durationMs: number; result: T }> {
  const start = performance.now();
  const result = await task();
  return {
    result,
    durationMs: performance.now() - start,
  };
}
