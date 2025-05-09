<script setup>
import { computed } from 'vue'
import { isSameWeek, format } from 'date-fns'
import { de } from 'date-fns/locale'

const props = defineProps({
  days: Array,
  reservations: Array,
  selectedBoat: [String, Number],
  boats: Array,
  currentUserId: String
})

const HOUR_HEIGHT = 60
const MINUTE_HEIGHT = HOUR_HEIGHT / 60
const START_HOUR = 6

const timeSlots = computed(() => {
  const slots = []
  for (let hour = START_HOUR; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}h`)
  }
  return slots
})

const baseEvents = computed(() => {
  return props.reservations
    .filter(reservation => {
      const reservationDate = new Date(reservation.startDate)
      const isSameWeekCheck = isSameWeek(reservationDate, props.days[0], { weekStartsOn: 1 })

      const boatMatch = !props.selectedBoat ||
        (reservation.FK_Boat &&
          reservation.FK_Boat[0] === props.selectedBoat)
      return isSameWeekCheck && boatMatch
    })
    .map(reservation => {
      const fromDate = new Date(reservation.startDate)
      const toDate = new Date(reservation.endDate)

      if (isNaN(fromDate) || isNaN(toDate)) return null

      const dayIndex = props.days.findIndex(day =>
        format(day, 'yyyy-MM-dd') === format(fromDate, 'yyyy-MM-dd')
      )

      const startMinutes = (fromDate.getHours() - START_HOUR) * 60 + fromDate.getMinutes()
      const endMinutes = (toDate.getHours() - START_HOUR) * 60 + toDate.getMinutes()

      const top = startMinutes * MINUTE_HEIGHT
      const height = (endMinutes - startMinutes) * MINUTE_HEIGHT

      const isCurrentUser = reservation.FK_UserId?.[0] === props.currentUserId
      const boat = props.boats.find(b => b.id === reservation.FK_Boat?.[0])

      return {
        id: reservation.id,
        title: boat ? `${boat.fields.Name} (${boat.fields.Numberplate})` : 'Reservation',
        start: format(fromDate, 'HH:mm'),
        end: format(toDate, 'HH:mm'),
        top: top,
        height: height,
        dayIndex: dayIndex,
        color: isCurrentUser ? '#4CAF50' : '#2196F3',
        isCurrentUser: isCurrentUser,
        boat: boat
      }
    })
    .filter(Boolean)
})

const positionedEvents = computed(() => {
  const results = []

  const eventsByDay = {}
  props.days.forEach((day, index) => {
    eventsByDay[index] = []
  })

  baseEvents.value.forEach(event => {
    if (eventsByDay[event.dayIndex]) {
      eventsByDay[event.dayIndex].push({ ...event })
    }
  })

  Object.keys(eventsByDay).forEach(dayIndex => {
    const dayEvents = eventsByDay[dayIndex]
    dayEvents.sort((a, b) => a.top - b.top)

    const columns = []

    dayEvents.forEach(event => {
      let placed = false
      for (let i = 0; i < columns.length; i++) {
        const lastEventInColumn = columns[i][columns[i].length - 1]
        if (event.top >= (lastEventInColumn.top + lastEventInColumn.height)) {
          columns[i].push(event)
          event.column = i
          placed = true
          break
        }
      }
      if (!placed) {
        event.column = columns.length
        columns.push([event])
      }
    })

    dayEvents.forEach(event => {
      const totalColumns = columns.length
      event.width = 100 / totalColumns
      event.left = event.column * event.width
      results.push(event)
    })
  })

  return results
})
</script>


<template>
  <div class="calendar-grid">
    <div class="time-scale">
      <div v-for="(time, index) in timeSlots" :key="index" class="time-slot" :style="{ height: `${HOUR_HEIGHT}px` }">
        {{ time }}
      </div>
    </div>

    <div v-for="(day, dayIndex) in days" :key="dayIndex" class="day-column">
      <div class="day-header">
        {{ format(day, 'EEE d', { locale: de }) }}
      </div>

      <div class="day-content" :style="{ height: `${(22 - START_HOUR) * HOUR_HEIGHT}px` }">
        <div v-for="event in positionedEvents.filter(e => e.dayIndex === dayIndex)" :key="event.id"
          class="calendar-event" :class="{ 'current-user': event.isCurrentUser, 'other-user': !event.isCurrentUser }"
          :style="{
            top: `${event.top}px`,
            height: `${event.height}px`,
            left: `${event.left}%`,
            width: `${event.width}%`,
            backgroundColor: event.color
          }">
          <div class="event-time">{{ event.start }} - {{ event.end }}</div>
          <div class="event-title">
            {{ event.title }}
            <span v-if="!event.isCurrentUser" class="user-label">(Anderer Nutzer)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  font-family: Arial, sans-serif;
}

@media (max-width: 1100px) {
  .calendar-grid {
    grid-template-columns: 40px repeat(auto-fit, minmax(120px, 1fr));
  }

  .day-header {
    font-size: 10px;
    padding: 4px;
  }

  .time-slot {
    font-size: 10px;
    padding-right: 4px;
  }

  .event-time,
  .event-title {
    font-size: 10px;
  }
}

.time-scale {
  grid-column: 1;
  position: sticky;
  left: 0;
  background: white;
  z-index: 2;
}

.time-slot {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 8px;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
  font-size: 12px;
  color: #666;
}

.day-column {
  border-right: 1px solid #eee;
}

.day-header {
  padding: 8px;
  text-align: center;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.day-content {
  position: relative;
}

.calendar-event {
  position: absolute;
  left: 2px;
  right: 2px;
  border-radius: 4px;
  padding: 4px;
  color: white;
  font-size: 12px;
  overflow: hidden;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.calendar-event:hover {
  transform: scale(1.01);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.current-user {
  background-color: #4CAF50;
  /* Green */
}

.other-user {
  background-color: #2196F3;
  /* Blue */
}

.event-time {
  font-weight: bold;
  font-size: 11px;
}

.event-title {
  margin-top: 2px;
  font-size: 11px;
}

.user-label {
  font-style: italic;
  font-size: 10px;
  opacity: 0.8;
}
</style>