<!-- src/components/Sidebar.vue -->
<script setup>
import SidebarCalendar from './SidebarCalendar.vue'
import {ref} from 'vue'
import { authCheck, logoutUser } from '../services/auth';
import router from '../router/router';
const isAdmin = ref(false);


const isLoggedin = async () => { return await authCheck(); }

const isSidebarOpen = ref(true);

function toggleSidebar() {
  console.log("shdn")
  isSidebarOpen.value = !isSidebarOpen.value;
}



defineProps({
  user: Object,
  currentUser: Object,
  currentWeek: Date,
  currentDate: Date
})

async function logout() {
    try {
        await logoutUser();
        router.push('/login');
    } catch (error) {
        console.error('Logout failed:', error);
    }
}
</script>

<template>

  <div class="sidebar-wrapper">
    <button class="toggle-button" @click="toggleSidebar">☰</button>
    <aside class="sidebar" :class="{ collapsed: !isSidebarOpen }">  
    <div class="sidebar-header">
      <br>
      <h1>WSCO Reservationen</h1>
    </div>
    
    <nav class="sidebar-nav">
      <ul>
        <li v-for="page in ['Einstellungen', 'Hilfe']" 
            :key="page"
            class="nav-item">
          {{ page }}
        </li>
      </ul>
    </nav>

    <section class="reservation-actions">
      <div class="action-item">
        <span><router-link to="/dashboard/schaden-melden" class="router-link">Schaden melden</router-link></span>
      </div>
      <div class="action-item">
        <span><router-link to="/dashboard/unsere-boote" class="router-link">Unsere Boote</router-link></span>
      </div>
      <div class="action-item">
        <span><router-link to="/dashboard/meine-reservierungen" class="router-link">Meine Reservierungen</router-link></span>
      </div>
      <div class="action-item" v-if="!isAdmin">
        <span><router-link to="/dashboard/admin" class="router-link">Admin Dashboard</router-link></span>
      </div>
        <button v-if="isLoggedin" @click="logout">
          Ausloggen
          <div class="arrow-wrapper">
            <div class="arrow"></div>
          </div>
        </button>

    </section>
    <!-- <SidebarCalendar 
      :current-week="currentWeek"
      :current-date="currentDate"
    /> -->
    <!-- <div class="user-info">
      <h3>{{ currentUser?.fields?.FirstName }} {{ currentUser?.fields?.LastName }}</h3>
      <p>{{ currentUser?.fields?.Email }}</p>
      <p>Role: {{ currentUser?.fields?.Role }}</p>
    </div> -->
  </aside>
  </div>
</template>

<style scoped>
.sidebar-wrapper {
  position: relative;
}

.toggle-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2000;
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}


.sidebar.collapsed {
  width: 60px;
}

.sidebar.collapsed .sidebar-header,
.sidebar.collapsed .reservation-actions,
.sidebar.collapsed .sidebar-nav {
  display: none;
}
.sidebar {
  background: #2c3e50;
  color: white;
  padding: 1.5rem;
  height: 100vh;
  position: sticky;
  top: 0;
}

.nav-item {
  padding: 12px;
  border-radius: 8px;
  margin: 4px 0;
  cursor: pointer;
  transition: background 0.3s;
}

.nav-item:hover {
  background: #34495e;
}

.reservation-actions {
  margin-top: 2rem;
}

.action-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #34495e;
  margin: 8px 0;
  border-radius: 8px;
}
.router-link {
  color: white;
  text-decoration: none;
  font-weight: bold;
}
button {
    --primary-color: #ffff;
    --secondary-color: #002152;
    --hover-color: #eceff2;
    --arrow-width: 10px;
    --arrow-stroke: 2px;
    box-sizing: border-box;
    border: 0;
    border-radius: 50px;
    color: var(--secondary-color);
    padding: 1em 1.8em;
    background: var(--primary-color);
    display: flex;
    transition: 0.2s background;
    align-items: center;
    gap: 0.6em;
    font-weight: bold;
}

button .arrow-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

button .arrow {
    margin-top: 1px;
    width: var(--arrow-width);
    background: var(--primary-color);
    height: var(--arrow-stroke);
    position: relative;
    transition: 0.2s;
}

button .arrow::before {
    content: "";
    box-sizing: border-box;
    position: absolute;
    border: solid var(--secondary-color);
    border-width: 0 var(--arrow-stroke) var(--arrow-stroke) 0;
    display: inline-block;
    top: -3px;
    right: 3px;
    transition: 0.2s;
    padding: 3px;
    transform: rotate(-45deg);
}

button:hover {
    background-color: var(--hover-color);
}

button:hover .arrow {
    background: var(--secondary-color);
}

button:hover .arrow:before {
    right: 0;
}
</style>