'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Event } from '@/lib/types'
import { addDays, addWeeks, format, isSameWeek, startOfWeek } from 'date-fns'
import { TestCard } from './testcard'

interface EventInput {
  id: number
  eventName: string,
  description: string,
  location: string,
  startDay: string,
  startDate: string,
  startHour: number,
  startMinutes: number,
  endHour: number,
  endMinutes: number,
  color: 'coral' | 'yellow'| 'pink' | 'green' | 'blue' | 'purple' | 'teal' | 'gray',
}

const COLOURS = ['coral', 'yellow', 'pink', 'green', 'blue', 'purple', 'teal', 'gray']
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const FULLDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8)

export function WeeklyEventsCalendar({ events }: { events: Event[] }) {
  const [currentWeek, setCurrentWeek] = useState(1)

  events.forEach((event) => {
    console.log(event)
  })

  const startingDate = new Date("2025-01-13")
  const currentWeekStartDate = addWeeks(startOfWeek(startingDate, { weekStartsOn: 1 }), currentWeek - 1)

  let eventId = 0;
  const processedEvents: EventInput[] = events.map((event) => {
    return {
        id: eventId++,
        eventName: event.eventName,
        description: event.eventDescription || "",
        location: event.eventLocation || "",
        startDay: format(event.startTime, 'EEEE'),
        startDate: format(event.startTime, 'P'),
        startHour: event.startTime.getHours(),
        startMinutes: event.startTime.getMinutes(),
        endHour: event.endTime.getHours(),
        endMinutes: event.endTime.getMinutes(),
        color: COLOURS[eventId % COLOURS.length],
    } as EventInput;
  });

  processedEvents.forEach((event) => {
    console.log("IDIOT")
    console.log(event)
  })


  let hours = Array.from({ length: 12 }, (_, i) => (i + 20) % 24);
  let segments = hours.length;

  // Revert to default hours if there are less than 10 segments
  if (segments < 10) {
    hours = HOURS;
    segments = 10;
  }
  
  return (
    <div className="w-full h-full bg-gray-900 text-gray-200 p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Week {currentWeek}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeek(prev => prev + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="w-full border border-gray-800 rounded-lg">
        {/* Time Headers */}
        <div
          className="grid border-b border-gray-800"
          style={{ gridTemplateColumns: `100px repeat(${segments}, minmax(0, 1fr))` }}
        >
          <div className="h-12" /> {/* Empty corner */}
          {hours.map(hour => (
            <div
              key={hour}
              className="h-12 border-l border-gray-800 flex items-center justify-center text-sm"
            >
              {hour.toString().padStart(2, '0')}00
            </div>
          ))}
        </div>

        {/* Days and Events */}
        <div className="relative">
          {DAYS.map((day, dayIndex) => {
            const dayDate = addDays(currentWeekStartDate, dayIndex)
            return (
              <div key={day} className="relative grid border-b border-gray-800 last:border-b-0" style={{ gridTemplateColumns: `100px repeat(${segments}, minmax(0, 1fr))` }}>
                <div className="h-20 flex items-center justify-center text-sm font-medium p-3">
                  {day} ({format(dayDate, 'P')})
                </div>

                {/* Vertical grid lines */}
                {hours.map((hour) => (
                  <div key={hour} className="h-20 border-l border-gray-800" />
                ))}

                {/* Events for this day */}
                {processedEvents
                  .filter((event) => event.startDay === FULLDAYS[dayIndex] && isSameWeek(new Date(event.startDate), currentWeekStartDate, { weekStartsOn: 1 }))
                  .map((event) => {
                    // Calculate the total number of minutes in the schedule
                    const scheduleStartTime = hours[0] * 60
                    const scheduleEndTime = (hours[hours.length - 1] * 60 + 60) + 24 * 60 // Add 24 hours to the end time

                    let eventStartTime = event.startHour * 60 + event.startMinutes
                    let eventEndTime = event.endHour * 60 + event.endMinutes

                    if (event.startHour < 8) {
                      eventStartTime += 24 * 60; // Add 24 hours to the start time
                    }

                    // Adjust for overnight events
                    if (eventEndTime <= eventStartTime) {
                      eventEndTime += 24 * 60; // Add 24 hours to the end time
                    }

                    // Clip the event to the schedule to prevent overflow on display
                    eventEndTime = Math.min(eventEndTime, scheduleEndTime)
                    console.log("BRUH")
                    console.log("DURATION=" + (eventEndTime - eventStartTime))

                    // Calculate the percentage offset and width
                    const eventStartPercent = ((eventStartTime - scheduleStartTime) / (scheduleEndTime - scheduleStartTime)) * 100
                    const eventDurationPercent = ((eventEndTime - eventStartTime) / (scheduleEndTime - scheduleStartTime)) * 100

                    return <TestCard key={event.id} event={event} leftOffset={eventStartPercent} width={eventDurationPercent} />
                  })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}