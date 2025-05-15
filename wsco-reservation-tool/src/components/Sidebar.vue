<!-- src/components/Sidebar.vue -->
<script setup>
import { HomeIcon, ExclamationTriangleIcon, LifebuoyIcon, Cog6ToothIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, WrenchScrewdriverIcon, QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import { authCheck, logoutUser } from '../services/auth';
import router from '../router/router';
const isAdmin = ref(false);


const isLoggedin = async () => { return await authCheck(); }

const isSidebarOpen = ref(true);

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
    <aside class="sidebar" :class="{ collapsed: !isSidebarOpen }">
      <div class="sidebar-header">
        <h1>WSCO Reservationen</h1>
      </div>

      <section class="reservation-actions">
        <div class="action-item">
          <router-link to="/dashboard" class="router-link">
            <HomeIcon class="icon" /> Dashboard
          </router-link>
        </div>

        <div class="action-item">
          <router-link to="/dashboard/schaden-melden" class="router-link">
            <ExclamationTriangleIcon class="icon" /> Schaden melden
          </router-link>
        </div>

        <div class="action-item">
          <router-link to="/dashboard/unsere-boote" class="router-link">
            <LifebuoyIcon class="icon" /> Unsere Boote
          </router-link>
        </div>

        <div class="action-item">
          <router-link to="/dashboard/meine-reservierungen" class="router-link">
            <UserCircleIcon class="icon" /> Meine Reservierungen
          </router-link>
        </div>

        <div class="action-item" v-if="!isAdmin">
          <router-link to="/dashboard/admin" class="router-link">
            <WrenchScrewdriverIcon class="icon" /> Admin Dashboard
          </router-link>
        </div>

        <br>

        <div class="action-item" v-if="!isAdmin">
          <router-link to="/dashboard/hilfe" class="router-link">
            <QuestionMarkCircleIcon class="icon" /> Hilfe
          </router-link>
        </div>
        <div class="action-item" v-if="!isAdmin">
          <router-link to="/dashboard/settings" class="router-link">
            <Cog6ToothIcon class="icon" /> Einstellungen
          </router-link>
        </div>

        <br>

        <button class="logout-btn" v-if="isLoggedin" @click="logout">
          <ArrowLeftOnRectangleIcon class="icon" />
          Ausloggen
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
  width: 240px;
  height: 100vh;
  top: 0;
  position: fixed;
}

.sidebar-wrapper {
  width: 288px;
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

.icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  flex-shrink: 0;
}

.router-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: bold;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: white;
  color: #2c3e50;
  font-weight: bold;
  border: none;
  padding: 12px;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1rem;
}

.logout-btn:hover {
  background-color: #f0f0f0;
}

.logout-btn .icon {
  width: 20px;
  height: 20px;
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