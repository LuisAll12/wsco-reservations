<template>
  <div class="calendar-wrapper min-h-full flex flex-col bg-gray-50">
    <!-- UI-konforme Navigation -->
    <nav class="calendar-controls flex justify-between items-center px-6 py-3 bg-white border-b shadow-sm">
      <div class="flex items-center space-x-4">
        <button @click="today"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium transition">
          <CalendarIcon class="w-4 h-4" />
          <span>Heute</span>
        </button>

        <button @click="prev" class="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition" aria-label="Zurück">
          <ChevronLeftIcon class="w-5 h-5" />
        </button>

        <div class="min-w-[120px] text-center text-sm font-semibold text-gray-800">
          {{ currentMonthLabel }}
        </div>

        <button @click="next" class="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition" aria-label="Weiter">
          <ChevronRightIcon class="w-5 h-5" />
        </button>
      </div>

      <div class="text-sm text-gray-700 font-medium">
        Ansicht: <span>{{ currentViewLabel }}</span>
      </div>
    </nav>

    <!-- Kalender -->
    <div class="calendar-container flex-1 overflow-hidden">
      <TuiCalendar ref="calendarRef" class="w-full h-full" :view="currentView" :events="events" :calendars="calendars"
        :use-detail-popup="true" :isReadOnly="true" :week="calendarOptions.week" :day="calendarOptions.day"
        :timezone="calendarOptions.timezone" :theme="calendarOptions.theme" />
    </div>
  </div>

</template>





<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import TuiCalendar from 'toast-ui-calendar-vue3';
import 'toast-ui-calendar-vue3/styles.css';
import { getReservations } from '../services/GetAllRes.js'
import { getUserID, getBoatName } from '../services/auth.js'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

// Reactive States
const currentView = ref('week');        // aktuelle Ansicht: 'day' oder 'week'
const events = ref([]);                // Reservierungs-Events für den Kalender
const selectedBoatId = ref(null);      // Filter: gewählte Boots-ID (oder null für alle)
const calendarRef = ref(null);
const currentUserId = ref(null)
const currentDate = ref(new Date());
const selectedEvent = ref(null)
const showModal = ref(false)


const currentViewLabel = computed(() => {
  switch (currentView.value) {
    case 'week':
      return 'Woche';
    case 'day':
      return 'Tag';
    default:
      return currentView.value;
  }
});

const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric'
  });
});

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
  },
  milestone(schedule) {
    return `<span class="bg-red-500">${schedule.title}</span>`;
  },
  popupDetailDate(schedule) {
    return schedule.start.toLocaleString();
  },
  
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
    borderColor: '#059669'
  },
  {
    id: 'others',
    name: 'Andere Reservierungen',
    backgroundColor: '#3b82f6',
    borderColor: '#1d4ed8'
  },
  {
    id: 'cancelled',
    name: 'Storniert',
    backgroundColor: '#FF6161',
    borderColor: '#dc2626'
  }
];


// Funktion, um basierend auf aktueller View den Zeitraum zu ermitteln und Events zu laden
async function refreshEvents() {

  const calInstance = calendarRef.value?.getInstance();
  if (!calInstance) return;
  const rangeStart = calInstance.getDateRangeStart();
  const rangeEnd = calInstance.getDateRangeEnd();
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
  calendarRef.value.getInstance().render();
});

watch(selectedBoatId, () => {
  refreshEvents();
});

function prev() {
  calendarRef.value.getInstance().prev();
  delayedRefresh();
}

function next() {
  calendarRef.value.getInstance().next();
  delayedRefresh();
}

function today() {
  calendarRef.value.getInstance().today();
  delayedRefresh();
}

function delayedRefresh() {
  setTimeout(() => {
    const calInstance = calendarRef.value?.getInstance();
    if (!calInstance) return;

    const currentMoment = calInstance.getDate();
    const currentJsDate = currentMoment.toDate();

    currentDate.value = currentJsDate;

    console.log('New range:', calInstance.getDateRangeStart()?.toDate?.(), '-', calInstance.getDateRangeEnd()?.toDate?.());

    refreshEvents(); // Jetzt korrekt
  }, 50);
}
</script>
<style scoped>
.calendar-container {
  flex-grow: 1;
  height: calc(100vh - 48px);
  /* assuming 48px für controls oben */
  overflow: hidden;
}

:deep(.toastui-calendar-event[data-calendar-id="cancelled"]) {
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 0, 0, 0.3) 0px,
    rgba(255, 0, 0, 0.3) 6px,
    transparent 6px,
    transparent 12px
  ) !important;
  background-color: #f3f4f6 !important;
  color: #b91c1c !important; /* dunkles Rot für Text */
  border-radius: 4px;
  font-weight: 600;
}

</style>