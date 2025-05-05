<!-- src/components/CalendarHeader.vue -->
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  user: Object,
  boats: Array,
  currentDate: Date,
  selectedBoat: [String, Number],
  currentUser: Object
})

const emit = defineEmits(['prev-week', 'next-week', 'new-reservation', 'boat-change'])

const selectedBoatId = ref(props.selectedBoat || '')

watch(selectedBoatId, (newVal) => {
  emit('boat-change', newVal)
})

</script>

<template>
<header class="calendar-header">
    <div class="header-top">
      <h2>Ahoi, {{ user.name }}</h2>
      <div class="controls">
        <div class="filter-display" v-if="selectedBoatId">
          <span class="filter-value">
            {{
              selectedBoatId ? 
              boats.find(b => b.id === selectedBoatId)?.fields?.Name + 
              ` (${boats.find(b => b.id === selectedBoatId)?.fields?.Numberplate})` : 
              'Alle Boote'
            }}
          </span>
        </div>
        <select v-model="selectedBoatId">
          <option value="">Alle Boote</option>
          <option 
            v-for="boat in boats" 
            :key="boat.id" 
            :value="boat.id"
            :disabled="boat.fields.Availability === false"
          >
            {{ boat.fields.Name }} ({{ boat.fields.Numberplate }})
            <span v-if="boat.fields.Availability === false"> - Nicht verfügbar</span>
          </option>
        </select>
        <button @click="$emit('new-reservation')">
          Neue Reservation
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
.filter-display {
  padding: 8px 12px;
  background: #f0f0f0;
  border-radius: 6px;
  margin-right: 1rem;
  font-size: 0.9em;
}
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
.filter-status {
  display: flex;
  align-items: center;
  margin-right: 1rem;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
}

.filter-label {
  font-weight: 600;
  margin-right: 8px;
  color: #555;
}

.filter-value {
  color: #2c3e50;
}
</style>