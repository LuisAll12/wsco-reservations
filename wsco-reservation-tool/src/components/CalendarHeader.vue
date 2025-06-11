<script setup>
import { ref, watch, onMounted } from 'vue'
import { getUserName } from '../services/auth.js'

const props = defineProps({
  user: Object,
  boats: Array,
  currentDate: Date,
  selectedBoat: [String, Number],
  currentUser: Object
})

const boats = ref(props.boats || [])
const name = ref(null)
const emit = defineEmits(['prev-week', 'next-week', 'new-reservation', 'boat-change'])

const selectedBoatId = ref(props.selectedBoat || '')

watch(selectedBoatId, (newVal) => {
  emit('boat-change', newVal)
})

onMounted(async () => {
  name.value = await getUserName()
  
  try {
    const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Fehler beim Laden der Boote')
    }
    const data = await res.json()
    boats.value = data.map(boat => ({
      id: boat.id,
      name: boat.name,
      numberplate: boat.numberplate,
      status: boat.status
    }))
  } catch (error) {
    console.error('Fehler beim Laden des Benutzernamens:', error)
  }
})
</script>

<template>
  <header class="calendar-header bg-white border-b px-6 py-4 shadow-sm rounded-md mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">Ahoi, {{ name }}</h2>
        <p class="text-sm text-gray-500">Deine Reservierungsübersicht</p>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <div v-if="selectedBoatId" class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span class="font-medium">
            {{
              boats.find(b => b.id === selectedBoatId)?.name
            }} ({{ boats.find(b => b.id === selectedBoatId)?.numberplate }})
          </span>
        </div>

        <select v-model="selectedBoatId"
          class="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm shadow-sm focus:ring-2 focus:ring-emerald-300 focus:outline-none">
          <option value="">Alle Boote</option>
          <option
            v-for="boat in boats"
            :key="boat.id"
            :value="boat.id"
            :disabled="boat.status === 'unavailable'"
          >
            {{ boat.name }} ({{ boat.numberplate }})
          </option>
        </select>

        <button
          @click="$emit('new-reservation')"
          class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          Neue Reservation
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
</style>
