<script setup>
import { ref } from 'vue'
import { CalendarIcon, ClockIcon, TagIcon, XCircleIcon } from '@heroicons/vue/24/outline'

const reservations = ref([
  {
    id: '1',
    boatName: 'Sea Explorer',
    date: '2025-05-10',
    time: '14:00',
    status: 'Bestätigt'
  },
  {
    id: '2',
    boatName: 'Ocean Breeze',
    date: '2025-05-12',
    time: '10:00',
    status: 'Ausstehend'
  },
  {
    id: '3',
    boatName: 'River Runner',
    date: '2025-05-15',
    time: '09:00',
    status: 'Storniert'
  }
])

function cancelReservation(id) {
  const reservation = reservations.value.find(r => r.id === id)
  if (reservation && reservation.status !== 'Storniert') {
    reservation.status = 'Storniert'
  }
}
</script>

<template>
  <div class="container">
    <h1 class="title">Meine Reservierungen</h1>
    <div class="reservation-list">
      <div
        class="reservation-card"
        v-for="reservation in reservations"
        :key="reservation.id"
      >
        <h2 class="boat-name">{{ reservation.boatName }}</h2>

        <p>
          <CalendarIcon class="icon" />
          <strong>Datum:</strong> {{ reservation.date }}
        </p>
        <p>
          <ClockIcon class="icon" />
          <strong>Uhrzeit:</strong> {{ reservation.time }}
        </p>
        <p :class="'status ' + reservation.status.toLowerCase()">
          <TagIcon class="icon" />
          <strong>Status:</strong> {{ reservation.status }}
        </p>

        <button
          class="cancel-button"
          @click="cancelReservation(reservation.id)"
          :disabled="reservation.status === 'Storniert'"
        >
          <XCircleIcon class="icon-button" />
          Reservierung stornieren
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  font-family: Arial, sans-serif;
}

.title {
  text-align: center;
  font-size: 2em;
  margin-bottom: 30px;
}

.reservation-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reservation-card {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.boat-name {
  margin: 0 0 10px;
  font-size: 1.4em;
  color: #333;
}

.status {
  margin-top: 8px;
  font-weight: bold;
}

.status.bestätigt {
  color: green;
}

.status.ausstehend {
  color: orange;
}

.status.storniert {
  color: red;
}

.cancel-button {
  margin-top: 12px;
  padding: 10px 16px;
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s ease;
}

.cancel-button:hover {
  background-color: #c62828;
}

.cancel-button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.icon {
  width: 20px;
  height: 20px;
  vertical-align: middle;
  margin-right: 6px;
  display: inline-block;
}

.icon-button {
  width: 20px;
  height: 20px;
}
</style>
