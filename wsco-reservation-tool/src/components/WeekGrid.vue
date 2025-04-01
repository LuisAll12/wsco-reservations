<!-- src/components/WeekGrid.vue -->
<script setup>
import { computed } from 'vue'
import { isSameWeek, parseISO, startOfWeek, format } from 'date-fns'

const props = defineProps({
  days: Array,
  reservations: Array,
  selectedBoat: [String, Number],
  boats: Array,
  currentUserId: String
})

// Time slots computation remains the same
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 6; hour <= 22; hour++) {
    for (let min = 0; min < 60; min += 15) {
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
    }
  }
  return slots
})

const positionedEvents = computed(() => {
  return props.reservations
    .filter(reservation => {
      // Filter by week
      const reservationDate = new Date(reservation.fields.From)
      const isSameWeekCheck = isSameWeek(reservationDate, props.days[0], { weekStartsOn: 1 })
      
      // Filter by boat if selected
      const boatMatch = !props.selectedBoat || 
        (reservation.fields.FK_Boat && 
          reservation.fields.FK_Boat[0] === props.selectedBoat)
      return isSameWeekCheck && boatMatch
    })
    .map(reservation => {
      const fromDate = reservation.fields.From ? new Date(reservation.fields.From) : null
      const toDate = reservation.fields.To ? new Date(reservation.fields.To) : null

      if (!fromDate || !toDate || isNaN(fromDate) || isNaN(toDate)) {
        return null // Skip invalid dates
      }
      
      const dayIndex = props.days.findIndex(day => 
        format(day, 'yyyy-MM-dd') === format(fromDate, 'yyyy-MM-dd')
      )
      const isCurrentUser = reservation.fields.FK_Member?.[0] === props.currentUserId
      const color = isCurrentUser ? '#FFD700' : '#ff6b6b' 

      const startHour = fromDate.getHours()
      const startMin = fromDate.getMinutes()
      const endHour = toDate.getHours()
      const endMin = toDate.getMinutes()
      
      const startPosition = (startHour - 6) * 60 + startMin
      const height = (endHour - startHour) * 60 + (endMin - startMin)

      // Get boat details if available
      const boat = props.boats.find(b => b.id === reservation.fields.FK_Boat?.[0])

      return {
        id: reservation.id,
        title: boat ? `${boat.fields.Name} (${boat.fields.Numberplate})` : 'Reservation',
        start: format(fromDate, 'HH:mm'),
        end: format(toDate, 'HH:mm'),
        date: fromDate,
        top: startPosition,
        height: height,
        dayIndex,
        color: color,
        isCurrentUser: isCurrentUser,
        boat: boat
      }
    })
})
</script>

<template>
  <div class="calendar-grid">
    <!-- Time scale -->
    <div class="time-scale">
      <div 
        v-for="(time, index) in timeSlots" 
        :key="index"
        class="time-slot"
        :class="{ 'hour-mark': time.endsWith(':00') }"
      >
        <span v-if="time.endsWith(':00')">{{ time.replace(':00', 'h') }}</span>
      </div>
    </div>

    <!-- Day columns -->
    <div 
      v-for="(day, dayIndex) in days" 
      :key="dayIndex"
      class="day-column"
      :style="{ gridColumn: dayIndex + 2 }"
    >
      <div class="day-header">
        <div class="weekday">{{ format(day, 'EEE') }}</div>
        <div class="date">{{ format(day, 'd') }}</div>
      </div>

      <div class="day-content">
        <div
          v-for="event in positionedEvents.filter(e => e.dayIndex === dayIndex)"
          :key="event.id"
          class="calendar-event"
          :class="{ 'unavailable': event.boat?.fields?.Availability === false }"
          :style="{
            top: `${event.top}px`,
            height: `${event.height}px`,
            backgroundColor: event.color
          }"
        >
        <div class="event-content">
            <div class="event-time">{{ event.start }} - {{ event.end }}</div>
            <div class="event-title">
              {{ event.title }}
              <span v-if="!event.isCurrentUser" class="other-user-label">(Anderer Benutzer)</span>
            </div>
            <div class="event-details" v-if="event.boat">
              Boat: {{ event.boat.fields.Name || 'Unknown' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  grid-auto-rows: minmax(40px, auto);
  position: relative;
}

.other-user-label {
  font-size: 0.8em;
  opacity: 0.8;
  margin-left: 4px;
}

.time-scale {
  grid-column: 1;
  position: sticky;
  left: 0;
  z-index: 2;
  background: white;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
}

.time-slot {
  height: 40px;
  position: relative;
  border-bottom: 1px solid #eee;
  
  &.hour-mark {
    font-size: 0.9em;
    color: #666;
    font-weight: 500;
  }
}

.day-column {
  display: grid;
  grid-template-rows: 60px auto;
  border-right: 1px solid #eee;
}

.day-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  padding: 12px;
  text-align: center;
  border-bottom: 2px solid #eee;
  
  .weekday {
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .date {
    font-size: 1.4em;
    margin-top: 4px;
  }
}

.day-content {
  position: relative;
  height: calc(40px * 64); /* 16 Stunden × 4 Slots pro Stunde */
}

.calendar-event {
  position: absolute;
  left: 2px;
  right: 2px;
  border-radius: 6px;
  padding: 8px;
  color: white;
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.01);
    z-index: 2;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
}

.event-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.event-time {
  font-size: 0.75em;
  opacity: 0.9;
  margin-bottom: 4px;
}

.event-title {
  font-size: 0.9em;
  line-height: 1.2;
  flex-grow: 1;
}
</style>