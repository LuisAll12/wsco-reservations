<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount  } from 'vue'
import CalendarHeader from './CalendarHeader.vue'
import WeekGrid from './WeekGrid.vue'
import { startOfWeek, addDays } from 'date-fns'
import { useRouter } from "vue-router";
import { getReservations } from '../services/GetAllRes';
import { getUserBySessionKey } from '../services/GetUserInfo'
import NewReservationModal from './NewReservationModal.vue'

const showReservationModal = ref(false)
const router = useRouter();
const reservations = ref([]);
const boats = ref([])
const currentUser = ref(null);
const isSubmitting = ref(false);


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

const isSidebarOpen = ref(true);

const handleBoatChange = async (boatId) => {
  selectedBoat.value = boatId || null
  const start = currentWeek.value;
  const end = addDays(currentWeek.value, 7);
  reservations.value = [...await getReservations(start.toISOString(), end.toISOString(), boatId)];
}
// Update weekDays calculation
const weekDays = computed(() => {
  const start = startOfWeek(currentDate.value, { weekStartsOn: 1 })
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i))
})

const currentWeek = ref(startOfWeek(new Date(), { weekStartsOn: 1 }))

async function prevWeek() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() - 7)
  currentDate.value = newDate
  currentWeek.value = startOfWeek(newDate, { weekStartsOn: 1 })
  const start = currentWeek.value;
  const end = addDays(currentWeek.value, 7);
  reservations.value = []
  reservations.value = [...await getReservations(start.toISOString(), end.toISOString())];
  console.log("Reservierungen:", reservations.value);
}

async function nextWeek() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() + 7)
  currentDate.value = newDate
  currentWeek.value = startOfWeek(newDate, { weekStartsOn: 1 })
  const start = currentWeek.value;
  const end = addDays(currentWeek.value, 7);
  reservations.value = []
  reservations.value = [...await getReservations(start.toISOString(), end.toISOString())];
  console.log("Reservierungen:", reservations.value);
}

onMounted(async () => {
  try {
    currentUser.value = await getUserBySessionKey()
    console.log("Current user:", currentUser.value);

    user.name = currentUser.value?.firstName || "Gast";
    user.id = currentUser.value?.id;
    user.email = currentUser.value?.Email;
    user.isAdmin = currentUser.value?.Role === "Admin";

    const start = currentWeek.value;
    const end = addDays(currentWeek.value, 7);
    reservations.value = []
    reservations.value = [...await getReservations(start.toISOString(), end.toISOString())];
    console.log("Reservierungen:", reservations.value);

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );
      if (!response.ok) throw new Error("Fehler beim Abrufen der Boote");

      const data = await response.json();
      boats.value = data;
      console.log("Boote:", boats.value);
    } catch (error) {
      console.error("Fetch-Fehler:", error);
    }

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
  isSubmitting.value = true;
  try {
    const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/reservation/create`;

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reservationData),
      credentials: 'include'
    });

    showReservationModal.value = false;

    const start = currentWeek.value;
    const end = addDays(currentWeek.value, 7);
    reservations.value.map(await getReservations(start.toISOString(), end.toISOString()));

  } catch (error) {
    console.error('Error creating reservation:', error);

    if (error.response?.status === 409) {
      alert('Das Boot ist in diesem Zeitraum bereits gebucht!');
    } else {
      //alert('Fehler bei der Buchung: ' + error.message);
    }
  } finally {
    isSubmitting.value = false;
  }
}



function validateReservation(boatId, from, to) {
  if (!boatId || !from || !to) {
    return { valid: false, message: 'Bitte füllen Sie alle Felder aus' };
  }

  if (new Date(from) >= new Date(to)) {
    return { valid: false, message: 'Endzeit muss nach Startzeit liegen' };
  }

  if (!isBoatAvailable(boatId, from, to)) {
    return { valid: false, message: 'Boot in diesem Zeitraum bereits gebucht' };
  }

  return { valid: true };
}

</script>

<template>
  <main class="main-content min-h-full flex flex-col max-h-dvh">
    <CalendarHeader :user="user" :boats="boats" :current-date="currentDate" :selected-boat="selectedBoat"
      :currentUser="currentUser" @prev-week="prevWeek" @next-week="nextWeek" @new-reservation="handleNewReservation"
      @boat-change="handleBoatChange" />

    <WeekGrid class="flex-1" :days="weekDays" :reservations="reservations" :selected-boat="selectedBoat" :boats="boats"
      :current-user-id="currentUser?.id" />

  </main>
  <NewReservationModal v-if="showReservationModal" :show="showReservationModal" :boats="boats"
    :current-user="currentUser" @close="showReservationModal = false" @submit="submitReservation" />
</template>

<style>
/* Globale Styles */
.dashboard {
  background: #f5f6fa;
  transition: all 0.3s ease;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  z-index: 1000;
  /* High z-index to appear above everything */
}

.modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: hidden;
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