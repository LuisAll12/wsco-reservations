<!-- src/App.vue -->
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import { startOfWeek, addDays } from 'date-fns'
import { useRouter } from "vue-router";
import { getReservations } from '../services/GetAllRes';
import { getUserBySessionKey } from '../services/GetUserInfo'

const reservations = ref([]);
const currentUser = ref(null);




// Mock-Daten
const user = reactive({
  name: "Gast",
  timezone: "GMT +2",
  id: null,
  email: null,
  isAdmin: false
})


const isSidebarOpen = ref(true);
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}



const currentWeek = ref(startOfWeek(new Date(), { weekStartsOn: 1 }))


onMounted(async () => {
  try {
    currentUser.value = await getUserBySessionKey()

    const start = currentWeek.value;
    const end = addDays(currentWeek.value, 7);
    reservations.value = [...await getReservations(start.toISOString(), end.toISOString())];


  } catch (error) {
    console.error('Failed to load data:', error)
  }
})



</script>

<template>
  <div class="dashboard">
    <Sidebar :user="user" />
    <main class="main-content overflow-hidden">
      <router-view class="overflow-hidden" />
    </main>
  </div>
</template>

<style scoped>
/* Globale Styles */
.dashboard {
  display: grid;
  grid-template-columns: 288px 1fr;
  background: #f5f6fa;
  transition: all 0.3s ease;
}



.main-content {
  padding: 1rem;
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