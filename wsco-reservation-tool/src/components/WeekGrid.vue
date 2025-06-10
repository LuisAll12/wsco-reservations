<template>
  <div class="calendar-container">
    <div class="controls flex justify-between mb-2">
      <div class="flex gap-2">
        <button @click="prev">&laquo; Zurück</button>
        <button @click="today">Heute</button>
        <button @click="next">Vor &raquo;</button>
      </div>
      <div>
        <select v-model="currentView">
          <option value="day">Tagesansicht</option>
          <option value="week">Wochenansicht</option>
        </select>
      </div>
    </div>

    <TuiCalendar
      ref="calendarRef"
      :view="currentView"
      :events="events"
      :calendars="calendars"
      :use-detail-popup="true"
      :isReadOnly="true"
      :week="calendarOptions.week"
      :timezone="calendarOptions.timezone"
      :theme="calendarOptions.theme"
      class="w-full"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import TuiCalendar from 'toast-ui-calendar-vue3';
import 'toast-ui-calendar-vue3/styles.css';

const currentView = ref('week');
const events = ref([]);
const selectedBoatId = ref(null);
const calendarRef = ref(null);

// Dynamisch den View an Bildschirm anpassen
function updateResponsiveView() {
  const width = window.innerWidth;
  currentView.value = width < 1000 ? 'day' : 'week';
}

window.addEventListener('resize', updateResponsiveView);

// Kalender-Konfiguration
const calendarOptions = {
  week: {
    startDayOfWeek: 1,
    hourStart: 6,
    hourEnd: 22,
    narrowWeekend: false,
    showTimezoneCollapseButton: false,
    eventView: ['time'],       // nur Zeitansicht
    taskView: false,           // keine Tasks
    milestoneView: false,      // keine Meilensteine
    dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  },
  day: {
    hourStart: 6,
    hourEnd: 22,
    eventView: ['time'],
    taskView: false,
    milestoneView: false
  },
  timezone: {
    zones: [{ timezoneName: 'Europe/Berlin', displayLabel: 'MEZ' }]
  },
  theme: {
    week: {
      eventView: ['time'],
      taskView: false,
      milestone: false
    },
    day: {
      eventView: ['time'],
      taskView: false,
      milestone: false
    }
  }
};


// Kalender-Definitionen
const calendars = [
  {
    id: 'mine',
    name: 'Meine Reservierungen',
    backgroundColor: '#34d399',
    borderColor: '#34d399'
  },
  {
    id: 'others',
    name: 'Andere Reservierungen',
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6'
  },
  {
    id: 'cancelled',
    name: 'Storniert',
    backgroundColor: '#9ca3af',
    borderColor: '#9ca3af'
  }
];

// Events laden
async function loadEventsForRange(rangeStart, rangeEnd) {
  const boatFilter = selectedBoatId.value ? `&boatId=${selectedBoatId.value}` : '';
  const url = `/api/reservations?start=${rangeStart.toISOString()}&end=${rangeEnd.toISOString()}${boatFilter}`;
  const response = await fetch(url);
  const data = await response.json();

  events.value = data.map(res => ({
    id: res.id,
    calendarId: res.status === 'cancelled' ? 'cancelled' : (res.userId === currentUserId ? 'mine' : 'others'),
    title: `${res.boatName} – ${res.licensePlate}`,
    start: res.startDate,
    end: res.endDate,
    isReadOnly: true
  }));
}

// Sichtbaren Zeitraum bestimmen und Events laden
function refreshEvents() {
  const calInstance = calendarRef.value?.getInstance();
  if (!calInstance) return;
  const rangeStart = calInstance.getDateRangeStart();
  const rangeEnd = calInstance.getDateRangeEnd();
  loadEventsForRange(rangeStart, rangeEnd);
}

onMounted(() => {
  updateResponsiveView(); // Initialer Check
  refreshEvents();
});

watch(selectedBoatId, () => {
  refreshEvents();
});

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
