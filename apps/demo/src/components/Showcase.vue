<script setup lang="ts">
import type { Feature } from "../types";
import { computed, ref } from "vue";
import { highlightCode } from "../utils";

const selectedFeature = defineModel<Feature | null>("modelValue");

const copied = ref(false);

const highlightedCode = computed(() => {
  if (!selectedFeature.value) return [];
  return highlightCode(selectedFeature.value.code);
});

const handleCopy = () => {
  if (!selectedFeature.value) return;
  navigator.clipboard.writeText(selectedFeature.value.code);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

<template>
  <section class="showcase">
    <div class="showcase-header">
      <h2>{{ selectedFeature?.title || "选择一个配置方案" }}</h2>
      <p v-if="selectedFeature" class="showcase-desc">
        {{ selectedFeature.details }}
      </p>
    </div>

    <div v-if="selectedFeature" class="code-block">
      <div class="code-header">
        <span class="code-label">{{ selectedFeature.filename }}</span>
        <button class="copy-btn" @click="handleCopy">
          {{ copied ? "✓ 已复制" : "复制" }}
        </button>
      </div>
      <div class="code-scroll">
        <code class="code-content">
          <span
            v-for="(line, lineIndex) in highlightedCode"
            :key="lineIndex"
            class="code-line"
          >
            <template v-if="line.length === 0">&#8203;</template>
            <span
              v-for="(token, tokenIndex) in line"
              :key="`${lineIndex}-${tokenIndex}`"
              :class="token.type !== 'plain' ? token.type : undefined"
              >{{ token.text }}</span
            >
          </span>
        </code>
      </div>
    </div>
  </section>
</template>

<style scoped>
.showcase {
  padding: 4rem 0;
  border-top: 1px solid var(--border);
}

.showcase-header {
  margin-bottom: 2rem;
}

.showcase-header h2 {
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
}

.showcase-desc {
  font-size: 1.05rem;
  color: var(--text-secondary);
}

.code-block {
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgb(30 41 59 / 80%) 0%,
    rgb(15 23 42 / 60%) 100%
  );
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px rgb(0 0 0 / 30%);
  backdrop-filter: blur(10px);
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgb(0 0 0 / 30%);
  border-bottom: 1px solid var(--border);
}

.code-label {
  font-family: Monaco, Menlo, monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.copy-btn {
  position: relative;
  padding: 0.5rem 1rem;
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  background: var(--primary);
  border: none;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.copy-btn::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  content: "";
  background: rgb(255 255 255 / 20%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.5s,
    height 0.5s;
}

.copy-btn:hover {
  background: var(--primary-dark);
  box-shadow: 0 6px 15px rgb(16 185 129 / 30%);
  transform: translateY(-2px);
}

.copy-btn:hover::after {
  width: 200px;
  height: 200px;
}

.code-scroll {
  overflow-x: auto;
}

.code-content {
  display: block;
  padding: 1.5rem;
  font-family: Monaco, Menlo, monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre;
}

code {
  color: var(--text-primary);
}

.code-line {
  display: block;
}

.kw {
  font-weight: 600;
  color: var(--secondary);
}

.fn {
  color: var(--primary);
}

.str {
  color: var(--accent);
}
</style>
