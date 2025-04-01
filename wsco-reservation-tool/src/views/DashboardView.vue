<!-- src/App.vue -->
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'  
import Sidebar from '../components/Sidebar.vue'
import CalendarHeader from '../components/CalendarHeader.vue'
import WeekGrid from '../components/WeekGrid.vue'
import { startOfWeek, addDays } from 'date-fns'
import { useRouter } from "vue-router";
import getReservations from '../services/GetAllRes';

const isValidSession = ref(false); // Initialize as false
const router = useRouter();
const reservations = ref([]);
// Mock-Daten
const user = reactive({
  name: "Amy",
  timezone: "GMT +2"
})

const boats = ref([
  { id: 1, name: "Globa kitchen" },
  { id: 2, name: "Bronze house" },
  { id: 3, name: "Festival bunch" }
])

const reservation = ref([
{
    id: 1,
    title: "Speaking club",
    start: "07:45",
    end: "08:20",
    date: "2024-08-12T00:00:00", // Datum hinzufügen
    boat: 1,
    location: "Globa kitchen",
    color: "#FFD700"
  },
  {
    id: 1,
    title: "Speaking club",
    start: "07:45",
    end: "08:20",
    date: "2025-03-31T08:00:00", // Datum hinzufügen
    boat: 1,
    location: "Globa kitchen",
    color: "#FFD700"
  },
  {
    id: 1,
    title: "Speaking club",
    start: "07:45",
    end: "08:20",
    date: "2024-08-12T00:00:00", // Datum hinzufügen
    boat: 1,
    location: "Globa kitchen",
    color: "#FFD700"
  },
  {
    id: 1,
    title: "Speaking club",
    start: "10:45",
    end: "08:20",
    date: "2024-08-12T00:00:00", // Datum hinzufügen
    boat: 1,
    location: "Globa kitchen",
    color: "#FFD700"
  },
])

const currentDate = ref(new Date())
const selectedBoat = ref(null)

// Update weekDays calculation
const weekDays = computed(() => {
  const start = startOfWeek(currentDate.value, { weekStartsOn: 1 })
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i))
})

const currentWeek = ref(startOfWeek(new Date(), { weekStartsOn: 1 }))

function prevWeek() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() - 7)
  currentDate.value = newDate // 👈 Korrekte Zuweisung
  currentWeek.value = startOfWeek(newDate, { weekStartsOn: 1 })
}

function nextWeek() {
  const newDate = new Date(currentDate.value)
  newDate.setDate(newDate.getDate() + 7)
  currentDate.value = newDate // 👈 Korrekte Zuweisung
  currentWeek.value = startOfWeek(newDate, { weekStartsOn: 1 })
}

onMounted(async () => {
  try {
    reservations.value = await getReservations();
    console.log('Fetched reservations:', reservations.value);
  } catch (error) {
    console.error('Failed to load reservations:', error);
  }
});

</script>

<template>
  <div class="dashboard">
    <Sidebar :user="user" />
    
    <main class="main-content">
      <CalendarHeader 
        :user="user"
        :boats="boats"
        :current-date="currentDate"
        @prev-week="prevWeek"
        @next-week="nextWeek"
        @new-reservation="handleNewReservation"
      />
      
      <WeekGrid 
        :days="weekDays"
        :reservations="reservations"
        :selected-boat="selectedBoat"
      />
    </main>
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
</style>