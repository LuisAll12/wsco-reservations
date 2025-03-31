<!-- src/components/SidebarCalendar.vue -->
<script setup>
import { computed } from 'vue'
import { 
  startOfMonth, 
  endOfMonth, 
  eachWeekOfInterval, 
  format, 
  isSameWeek,
  addDays,
  isSameMonth,
  startOfWeek
} from 'date-fns'
import { de } from 'date-fns/locale/de'

const props = defineProps({
  currentWeek: {
    type: Date,
    default: () => new Date() // 👈 Fallback-Wert
  },
  currentDate: {
    type: Date,
    default: () => new Date() // 👈 Fallback-Wert
  }
})

// Sicherheitscheck für Datumswerte
const safeDate = computed(() => 
  props.currentDate instanceof Date ? props.currentDate : new Date()
)

// Generiere Kalenderwochen für den aktuellen Monat
const calendarWeeks = computed(() => {
  const monthStart = startOfMonth(props.currentDate)
  const monthEnd = endOfMonth(props.currentDate)
  
  return eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 }
  ).map(weekStart => ({
    start: weekStart,
    days: Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
  }))
})

// Prüfe ob Tag in der aktuellen Woche ist
const isCurrentWeek = (date) => {
  return isSameWeek(date, props.currentWeek, { weekStartsOn: 1 })
}
</script>

<template>
  <div class="sidebar-calendar">
    <div class="calendar-header">
      <!-- Verwenden Sie safeDate.value -->
      <h3>{{ format(safeDate, 'MMMM yyyy', { locale: de }) }}</h3>
    </div>

    <div class="calendar-grid">
      <div class="weekdays">
        <div v-for="day in ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']" 
             :key="day"
             class="weekday">
          {{ day }}
        </div>
      </div>

      <div v-for="(week, index) in calendarWeeks" 
           :key="index"
           class="calendar-week"
           :class="{ 'current-week': isCurrentWeek(week.start) }">
        <div v-for="day in week.days" 
             :key="day.getTime()"
             class="calendar-day"
             :class="{
               'other-month': !isSameMonth(day, currentDate),
               'current-day': format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
             }">
          {{ format(day, 'd') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-calendar {
  padding: 0.5rem;
  background: white;
  border-radius: 12px;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.calendar-header h3 {
  margin: 0 0 0.8rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  text-transform: capitalize;
}

.calendar-grid {
  display: grid;
  grid-template-rows: auto repeat(6, 1fr);
  gap: 3px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}

.weekday {
  font-size: 0.7rem;
  text-align: center;
  color: #7f8c8d;
  font-weight: 500;
  text-transform: uppercase;
}

.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  min-height: 28px;
}

.calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4px;
  font-size: 0.75rem;
  border-radius: 4px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  aspect-ratio: 1;
  line-height: 1;
}

.calendar-day:hover {
  background: #3498db;
  color: white;
  transform: scale(1.1);
}

.current-week .calendar-day {
  background: #e3f2fd;
  font-weight: 500;
}

.current-week .calendar-day.other-month {
  background: #f0f8ff;
  color: #7f8c8d;
}

.current-day {
  position: relative;
  font-weight: 700;
  color: white !important;
  background: #e74c3c !important;
}

.current-day::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #e74c3c;
}

.other-month {
  color: #bdc3c7;
  background: #fdfdfd !important;
}

/* Responsive Anpassungen */
@media (max-width: 1400px) {
  .calendar-day {
    font-size: 0.7rem;
    padding: 3px;
  }
  
  .weekday {
    font-size: 0.65rem;
  }
}
</style>