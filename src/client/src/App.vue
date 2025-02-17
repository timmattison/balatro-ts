<script setup>
// import HelloWorld from './components/HelloWorld.vue'
import { ref } from 'vue'

const seedData = ref('');
const isAnalyzing = ref(false);

const analyze = async () => {
  isAnalyzing.value = true;
  const data = await fetch('/analyze', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
    .finally(() => isAnalyzing.value = false);

  console.log(data);
  seedData.value = data;
}
</script>

<template>
  <p>The found seeds are filtered by containing THE SOUL</p>
  <button @click="analyze">Perform analysis</button>
  <div v-if="isAnalyzing">Analyzing...</div>
  <div>{{ seedData }}</div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
