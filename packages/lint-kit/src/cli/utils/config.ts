import { cosmiconfig } from "cosmiconfig";

const scriptExtensions = ["js", "mjs", "cjs", "ts", "mts", "cts"];

/**
 * 按搜索优先级发现配置路径，将指定格式的实际加载留给对应工具。
 */
export async function findConfigFile(
  name: string,
  cwd: string,
  searchPlaces: string[],
  deferredExtensions: string[] = scriptExtensions,
): Promise<string | undefined> {
  const deferredLoaders = Object.fromEntries(
    deferredExtensions.map((extension) => {
      return [
        `.${extension}`,
        () => {
          return {};
        },
      ];
    }),
  );
  const explorer = cosmiconfig(name, {
    searchPlaces,
    searchStrategy: "global",
    loaders: {
      ...deferredLoaders,
      ".json": (_filepath, content) => {
        return JSON.parse(content.replace(/^\uFEFF/, ""));
      },
    },
  });
  const result = await explorer.search(cwd);
  return result && !result.isEmpty ? result.filepath : undefined;
}
