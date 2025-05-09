<template>
  <div class="dashboard">
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
.AdminDash {
  padding: 2rem;
  display: block;
  height: 100dvh;
}

.grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.back-router {
  display: inline-block;
  margin-bottom: 1rem;
  color: #3498db;
  font-size: 1.2rem;
}
</style>
