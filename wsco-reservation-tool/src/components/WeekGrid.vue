<template>
  <div class="calendar-wrapper min-h-full flex flex-col bg-gray-50">
    <!-- UI-konforme Navigation -->
    <nav class="calendar-controls flex justify-between items-center px-6 py-3 bg-white border-b shadow-sm">
      <!-- Links: Navigation -->
      <div class="flex items-center space-x-4">
        <button @click="today" class="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium transition">
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

  <!-- Mitte: Legende -->
  <div class="hidden md:flex items-center gap-4">
    <template v-for="legend in calendars" :key="legend.id">
      <div class="flex items-center gap-1 text-sm text-gray-700">
        <span :style="{ backgroundColor: legend.backgroundColor }" class="w-3 h-3 rounded-full inline-block border border-gray-300"></span>
        <span>{{ legend.name }}</span>
      </div>
    </template>
  </div>

  <!-- Mobile: Tooltip mit Dropdown -->
  <div class="relative md:hidden">
    <button @click="legendOpen = !legendOpen"
      class="flex items-center gap-1 text-sm font-medium text-gray-700 px-3 py-1.5 rounded-md bg-white border border-gray-300 shadow-sm hover:bg-gray-100 transition">
      <span>Legende</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="legendOpen"
      class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
      <div v-for="legend in calendars" :key="legend.id" class="flex items-center px-3 py-1 text-sm text-gray-700">
        <span :style="{ backgroundColor: legend.backgroundColor, borderColor: legend.borderColor }"
          class="w-3 h-3 rounded-full inline-block border mr-2"></span>
        {{ legend.name }}
      </div>
    </div>
  </div>

  <!-- Rechts: Ansicht -->
  <div class="text-sm text-gray-700 font-medium whitespace-nowrap hidden md:block">
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
const legendOpen = ref(false);


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
  popupDetailTitle(schedule) {
    return `<strong style="font-size: 15px;">🚤 ${schedule.title}</strong>`;
  },
  popupDetailDate(schedule) {
    const start = new Date(schedule.start);
    const end = new Date(schedule.end);
    const dateStr = `${start.toLocaleDateString('de-DE')} ${start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
    return `<span style="font-size: 13px;">🕒 ${dateStr}</span>`;
  },
  popupDetailUser(schedule) {
    return `<span style="font-size: 13px;">👤 Reserviert durch: ${schedule.reservedBy || 'Unbekannt'}</span>`;
  },
  popupDetailState(schedule) {
    return `<span style="font-size: 13px;">📌 Status: ${schedule.calendarId === 'cancelled' ? 'Storniert' : 'Bestätigt'}</span>`;
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
      },
      popupDetailDate(schedule) {
        const start = new Date(schedule.start);
        const end = new Date(schedule.end);
        return `${start.toLocaleDateString('de-DE', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })} ${start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
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
    name: 'Fremde Reservierungen',
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

document.addEventListener('click', (e) => {
  if (!(e.target.closest('.relative.md\\:hidden'))) {
    legendOpen.value = false;
  }
});
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