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
.dashboard {
  padding: 2rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
</style>
