<script setup lang="ts">
import DemoButton from "../components/button.vue";

// if 语句即使只有一行也必须使用花括号
const isTrue = true;
if (isTrue) {
  console.log(1);
}

// 箭头函数必须使用完整写法，即使是简单的映射
const arr = [1, 2, 3, 4];
arr.map((item) => {
  return item.toFixed();
});
</script>

<template>
  <div class="hero">
    <div class="title">Hello world!</div>
    <DemoButton />
  </div>
</template>

<style scoped lang="scss">
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.hero :deep(.demo-button) {
  width: 120px;
  height: 40px;
  cursor: pointer;
}
</style>
