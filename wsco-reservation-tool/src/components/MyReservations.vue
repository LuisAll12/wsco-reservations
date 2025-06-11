<script setup>
import { onMounted, ref, computed } from 'vue'
import {
  CalendarIcon,
  ClockIcon,
  TagIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { getUsersReservaitons, GetBoat, SetReservationAsCancelled, getTasklist, CompleteChecklist } from '../services/GetUserRes'
import checkBoatAvailability from '../services/CheckBoatAvailability'

const reservations = ref([])

onMounted(async () => {
  reservations.value = [...await getUsersReservaitons()]
  for (const reservation of reservations.value) {
    const boat = await GetBoat(reservation.boat.id)
    reservation.boat = boat
  }
})

function canBeCheckedIn(reservation) {
  const now = new Date()
  const start = new Date(reservation.startDate)
  const diffInMs = start.getTime() - now.getTime()
  return diffInMs <= 60 * 60 * 1000 && reservation.status === 'created'
}

const cancelshowModal = ref(false)
const checkinshowModal = ref(false)
const selectedReservationId = ref(null)
const tasklistItems = ref([])

function openConfirmation(id) {
  selectedReservationId.value = id
  cancelshowModal.value = true
}

async function confirmCancel() {
  const reservation = reservations.value.find(r => r.id === selectedReservationId.value)
  if (reservation && reservation.status !== 'cancelled') {
    reservation.status = 'cancelled'
  }
  await SetReservationAsCancelled(reservation.id)

  closeModal()
}

function closeModal() {
  selectedReservationId.value = null
  cancelshowModal.value = false
}
const statusTranslation = {
  created: 'Erstellt',
  checkedin: 'Eingecheckt',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert'
};

async function checkIn(id) {
  console.log('Check-in for reservation ID:', id)
  const reservation = reservations.value.find(r => r.id === id)
  checkinshowModal.value = true;

  tasklistItems.value = await getTasklist(id);
  console.log('Tasklist:', tasklistItems.value);
}

async function finish(id) {
  await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/reservation/finish/${id}`, { method: "PUT", credentials: 'include' })
}

const taskStatus = ref([])

const completedTasksCount = computed(() => {
  return taskStatus.value.filter(Boolean).length
})

const totalTasks = computed(() => {
  return tasklistItems.value.checklist.items.length
})

const allTasksCompleted = computed(() => {
  return completedTasksCount.value === totalTasks.value
})

function toggleTask(index) {
  taskStatus.value[index] = !taskStatus.value[index]
}

async function confirmChecklist() {
  if (allTasksCompleted.value) {
    // Send your request here
    await CompleteChecklist(tasklistItems.value.reservation.id)

    location.reload()
    checkinshowModal.value = false
  }
}

function formatCheckinTime(reservation) {
  const checkinDate = new Date(new Date(reservation.startDate).getTime() - 60 * 60 * 1000);
  const now = new Date();

  const isToday =
    checkinDate.getDate() === now.getDate() &&
    checkinDate.getMonth() === now.getMonth() &&
    checkinDate.getFullYear() === now.getFullYear();

  if (isToday) {
    return checkinDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return checkinDate.toLocaleDateString() + ' ' + checkinDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

function canBeCheckedOut(reservation) {
  const now = new Date();
  const end = new Date(reservation.endDate);
  const diffInMs = end.getTime() - now.getTime();
  return diffInMs <= 0 && reservation.status === 'checkedin'
}

</script>

<template>
  <div class="container">
    <h1 class="title">Meine Reservierungen</h1>
    <div class="reservation-list">
      <div class="reservation-card" v-for="reservation in reservations" :key="reservation.id">
        <div class="card-header">
          <img :src="reservation.boat.imgUrl || 'https://source.unsplash.com/400x200/?boat'" class="boat-img" />
          <div class="boat-info">
            <h2 class="boat-name">{{ reservation.boat.name }}</h2>
            <p class="boat-type">Typ: {{ reservation.boat.Type }}</p>
          </div>
        </div>

        <div class="card-body">
          <p>
            <CalendarIcon class="icon" />
            <strong>Datum:</strong> {{ new Date(reservation.startDate).toLocaleDateString() }}
          </p>
          <p>
            <ClockIcon class="icon" />
            <strong>Uhrzeit:</strong> {{ new Date(reservation.startDate).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }) }} -
            {{ new Date(reservation.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
          </p>
          <p :class="'status ' + reservation.status.toLowerCase()">
            <TagIcon class="icon" />
            <strong>Status:</strong> {{ statusTranslation[reservation.status] || reservation.status }}
          </p>
        </div>
        <div class="card-buttons">
          <button v-if="canBeCheckedIn(reservation)" class="checkin-button" @click="checkIn(reservation.id)">
            <ClockIcon class="icon-button" />
            Reservierung entgegennehmen
          </button>
          <button v-else-if="reservation.status === 'checkedin' && canBeCheckedOut(reservation)"
            @click="finish(reservation.id)" class="checkin-button">
            <ClockIcon class="icon-button" />
            Reservation Abgeben und Beenden
          </button>
          <button v-else-if="reservation.status === 'checkedin' && !canBeCheckedOut(reservation)" class="checkin-button"
            disabled>
            <ClockIcon class="icon-button" />
            Reservierung kann in {{ Math.floor((new Date(reservation.endDate) - new Date()) / (1000 * 60 * 60))
            }} Stunden {{ Math.ceil((new Date(reservation.endDate) - new Date()) / (1000 * 60)) % 60 }} Minuten
            abgegeben werden
          </button>
          <button v-else-if="reservation.status === 'completed'" class="checkin-button" disabled>
            <ClockIcon class="icon-button" />
            Reservierung bereits abgeschlossen
          </button>
          <button v-else-if="reservation.status === 'cancelled'" class="checkin-button" disabled>
            <ClockIcon class="icon-button" />
            Reservierung storniert
          </button>
          <button v-else class="checkin-button" disabled>
            <ClockIcon class="icon-button" />
            Engegennahme möglich ab {{ formatCheckinTime(reservation) }}
          </button>
          <button class="cancel-button" @click="openConfirmation(reservation.id)"
            :disabled="reservation.status === 'cancelled' || reservation.status === 'completed' || reservation.status === 'checkedin'">
            <XCircleIcon class="icon-button" />
            Reservierung stornieren
          </button>
        </div>

      </div>
      <div v-if="!reservations">
        Sie haben noch keine Reservierungen.
      </div>
    </div>

    <!-- Modal -->
    <div v-if="cancelshowModal" class="modal-overlay">
      <div class="modal">
        <ExclamationTriangleIcon class="modal-icon" />
        <p>Möchtest du diese Reservierung wirklich stornieren?</p>
        <div class="modal-actions">
          <button class="confirm-btn" @click="confirmCancel">Ja, stornieren</button>
          <button class="cancel-btn" @click="closeModal">Abbrechen</button>
        </div>
      </div>
    </div>
    <div v-if="checkinshowModal" class="modal-overlay">
      <div class="checkin-modal">
        <div class="header">
          <XCircleIcon class="top-cancel-icon" @click="checkinshowModal = false" />
          <h3>Reservation entgegennehmen</h3>
        </div>

        <form class="modal-form" @submit.prevent="confirmChecklist">
          <h2>{{ tasklistItems.checklist.name }}</h2>
          <p class="description">{{ tasklistItems.checklist.description }}</p>

          <div v-for="(task, index) in tasklistItems.checklist.items" :key="index" class="task"
            :class="{ 'completed': taskStatus[index] }" @click="toggleTask(index)">
            <div class="checkbox-container">
              <input type="checkbox" v-model="taskStatus[index]" hidden />
              <span class="checkmark"></span>
            </div>
            <span class="task-text">{{ task }}</span>
          </div>

          <button type="submit" :class="{ 'enabled': allTasksCompleted }" :disabled="!allTasksCompleted">
            {{ allTasksCompleted ? 'Bestätigen' : `Abgeschlossen (${completedTasksCount}/${totalTasks})` }}
          </button>
        </form>
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

.boat-img {
  width: 100%;
  height: auto;
  border-radius: 6px;
  margin-bottom: 12px;
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

.status.created {
  color: green;
}

.status.checkedin {
  color: orange;
}

.status.cancelled {
  color: red;
}

.card-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 12px;
}

.checkin-button {
  padding: 10px 20px;
  background-color: #10b981;
  /* Grün */
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.checkin-button:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-1px);
}

.checkin-button:disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}

.cancel-button {
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
  backdrop-filter: blur(3px);
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
  position: relative;
}

.checkin-modal {
  background: white;
  padding: 24px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 40%;
  max-width: 500px;
  position: relative;
  animation: fadeIn 0.2s ease-in-out;
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

.top-cancel-icon {
  width: 25px;
  height: 25px;
  color: #e53935;
  cursor: pointer;
  position: absolute;
  top: 20px;
  right: 20px;
}

.task-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.description {
  margin-bottom: 1rem;
  font-style: italic;
  color: #555;
}

.task {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

input[type='checkbox'] {
  display: none;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid #ccc;
  margin-right: 0.75rem;
  position: relative;
  transition: border-color 0.2s ease;
}

input[type='checkbox']:checked+.custom-checkbox {
  border-color: #4caf50;
  background-color: #4caf50;
}

input[type='checkbox']:checked+.custom-checkbox::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.task-text {
  font-size: 1rem;
  transition: color 0.2s ease;
}

.task-text.checked {
  text-decoration: line-through;
  color: #999;
}

@keyframes fadeIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: overlayEnter 0.3s ease-out;
}

.checkin-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: modalEnter 0.3s ease-out;
}

.header {
  position: relative;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.top-cancel-icon {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s ease;
}

.top-cancel-icon:hover {
  color: #ef4444;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-form h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.task {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.task:hover {
  background-color: #f3f4f6;
}

.task-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
  cursor: pointer;
}

.task-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #7c3aed;
  cursor: pointer;
}

button[type="submit"] {
  background-color: #7c3aed;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 1rem;
}

button[type="submit"]:hover {
  background-color: #6d28d9;
}

button[type="submit"]:active {
  background-color: #5b21b6;
}

@keyframes overlayEnter {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes modalEnter {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .checkin-modal {
    width: 95%;
    padding: 16px;
  }

  .header h3 {
    font-size: 1.25rem;
  }
}

.task {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task.completed {
  background-color: #f0fdf4;
  border-color: #22c55e;
}

.checkbox-container {
  position: relative;
  width: 20px;
  height: 20px;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.task.completed .checkmark {
  background-color: #22c55e;
  border-color: #22c55e;
}

.checkmark::after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.task.completed .checkmark::after {
  display: block;
}

.task-text {
  flex-grow: 1;
}

button[type="submit"] {
  background-color: #e5e7eb;
  color: #6b7280;
  cursor: not-allowed;
}

button[type="submit"].enabled {
  background-color: #22c55e;
  color: white;
  cursor: pointer;
}

button[type="submit"]:hover.enabled {
  background-color: #16a34a;
}
</style>