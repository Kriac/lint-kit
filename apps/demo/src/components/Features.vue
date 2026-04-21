<script setup lang="ts">
import type { Feature } from "../types";

defineProps<{
  features: Feature[];
  selectedFeature: Feature | null;
}>();

defineEmits<{
  select: [feature: Feature];
}>();
</script>

<template>
  <section class="features">
    <div class="features-grid">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="feature-card"
        :class="{ active: selectedFeature?.title === feature.title }"
        @click="$emit('select', feature)"
      >
        <div class="feature-icon">{{ feature.icon }}</div>
        <h3 class="feature-title">{{ feature.title }}</h3>
        <p class="feature-desc">{{ feature.desc }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  padding: 4rem 0;
  border-top: 1px solid var(--border);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(
    135deg,
    rgb(30 41 59 / 80%) 0%,
    rgb(15 23 42 / 60%) 100%
  );
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-card:hover,
.feature-card.active {
  background: linear-gradient(
    135deg,
    rgb(25 38 60 / 95%) 0%,
    rgb(18 31 54 / 82%) 100%
  );
  border-color: var(--primary);
  transform: translateY(-4px);
}

.feature-card.active::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  border: 2px solid var(--primary);
  border-radius: 0.75rem;
}

.feature-icon {
  position: relative;
  z-index: 1;
  font-size: 2.5rem;
  transition: transform 0.3s ease;
}

.feature-title {
  position: relative;
  z-index: 1;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.feature-desc {
  position: relative;
  z-index: 1;
  flex: 1;
  line-height: 1.6;
  color: var(--text-secondary);
}
</style>
