<template>
  <div class="widget">
    <h2>Schadensmeldungen</h2>
    <ul>
      <li v-for="(report, index) in reports" :key="index">{{ report }}</li>
    </ul>
  </div>
</template>

<script setup>
const reports = [
  "Riss im Segel – Boot #104",
  "Fehlendes Paddel – Boot #89",
  "Kratzer im Lack – Boot #23",
];
</script>

<style scoped>
.widget {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
