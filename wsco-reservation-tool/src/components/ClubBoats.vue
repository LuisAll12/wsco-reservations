<script setup>

</script>

<template>
    <div class="boats-container">
        <div class="back">
            <router-link to="/dashboard" class="router-link">Zurück</router-link>
        </div>
        <div class="boats-filter">
            <!-- Name-Filter -->
            <div class="form-group">
                <label>Bootsname</label>
                <select v-model="selectedName">
                    <option value="">Alle</option>
                    <option v-for="name in nameOptions" :key="name" :value="name">
                        {{ name }}
                    </option>
                </select>
            </div>

            <!-- Nummernschild-Filter -->
            <div class="form-group">
                <label>Nummernschild</label>
                <select v-model="selectedPlate">
                    <option value="">Alle</option>
                    <option v-for="plate in plateOptions" :key="plate" :value="plate">
                        {{ plate }}
                    </option>
                </select>
            </div>
        </div>
        <div class="boat-box">

        </div>
    </div>

</template>

<style scoped>
    .boats-container {
        padding: 24px;
        background: #fff;
        border-radius: 8px;
        margin: auto;
    }
    .router-link {
        color: #3498db;
        font-weight: bold;
        margin-bottom: 16px;
        display: inline-block;
    }
    .boats-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 160px;
}

select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.boat-box {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.boat-item {
  border: 1px solid #eee;
  padding: 16px;
  border-radius: 8px;
  background: #fafafa;
}

.boat-item h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.no-results {
  grid-column: 1 / -1;
  color: #666;
  text-align: center;
  padding: 16px;
}
</style>