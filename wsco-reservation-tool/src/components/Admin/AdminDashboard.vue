<template>
  <div class="dashboard">
    <router-link class="back-router" to="/dashboard">Zurück</router-link>
    <h1>Admin Panel</h1>
    <div class="grid">
      <BoatStatsWidget />
      <BoatCreateDialog />
      <DamageReportsWidget />
      <UpcomingReservationsWidget />
    </div>
  </div>
</template>

<script setup>
import BoatCreateDialog from './BoatCreateDialog.vue';
import DamageReportsWidget from './DamageReportsWidget.vue';
import BoatStatsWidget from './BoatStatsWidget.vue';
import UpcomingReservationsWidget from './UpcomingReservationsWidget.vue';


</script>

<style scoped>
.dashboard {
  padding: 2rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
.back-router {
  display: inline-block;
  margin-bottom: 1rem;
  color: #3498db;
  font-size: 1.2rem;
}
</style>
