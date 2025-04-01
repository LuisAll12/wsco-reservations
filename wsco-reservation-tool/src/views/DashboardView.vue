<!-- src/App.vue -->
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'  
import Sidebar from '../components/Sidebar.vue'
import CalendarHeader from '../components/CalendarHeader.vue'
import WeekGrid from '../components/WeekGrid.vue'
import { startOfWeek, addDays } from 'date-fns'
import { useRouter } from "vue-router";
import getReservations from '../services/GetAllRes';
import getBoats from '../services/GetAllBoats'
import getUserBySessionKey from '../services/GetUserInfo'
import Cookies from 'js-cookie'
import NewReservationModal from '../components/NewReservationModal.vue'
import axios from "axios";

const showReservationModal = ref(false)
const router = useRouter();
const reservations = ref([]);
const boats = ref([])
const currentUser = ref(null);

const baseId = "appzBNlFfIJC6865x";

// Mock-Daten
const user = reactive({
  name: "Gast",
  timezone: "GMT +2",
  id: null,
  email: null,
  isAdmin: false
})

const currentDate = ref(new Date())
const selectedBoat = ref(null)

const handleBoatChange = (boatId) => {
  selectedBoat.value = boatId || null
}
// Update weekDays calculation
const weekDays = computed(() => {
  const start = startOfWeek(currentDate.value, { weekStartsOn: 1 })
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i))
})

const currentWeek = ref(startOfWeek(new Date(), { weekStartsOn: 1 }))

function prevWeek() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() - 7)
  currentDate.value = newDate
  currentWeek.value = startOfWeek(newDate, { weekStartsOn: 1 })
}

function nextWeek() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() + 7)
  currentDate.value = newDate
  currentWeek.value = startOfWeek(newDate, { weekStartsOn: 1 })
}

onMounted(async () => {
  try {
    const sessionKey = Cookies.get('sessionKey')
    if (sessionKey) {
      currentUser.value = await getUserBySessionKey(sessionKey)
      console.log("Current user:", currentUser.value); 
      
      user.name = currentUser.value?.fields?.FirstName || "Gast";
      user.id = currentUser.value?.id;
      user.email = currentUser.value?.fields?.Email;
      user.isAdmin = currentUser.value?.fields?.Role === "Admin";
    }
    
    reservations.value = await getReservations()
    boats.value = await getBoats()
  } catch (error) {
    console.error('Failed to load data:', error)
  }
})

function handleNewReservation() {
  console.log("handleNewReservation called"); 
  showReservationModal.value = true;
  console.log("showReservationModal value:", showReservationModal.value);
}

async function submitReservation(reservationData) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/Reservation`
    const headers = {
      Authorization: `Bearer ${import.meta.env.VITE_APP_API_KEY}`,
      "Content-Type": "application/json"
    }
    
    await axios.post(url, reservationData, { headers })
    showReservationModal.value = false
    reservations.value = await getReservations()
  } catch (error) {
    console.error('Error creating reservation:', error)
  }
}
</script>

<template>
  <div class="dashboard">
    <Sidebar :user="user" />
    
    <main class="main-content">
      <CalendarHeader 
        :user="user"
        :boats="boats"
        :current-date="currentDate"
        :selected-boat="selectedBoat"
        @prev-week="prevWeek"
        @next-week="nextWeek"
        @new-reservation="handleNewReservation"
        @boat-change="handleBoatChange"
      />
      
      <WeekGrid 
        :days="weekDays"
        :reservations="reservations"
        :selected-boat="selectedBoat"
        :boats="boats"
        :current-user-id="currentUser?.id"
      />

    </main>
    <NewReservationModal 
      v-if="showReservationModal"
      :show="showReservationModal" 
      :boats="boats"
      :current-user="currentUser"
      @close="showReservationModal = false"
      @submit="submitReservation"
    />
  </div>
</template>

<style>
/* Globale Styles */
.dashboard {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  background: #f5f6fa;
}

.main-content {
  padding: 2rem;
}

/* Time Scale Styles */
.time-scale {
  display: flex;
  flex-direction: column;
  width: 60px;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  flex-grow: 1;
}

.day-column {
  position: relative;
  border-right: 1px solid #e0e0e0;
}

/* Event Styles */
.calendar-event {
  position: absolute;
  left: 4px;
  right: 4px;
  border-radius: 8px;
  padding: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex !important;
  opacity: 1 !important;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* High z-index to appear above everything */
}

.modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 1001;
  display: block !important;
  opacity: 1 !important;
}

/* Ensure nothing in main-content overlaps */
.main-content {
  position: relative;
  z-index: 1;
}
</style>