import type { Ref } from "vue";
import { computed, ref } from "vue";

/** 测试类型A */
export type TestTypeA = "a0" | "a1" | "a2";

/** 测试类型B */
export type TestTypeB<T> = "b0" | "b1" | "b2" | T;

/** 测试联合类型排序 */
export type TestUnionType = Ref<string, number> | TestTypeA | TestTypeB<string>;

/** 测试交叉类型排序 */
export type TestIntersectionType = TestTypeA & TestTypeB<string>;

/** 测试对象类型排序 */
export type TestSortObjectTypes = {
  x: number;
  y: number;
  z: string;
} & TestSortInterfaces;

/** 测试接口类型排序 */
export interface TestSortInterfaces {
  a: string;
  b: number;
  c: boolean;
}

// 测试命名导出排序
export { computed, ref };
