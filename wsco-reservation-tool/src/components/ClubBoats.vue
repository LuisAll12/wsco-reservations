<script setup>
import { ref, computed } from 'vue'

const boats = ref([
  {
    id: 1,
    name: 'Sea Explorer',
    plate: 'ZH 12345',
    image: 'https://i.pinimg.com/736x/c0/d4/bb/c0d4bb1c8db652872de1d5ffb94b6475.jpg',
    description: 'Ideal für Küstentouren mit Familie.',
    capacity: 6,
    pricePerHour: 75
  },
  {
    id: 2,
    name: 'Ocean Breeze',
    plate: 'LU 54321',
    image: 'https://i.pinimg.com/736x/c0/d4/bb/c0d4bb1c8db652872de1d5ffb94b6475.jpg',
    description: 'Komfortables Motorboot für Ausflüge.',
    capacity: 4,
    pricePerHour: 65
  },
  {
    id: 3,
    name: 'River Runner',
    plate: 'BE 11122',
    image: 'https://i.pinimg.com/736x/14/25/47/142547271c036b14137604901d35e2c7.jpg',
    description: 'Wendig und perfekt für Flüsse.',
    capacity: 2,
    pricePerHour: 50
  },
  {
    id: 4,
    name: 'Sea Explorer',
    plate: 'AG 99887',
    image: 'https://i.pinimg.com/736x/14/25/47/142547271c036b14137604901d35e2c7.jpg',
    description: 'Zweites Modell, größerer Tank.',
    capacity: 8,
    pricePerHour: 90
  }
])

const selectedName = ref('')
const selectedPlate = ref('')

const nameOptions = computed(() => [...new Set(boats.value.map(b => b.name))])
const plateOptions = computed(() => [...new Set(boats.value.map(b => b.plate))])

const filteredBoats = computed(() => {
  return boats.value.filter(boat => {
    const matchName = selectedName.value === '' || boat.name === selectedName.value
    const matchPlate = selectedPlate.value === '' || boat.plate === selectedPlate.value
    return matchName && matchPlate
  })
})
</script>

<template>
  <div class="boats-container">
    <div class="back">
      <router-link to="/dashboard" class="router-link">← Zurück zum Dashboard</router-link>
    </div>

    <h1 class="title">Verfügbare Boote</h1>

    <div class="boats-filter">
      <div class="form-group">
        <label>Bootsname</label>
        <select v-model="selectedName">
          <option value="">Alle</option>
          <option v-for="name in nameOptions" :key="name" :value="name">{{ name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Nummernschild</label>
        <select v-model="selectedPlate">
          <option value="">Alle</option>
          <option v-for="plate in plateOptions" :key="plate" :value="plate">{{ plate }}</option>
        </select>
      </div>
    </div>

    <div class="boat-box">
      <div v-if="filteredBoats.length === 0" class="no-results">
        Keine Boote gefunden.
      </div>

      <router-link
        v-for="boat in filteredBoats"
        :key="boat.id"
        :to="`/dashboard/unsere-boote/${boat.id}`"
        class="boat-item-link">
        <div class="boat-item">
          <img :src="boat.image" :alt="boat.name" class="boat-image" />
          <div class="boat-details">
            <h2>{{ boat.name }}</h2>
            <p class="desc">{{ boat.description }}</p>
            <p><strong>Nummernschild:</strong> {{ boat.plate }}</p>
            <p><strong>Kapazität:</strong> {{ boat.capacity }} Personen</p>
            <p><strong>Preis:</strong> CHF {{ boat.pricePerHour.toFixed(2) }} / Stunde</p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.boats-container {
  max-width: 1200px;
  margin: auto;
  padding: 32px;
  background-color: #fefefe;
  font-family: 'Segoe UI', sans-serif;
}

.router-link {
  color: #2980b9;
  font-size: 16px;
  text-decoration: none;
  margin-bottom: 24px;
  display: inline-block;
}

.title {
  font-size: 32px;
  text-align: center;
  margin-bottom: 32px;
  color: #333;
}

.boats-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 32px;
  justify-content: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  font-size: 16px;
}

label {
  margin-bottom: 8px;
  font-weight: bold;
  color: #444;
}

select {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 15px;
}

.boat-box {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.boat-item {
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}
.boat-item-link {
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;
}

.boat-item-link:hover {
  transform: scale(1.02);
}
.boat-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.boat-details {
  padding: 16px;
}

.boat-details h2 {
  font-size: 22px;
  margin-bottom: 8px;
  color: #2c3e50;
}

.desc {
  font-size: 15px;
  margin-bottom: 12px;
  color: #555;
}

.boat-details p {
  margin: 6px 0;
  font-size: 15px;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  font-size: 18px;
  padding: 24px;
  color: #888;
}
</style>
