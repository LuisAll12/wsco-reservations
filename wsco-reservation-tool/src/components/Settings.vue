<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import settingsData from '../data/infoSettings.json'

const router = useRouter()
const settings = ref(null)

onMounted(() => {
  settings.value = settingsData
})

function goBack() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-10 text-slate-800 bg-white rounded-lg shadow-md mt-6">
    <!-- Back Button -->
    <div class="mb-6">
      <button
        @click="goBack"
        class="inline-flex items-center gap-2 px-5 py-2 bg-slate-800 text-white font-medium rounded-md hover:bg-slate-700 transition"
      >
        ⬅ Zurück zum Dashboard
      </button>
    </div>

    <h1 v-if="settings" class="text-3xl font-bold mb-6 text-center">
      {{ settings.title }}
    </h1>

    <div v-if="settings" class="space-y-8">
      <div v-for="(section, index) in settings.sections" :key="index">
        <h2 class="text-xl font-semibold mb-2">{{ section.title }}</h2>
        <ul class="list-disc list-inside space-y-1 text-sm md:text-base">
          <li v-for="(item, idx) in section.items" :key="idx">{{ item }}</li>
        </ul>
      </div>
    </div>

    <div v-else class="text-center text-slate-500">Lade Einstellungen...</div>
  </div>
</template>
