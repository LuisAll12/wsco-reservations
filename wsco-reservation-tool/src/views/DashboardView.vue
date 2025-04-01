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
import getUserInfo from '../services/GetUserInfo'

const isValidSession = ref(false); // Initialize as false
const router = useRouter();
const reservations = ref([]);
const boats = ref([])
const currentUser = ref(null);



// Mock-Daten
const user = reactive({
  name: "Gast",
  timezone: "GMT +2",
  id: null,
  email: null,
  isAdmin: false
})

// const boats = ref([
//   { id: 1, name: "Globa kitchen" },
//   { id: 2, name: "Bronze house" },
//   { id: 3, name: "Festival bunch" }
// ])

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
    // User-Daten laden
    const userData = await getUserInfo();
    if (userData) {
      currentUser.value = userData;
      user.name = userData.FirstName || userData.Email.split('@')[0];
      user.id = userData.FK_Member?.[0];
      user.email = userData.Email;
      user.isAdmin = userData.IsAdmin === true;
    }
    
    // Reservations und Boats laden
    reservations.value = await getReservations();
    boats.value = await getBoats();
    
  } catch (error) {
    console.error('Initialization error:', error);
    router.push("/login");
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