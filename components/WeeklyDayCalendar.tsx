'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/EventCard'
import { convertToHour } from '@/lib/utils'

interface Event {
  id: string
  courseCode: string
  type: string
  location: string
  weeks: string
  startTime: string
  endTime: string
  day: number
  color: 'coral' | 'yellow' | 'pink' | 'green'
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8)

// Sample data
const events: Event[] = [
  {
    id: '1',
    courseCode: 'CS2040S',
    type: 'LAB [02]',
    location: 'COM1-B108',
    weeks: 'Weeks 3-13',
    startTime: '1000',
    endTime: '1200',
    day: 0,
    color: 'coral'
  },
  {
    id: '2',
    courseCode: 'CS2030S',
    type: 'LAB [01]',
    location: 'COM1-B103',
    weeks: 'Weeks 3-13',
    startTime: '1700',
    endTime: '1800',
    day: 0,
    color: 'yellow'
  },
  // Add more events as needed
]

events.map((event) => {
    const startHour = convertToHour(event.startTime)
    const endHour = convertToHour(event.endTime)
    return {
        ...event,
        startHour: startHour,
        endHour: endHour,
    }
})

export function WeeklyCalendar() {
  const [currentWeek, setCurrentWeek] = useState(1)

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
      <div className="relative w-full border border-gray-800 rounded-lg">
        {/* Time Headers */}
        <div className="grid grid-cols-[60px_repeat(10,1fr)] border-b border-gray-800">
          <div className="h-12" /> {/* Empty corner */}
          {HOURS.map(hour => (
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
          {DAYS.map((day, dayIndex) => (
            <div
              key={day}
              className="grid grid-cols-[60px_repeat(10,1fr)] border-b border-gray-800 last:border-b-0"
            >
                <div className="h-20 flex items-center justify-center text-sm font-medium">
                    {day}
                </div>

                {/* Vertical grid lines */}
                {HOURS.map(hour => (
                        <div
                        key={hour}
                        className="h-20 border-l border-gray-800"
                        />
                    ))}
              
                {/* Events for this day */}
                {events
                    .filter((event) => event.day === dayIndex)
                    .map((event) => {
                    const startHour = convertToHour(event.startTime);
                    const endHour = convertToHour(event.endTime);
                    const startMinutes = parseInt(event.startTime.slice(2), 10);
                    const endMinutes = parseInt(event.endTime.slice(2), 10);

                    // Calculate the total number of minutes in the schedule
                    const scheduleStartTime = HOURS[0] * 60;
                    const scheduleEndTime = HOURS[HOURS.length - 1] * 60 + 60;

                    const eventStartTime = startHour * 60 + startMinutes;
                    const eventEndTime = endHour * 60 + endMinutes;

                    // Calculate the percentage offset and width
                    const eventStartPercent =
                        ((eventStartTime - scheduleStartTime) /
                        (scheduleEndTime - scheduleStartTime)) *
                        100;
                    const eventDurationPercent =
                        ((eventEndTime - eventStartTime) /
                        (scheduleEndTime - scheduleStartTime)) *
                        100;

                    console.log(eventStartPercent, eventDurationPercent);

                    return (
                        <EventCard
                        key={event.id}
                        event={event}
                        leftOffset={eventStartPercent}
                        width={eventDurationPercent}
                        />
                    );
                    })}
                
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}