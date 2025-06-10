<template>
  <div class="calendar-wrapper h-screen flex flex-col">
    <div class="controls flex justify-between p-2">
      <!-- Navigationselemente -->
    </div>
    <div class="calendar-container flex-1 overflow-auto">
      <TuiCalendar
        ref="calendarRef"
        class="w-full h-[calc(100vh-48px)]"
        :view="currentView"
        :events="events"
        :calendars="calendars"
        :use-detail-popup="true"
        :isReadOnly="true"
        :week="calendarOptions.week"
        :timezone="calendarOptions.timezone"
        :theme="calendarOptions.theme"
      />
    </div>

    <TuiCalendar ref="calendarRef" :view="currentView" :events="events" :calendars="calendars" :use-detail-popup="true"
      :isReadOnly="true" :week="calendarOptions.week" :timezone="calendarOptions.timezone"
      :theme="calendarOptions.theme" class="w-full" />
  </div>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue';
import TuiCalendar from 'toast-ui-calendar-vue3';
import 'toast-ui-calendar-vue3/styles.css';
import { getReservations } from '../services/GetAllRes.js'
import { getUserID, getBoatName } from '../services/auth.js'


// Reactive States
const currentView = ref('week');        // aktuelle Ansicht: 'day' oder 'week'
const events = ref([]);                // Reservierungs-Events für den Kalender
const selectedBoatId = ref(null);      // Filter: gewählte Boots-ID (oder null für alle)
const calendarRef = ref(null);
const currentUserId = ref(null)

// Dynamisch den View an Bildschirm anpassen
function updateResponsiveView() {
  const width = window.innerWidth;
  currentView.value = width < 1000 ? 'day' : 'week';
}

window.addEventListener('resize', updateResponsiveView);

const calendarOptions = {
  week: {
    startDayOfWeek: 1,
    hourStart: 4,
    hourEnd: 23,
    narrowWeekend: false,
    showTimezoneCollapseButton: false,
    eventView: ['time'],
    taskView: false,
    milestoneView: false,
    dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    template: {
      time: schedule => {
        const start = new Date(schedule.start);
        const h = String(start.getHours()).padStart(2, '0');
        const m = String(start.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
      }
    }
  },
  day: {
    hourStart: 4,
    hourEnd: 23,
    eventView: ['time'],
    taskView: false,
    milestoneView: false,
    template: {
      time: schedule => {
        const start = new Date(schedule.start);
        const h = String(start.getHours()).padStart(2, '0');
        const m = String(start.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
      }
    }
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


// Funktion, um basierend auf aktueller View den Zeitraum zu ermitteln und Events zu laden
async function refreshEvents() {
  const calInstance = calendarRef.value?.getInstance();
  if (!calInstance) return;
  const rangeStart = calInstance.getDateRangeStart();
  const rangeEnd = calInstance.getDateRangeEnd();
  console.log(rangeStart + "+" + rangeEnd)

  const data = await getReservations(rangeStart, rangeEnd, selectedBoatId.value ? selectedBoatId.value : null)

  events.value = await Promise.all(data.map(async res => {
    const boat = await getBoatName(res.FK_BoatId._path.segments[1]);
    return {
      id: res.id,
      calendarId: res.status === 'cancelled' ? 'cancelled'
        : (res.FK_UserId._path.segments[1] === currentUserId.value ? 'mine' : 'others'),
      title: boat,
      start: res.startDate,
      end: res.endDate,
      isReadOnly: true
    };
  }));

}


// Initial laden beim Mounten der Komponente:
onMounted(async () => {
  currentUserId.value = await getUserID();
  await refreshEvents();
  calendarRef.value.getInstance().render(); // erzwinge Neuberechnung
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
<style scoped>
.calendar-container {
  flex-grow: 1;
  height: calc(100vh - 48px); /* assuming 48px für controls oben */
  overflow: hidden;
}
</style>