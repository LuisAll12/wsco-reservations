<template>
  <div class="calendar-container">
    <!-- Optional: Steuerelemente für Navigation und View-Wechsel -->
    <div class="controls flex justify-between mb-2">
      <div>
        <button @click="prev">&laquo; Zurück</button>
        <button @click="today">Heute</button>
        <button @click="next">Vor &raquo;</button>
      </div>
      <div>
        <select v-model="currentView">
          <option value="day">Tag</option>
          <option value="week">Woche</option>
        </select>
      </div>
    </div>

    <!-- Kalender-Komponente -->
    <TuiCalendar ref="calendarRef" :view="currentView" :events="events" :calendars="calendars" :use-detail-popup="true"
      :isReadOnly="true" :week="calendarOptions.week" :timezone="calendarOptions.timezone" class="w-full" />
  </div>
</template>

<script setup>
// Importe
import { ref, onMounted, watch } from 'vue';
import TuiCalendar from 'toast-ui-calendar-vue3';
import 'toast-ui-calendar-vue3/styles.css';

// Reactive States
const currentView = ref('week');        // aktuelle Ansicht: 'day' oder 'week'
const events = ref([]);                // Reservierungs-Events für den Kalender
const selectedBoatId = ref(null);      // Filter: gewählte Boots-ID (oder null für alle)
const calendarRef = ref(null);         // Ref auf das Calendar-Instanz-Objekt

// Kalender-Optionen (z.B. Wochenansicht-Einstellungen, Zeitzone)
const calendarOptions = {
  week: {
    startDayOfWeek: 1,       // Wochenstart am Montag
    hourStart: 6, hourEnd: 22, // Zeige Zeitachse von 6:00 bis 22:00
    narrowWeekend: false     // Wochenenden normal breit anzeigen (true würde sie schmaler darstellen)
  },
  timezone: {
    zones: [
      { timezoneName: 'Europe/Berlin', displayLabel: 'MEZ' }
    ]
  }
};

// Kalender-"Kalender" definieren (für Farbzuweisung nach Kategorie)
const calendars = [
  {
    id: 'mine',
    name: 'Meine Reservierungen',
    backgroundColor: '#34d399',   // grün (Tailwind emerald-400) für eigene Reservierungen
    borderColor: '#34d399'
  },
  {
    id: 'others',
    name: 'Andere Reservierungen',
    backgroundColor: '#3b82f6',   // blau (Tailwind blue-500) für Reservierungen anderer Nutzer
    borderColor: '#3b82f6'
  },
  {
    id: 'cancelled',
    name: 'Storniert',
    backgroundColor: '#9ca3af',   // grau (Tailwind gray-400) für stornierte Einträge
    borderColor: '#9ca3af'
  }
];

// Hilfsfunktion: Events von API laden basierend auf sichtbarem Zeitraum
async function loadEventsForRange(rangeStart, rangeEnd) {
  const boatFilter = selectedBoatId.value ? `&boatId=${selectedBoatId.value}` : '';
  const url = `/api/reservations?start=${rangeStart.toISOString()}&end=${rangeEnd.toISOString()}${boatFilter}`;
  const response = await fetch(url);
  const data = await response.json();
  // API-Daten in Calendar-Event-Objekte umwandeln:
  events.value = data.map(res => ({
    id: res.id,
    calendarId: res.status === 'cancelled' ? 'cancelled'
      : (res.userId === currentUserId ? 'mine' : 'others'),
    title: res.boatName + ' – ' + res.licensePlate,  // z.B. "Boot ABC – ZH1234"
    start: res.startDate,  // ISO-Strings oder Date-Objekte
    end: res.endDate,
    isReadOnly: true       // sicherstellen, dass dieser Termin nicht bearbeitbar ist
  }));
}

// Funktion, um basierend auf aktueller View den Zeitraum zu ermitteln und Events zu laden
function refreshEvents() {
  const calInstance = calendarRef.value?.getInstance();
  if (!calInstance) return;
  const rangeStart = calInstance.getDateRangeStart();
  const rangeEnd = calInstance.getDateRangeEnd();
  loadEventsForRange(rangeStart, rangeEnd);
}

// Initial laden beim Mounten der Komponente:
onMounted(() => {
  refreshEvents();
});

// Neuladen, wenn die gefilterte Boots-ID wechselt:
watch(selectedBoatId, () => {
  refreshEvents();
});

// Navigations- und View-Wechsel-Methoden:
function prev() {
  calendarRef.value.getInstance().prev();
  refreshEvents();
}
function next() {
  calendarRef.value.getInstance().next();
  refreshEvents();
}
function today() {
  calendarRef.value.getInstance().today();
  refreshEvents();
}
</script>
