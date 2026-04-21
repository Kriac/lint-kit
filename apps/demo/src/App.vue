<script setup lang="ts">
import type { Feature } from "./types";
import { ref } from "vue";
import { FEATURES, STATS } from "./configs/constants";
import CTA from "./components/CTA.vue";
import Hero from "./components/Hero.vue";
import Stats from "./components/Stats.vue";
import Features from "./components/Features.vue";
import Showcase from "./components/Showcase.vue";
import HeaderView from "./components/Header.vue";
import FooterView from "./components/Footer.vue";

const activeTab = ref("文档");
const selectedFeature = ref<Feature | null>(FEATURES[0]);

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
};

const handleSelectFeature = (feature: Feature) => {
  selectedFeature.value = feature;
};
</script>

<template>
  <div id="app" class="app">
    <HeaderView :active-tab="activeTab" @tab-change="handleTabChange" />
    <main class="main">
      <Hero />
      <Features
        :features="FEATURES"
        :selected-feature="selectedFeature"
        @select="handleSelectFeature"
      />
      <Showcase v-model="selectedFeature" />
      <Stats :stats="STATS" />
      <CTA />
    </main>
    <FooterView />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
  margin: 0 auto;
}
</style>
