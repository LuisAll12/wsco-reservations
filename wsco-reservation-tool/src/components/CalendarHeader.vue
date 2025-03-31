<!-- src/components/CalendarHeader.vue -->
<script setup>
defineProps({
  user: Object,
  boats: Array,
  currentDate: Date
})

defineEmits(['prev-week', 'next-week', 'new-reservation'])
</script>

<template>
  <header class="calendar-header">
    <div class="header-top">
      <h2>Hi, {{ user.name }}</h2>
      <div class="controls">
        <select>
          <option v-for="boat in boats" :key="boat.id" :value="boat.id">
            {{ boat.name }}
          </option>
        </select>
        <button @click="$emit('new-reservation')">
          New Reservation
        </button>
      </div>
    </div>

    <div class="week-navigation">
      <button @click="$emit('prev-week')">&lt;</button>
      <span>{{ currentDate.toLocaleDateString('de-CH', { month: 'long', year: 'numeric' }) }}</span>
      <button @click="$emit('next-week')">&gt;</button>
    </div>
  </header>
</template>

<style scoped>
.calendar-header {
  margin-bottom: 2rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  gap: 1rem;
}

select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.week-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
}

button {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>