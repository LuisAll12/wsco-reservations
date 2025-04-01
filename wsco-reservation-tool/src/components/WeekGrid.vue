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

// Constants for precise layout
const HOUR_HEIGHT = 60 // Each hour is 60px tall
const MINUTE_HEIGHT = HOUR_HEIGHT / 60 // 1px per minute
const START_HOUR = 6 // Calendar starts at 6:00 AM

const timeSlots = computed(() => {
  const slots = []
  for (let hour = START_HOUR; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}h`)
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
      const fromDate = new Date(reservation.fields.From)
      const toDate = new Date(reservation.fields.To)
      
      if (isNaN(fromDate) || isNaN(toDate)) return null

      const dayIndex = props.days.findIndex(day => 
        format(day, 'yyyy-MM-dd') === format(fromDate, 'yyyy-MM-dd')
      )

      // Calculate minutes from calendar start (6:00 AM)
      const startMinutes = (fromDate.getHours() - START_HOUR) * 60 + fromDate.getMinutes()
      const endMinutes = (toDate.getHours() - START_HOUR) * 60 + toDate.getMinutes()
      
      // Convert to pixel values
      const top = startMinutes * MINUTE_HEIGHT
      const height = (endMinutes - startMinutes) * MINUTE_HEIGHT

      // Determine if current user's reservation
      const isCurrentUser = reservation.fields.FK_Member?.[0] === props.currentUserId
      const boat = props.boats.find(b => b.id === reservation.fields.FK_Boat?.[0])

      return {
        id: reservation.id,
        title: boat ? `${boat.fields.Name} (${boat.fields.Numberplate})` : 'Reservation',
        start: format(fromDate, 'HH:mm'),
        end: format(toDate, 'HH:mm'),
        top: top,
        height: height,
        dayIndex,
        color: isCurrentUser ? '#4CAF50' : '#2196F3', // Green for current user, blue for others
        isCurrentUser: isCurrentUser,
        boat: boat
      }
    })
    .filter(Boolean)
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
        :style="{ height: `${HOUR_HEIGHT}px` }"
      >
        {{ time }}
      </div>
    </div>

    <!-- Day columns -->
    <div 
      v-for="(day, dayIndex) in days" 
      :key="dayIndex"
      class="day-column"
    >
      <div class="day-header">
        {{ format(day, 'EEE d') }}
      </div>

      <div 
        class="day-content"
        :style="{ height: `${(22 - START_HOUR) * HOUR_HEIGHT}px` }"
      >
        <div
          v-for="event in positionedEvents.filter(e => e.dayIndex === dayIndex)"
          :key="event.id"
          class="calendar-event"
          :class="{ 'current-user': event.isCurrentUser, 'other-user': !event.isCurrentUser }"
          :style="{
            top: `${event.top}px`,
            height: `${event.height}px`,
            backgroundColor: event.color
          }"
        >
          <div class="event-time">{{ event.start }} - {{ event.end }}</div>
          <div class="event-title">
            {{ event.title }}
            <span v-if="!event.isCurrentUser" class="user-label">(Anderer nutzer)</span>
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
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 2;
}

.current-user {
  background-color: #4CAF50; /* Green */
}

.other-user {
  background-color: #2196F3; /* Blue */
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