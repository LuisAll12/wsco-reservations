<template>
  <div class="widget">
    <h2>Bootsstatistik</h2>
    <p>{{ count }} Boote im System</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const count = ref(0);

onMounted(async () => {
  const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat`);
  const boats = await res.json();
  count.value = boats.length;
});
</script>

<style scoped>
.widget {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
