<template>
  <div class="bg-white rounded-2xl shadow-md p-5 w-full max-w-xl relative">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Bootsübersicht</h2>

    <div class="space-y-3 max-h-[260px] overflow-y-auto pr-1 relative">
      <div
        v-for="boat in boats"
        :key="boat.id"
        class="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
      >
        <div class="flex flex-col">
          <span class="text-sm font-medium text-gray-800">{{ boat.name }}</span>
          <span class="text-xs text-gray-500">{{ boat.numberplate }}</span>
        </div>
        <div>
          <span
            class="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full"
            :class="boat.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >
            {{ boat.available ? '✔ Verfügbar' : '✖ In Reparatur' }}
          </span>
        </div>
      </div>

      <!-- Blending bei Scroll -->
      <div class="absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-gradient-to-t from-white to-transparent"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const boats = ref([]);

onMounted(async () => {
  const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat`, {
    credentials: 'include'
  });

  const data = await res.json();

  boats.value = data.map(boat => ({
    id: boat.id,
    name: boat.name,
    numberplate: boat.numberplate,
    available: boat.available // boolean
  }));
});
</script>
