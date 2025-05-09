<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { getUserReservations, createDamageReport } from '../services/ReportDamageService.js'
import { getCurrentUserFromSession } from '../services/sessionKeyService.js'

const reservations = ref([])
const type = ref('')
const reason = ref('')
const description = ref('')
const selectedReservationId = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)
const contactEmail = 'support@wsco.ch'

// Airtable-kompatible Typenliste
const typeOptions = ['Loch', 'Fehlendes Teil', 'Motor', 'Elektronik', 'Sonstiges']

const canSubmit = computed(() =>
  type.value &&
  reason.value.trim().length > 0 &&
  description.value.trim().length > 0 &&
  selectedReservationId.value
)

async function submitDamageReport() {
  if (!canSubmit.value) return
  isSubmitting.value = true

  try {
    const selected = reservations.value.find(r => r.id === selectedReservationId.value)
    const user = await getCurrentUserFromSession()

    const fields = {
        Type:          type.value,
        Reason:        reason.value.trim(),
        Description:   description.value.trim(),
        Reservation:   [ selected.id ],   // Link zu Reservation-Tabelle
        CreatedPerson: [ user.id ]        // Link zu User-Tabelle
        };

    await createDamageReport(fields)
    alert('Schadensmeldung erfolgreich gesendet.')

    // Reset
    type.value = ''
    reason.value = ''
    description.value = ''
    selectedReservationId.value = ''
  } catch (err) {
    console.error(err)
    alert('Fehler beim Senden der Schadensmeldung.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  const user = await getCurrentUserFromSession()
  console.log('Aktueller Benutzer:', user)
  if (user) {
    // ACHTUNG: hier schreiben wir _in_ die reactive ref, nicht in eine neue Variable
    reservations.value = await getUserReservations(user.fields.MemberNR)
    console.log('gefilterte Reservations:', reservations.value)
  } else {
    console.warn('Kein eingeloggter Benutzer gefunden')
  }
  isLoading.value = false
})
</script>

<template>
  <div class="report-form">
    <h2>Schaden melden</h2>

    <div v-if="isLoading">Reservationen werden geladen...</div>

    <div v-else>
      <div class="form-group">
        <label>Reservation</label>
        <select v-model="selectedReservationId">
          <option disabled value="">Bitte wählen</option>
          <option
            v-for="res in reservations"
            :key="res.id"
            :value="res.id"
          >
            Reservation #{{ res.fields.ReservationNr }} –
            {{ new Date(res.fields.From).toLocaleString() }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Typ des Schadens</label>
        <select v-model="type">
          <option disabled value="">Typ auswählen</option>
          <option v-for="opt in typeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Kurzer Grund</label>
        <input type="text" v-model="reason" placeholder="z. B. Motor startet nicht" />
      </div>

      <div class="form-group">
        <label>Beschreibung</label>
        <textarea
          v-model="description"
          placeholder="Beschreibe den Schaden ausführlich..."
        ></textarea>
      </div>

      <div class="form-group">
        <label>Kontakt</label>
        <p>
          Für weitere Bilder sende bitte eine Mail an:
          <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
        </p>
      </div>

      <div class="form-group">
        <button
          class="btn primary"
          @click="submitDamageReport"
          :disabled="!canSubmit || isSubmitting"
        >
          {{ isSubmitting ? 'Wird gesendet...' : 'Schaden melden' }}
        </button>
      </div>
    </div>
  </div>
</template>



<style scoped>
.report-form {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  max-width: 500px;
  margin: auto;
}

.form-group {
  margin-bottom: 16px;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 6px;
}

input,
select,
textarea {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

textarea {
  min-height: 100px;
}

.btn.primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn.primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.router-link {
  color: #3498db;
  font-weight: bold;
  margin-bottom: 16px;
  display: inline-block;
}
</style>
