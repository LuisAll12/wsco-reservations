<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import datenschutzData from '../data/infoDatenschutz.json'

const router = useRouter()
const datenschutz = ref(null)

onMounted(() => {
  datenschutz.value = datenschutzData
})

function goBack() {
  router.push('/dashboard')
}
</script>

<template>
    <div class="max-w-4xl mx-auto px-6 py-10 text-slate-800 bg-white rounded-lg shadow-md mt-6">
        <h1 class="text-3xl font-bold mb-8 text-center" v-if="datenschutz">{{ datenschutz.title }}</h1>

        <div v-if="datenschutz" class="space-y-8">
            <div v-for="(section, index) in datenschutz.sections" :key="index">
                <h2 class="text-xl font-semibold mb-2">{{ section.title }}</h2>
                <ul class="space-y-2 list-disc list-inside">
                    <li v-for="(line, i) in section.content" :key="i">{{ line }}</li>
                </ul>
            </div>
        </div>

        <!-- Back Button -->
        <div class="mt-10 text-center">
            <button
                @click="goBack"
                class="inline-flex items-center gap-2 px-6 py-2 bg-slate-800 text-white font-medium rounded-md hover:bg-slate-700 transition">
                ⬅ Zurück zum Dashboard
            </button>
        </div>
    </div>
</template>
