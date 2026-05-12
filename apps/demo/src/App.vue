<script setup lang="ts">
import { computed, ref } from "vue";

const title = ref("Hello World");
const message = computed(() => {
  return "A tiny Vue demo for ESLint and Stylelint checks.";
});
</script>

<template>
  <main class="demo-page">
    <section class="hero">
      <p class="eyebrow">lint-kit demo</p>
      <h1>{{ title }}</h1>
      <p class="summary">{{ message }}</p>
    </section>
  </main>
</template>

<style scoped>
.demo-page {
  display: grid;
  gap: 1rem;
  min-height: 100vh;
  padding: 2rem;
  color: #1f2937;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 80%);
  border: 1px solid rgb(15 23 42 / 10%);
  border-radius: 20px;
  box-shadow: 0 18px 45px rgb(15 23 42 / 8%);
  backdrop-filter: blur(14px);
}

.hero {
  padding: 2rem;
}

.eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f766e;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

h1,
p {
  margin: 0;
}

h1 {
  max-width: 12ch;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 0.96;
}

.summary {
  margin-top: 1rem;
  font-size: 1.05rem;
  line-height: 1.7;
  color: #475569;
}
</style>
