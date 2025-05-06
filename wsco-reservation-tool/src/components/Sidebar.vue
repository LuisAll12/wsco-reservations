<!-- src/components/Sidebar.vue -->
<script setup>
import SidebarCalendar from './SidebarCalendar.vue'

defineProps({
  user: Object,
  currentUser: Object,
  currentWeek: Date,
  currentDate: Date
})
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1>WSCO Reservationen</h1>
    </div>
    
    <nav class="sidebar-nav">
      <ul>
        <li v-for="page in ['Dashboard', 'Einstellungen', 'Hilfe', 'Meine Reservierungen']" 
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
</template>

<style scoped>
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
</style>