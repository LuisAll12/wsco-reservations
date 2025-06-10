<template>
  <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-[400px] relative">
      <h2 class="text-xl font-semibold mb-3">{{ event?.title || 'Reservierung' }}</h2>

      <div class="text-sm text-gray-700 space-y-2">
        <p>
          <strong>Start:</strong>
          {{ formatDate(event?.start) }}
        </p>
        <p>
          <strong>Ende:</strong>
          {{ formatDate(event?.end) }}
        </p>
        <p>
          <strong>Status:</strong>
          <span :class="badgeClass(event?.calendarId)">
            {{ statusLabel(event?.calendarId) }}
          </span>
        </p>
      </div>

      <div class="mt-5 flex justify-end space-x-3">
        <button
          class="px-4 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
          @click="$emit('close')"
        >
          Schliessen
        </button>
        <button
          class="px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
          @click="$emit('edit', event)"
        >
          Bearbeiten
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const { event } = toRefs(props)

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('de-CH', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function statusLabel(type) {
  switch (type) {
    case 'mine': return 'Meine Reservation'
    case 'others': return 'Fremdreservation'
    case 'cancelled': return 'Storniert'
    default: return 'Unbekannt'
  }
}

function badgeClass(type) {
  switch (type) {
    case 'mine': return 'text-green-600'
    case 'others': return 'text-blue-600'
    case 'cancelled': return 'text-gray-500 line-through'
    default: return 'text-gray-700'
  }
}
</script>
