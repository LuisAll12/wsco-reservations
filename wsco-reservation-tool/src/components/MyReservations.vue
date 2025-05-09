<script setup>
import { onMounted, ref } from 'vue'
import {
  CalendarIcon,
  ClockIcon,
  TagIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { getUsersReservaitons } from '../services/GetUserRes'

const reservations = ref([])

onMounted(async () => {
  reservations.value = [...await getUsersReservaitons()]
})

const showModal = ref(false)
const selectedReservationId = ref(null)

function openConfirmation(id) {
  selectedReservationId.value = id
  showModal.value = true
}

function confirmCancel() {
  const reservation = reservations.value.find(r => r.id === selectedReservationId.value)
  if (reservation && reservation.status !== 'Storniert') {
    reservation.status = 'Storniert'
  }
  closeModal()
}

function closeModal() {
  selectedReservationId.value = null
  showModal.value = false
}
</script>

<template>
  <div class="container">
    <router-link to="/dashboard" class="back">Zurück</router-link>
    <h1 class="title">Meine Reservierungen</h1>
    <div class="reservation-list">
      <div class="reservation-card" v-for="reservation in reservations" :key="reservation.id">
        <h2 class="boat-name">{{ reservation.boatName }}</h2>

        <p>
          <CalendarIcon class="icon" />
          <strong>Datum:</strong> {{ new Date(reservation.startDate).toLocaleDateString() }}
        </p>
        <p>
          <ClockIcon class="icon" />
          <strong>Uhrzeit:</strong> {{ new Date(reservation.startDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
          }} - {{ new Date(reservation.endDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }) }}
        </p>
        <p :class="'status ' + reservation.status.toLowerCase()">
          <TagIcon class="icon" />
          <strong>Status:</strong> {{ reservation.status }}
        </p>

        <button class="cancel-button" @click="openConfirmation(reservation.id)"
          :disabled="reservation.status === 'Storniert'">
          <XCircleIcon class="icon-button" />
          Reservierung stornieren
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <ExclamationTriangleIcon class="modal-icon" />
        <p>Möchtest du diese Reservierung wirklich stornieren?</p>
        <div class="modal-actions">
          <button class="confirm-btn" @click="confirmCancel">Ja, stornieren</button>
          <button class="cancel-btn" @click="closeModal">Abbrechen</button>
        </div>
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
  background-color: #fff;
  border-radius: 12px;
  position: relative;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 300px;
}

.modal-icon {
  width: 40px;
  height: 40px;
  color: #f59e0b;
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.confirm-btn {
  background-color: #e53935;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #ccc;
  color: black;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}

.back {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 1.2em;
  color: #007bff;
}
</style>