'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/EventCard'
import { convertToHour } from '@/lib/utils'
import { ModuleSchedule } from '@/lib/types'

interface Event {
  id: string
  courseCode: string
  type: string
  location: string
  weeks: number[]
  startTime: string
  endTime: string
  startHour: number
  endHour: number
  day: number
  color: 'coral' | 'yellow'| 'pink' | 'green' | 'blue' | 'purple' | 'teal' | 'gray'
}

const COLOURS = ['coral', 'yellow', 'pink', 'green', 'blue', 'purple', 'teal', 'gray']
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const FULLDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8)

export function WeeklyCalendar({ moduleScheduleData }: { moduleScheduleData: ModuleSchedule[] }) {
  const [currentWeek, setCurrentWeek] = useState(1)

  let eventId = 0;
  let modId = 0;
  const events: Event[] = moduleScheduleData.flatMap((module) => {
    modId++;
    return module.lessons.map((lesson) => {
        return {
            id: (eventId++).toString(),
            courseCode: module.moduleCode,
            type: lesson.lessonType,
            location: lesson.venue,
            weeks: lesson.weeks,
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            startHour: convertToHour(lesson.startTime),
            endHour: convertToHour(lesson.endTime),
            day: FULLDAYS.indexOf(lesson.day),
            color: COLOURS[modId % COLOURS.length],
        } as Event;
    });
  });

  const earliestHour = 8;
  const latestHour = Math.max(...events.map((event) => event.endHour));
  let hours = Array.from({ length: latestHour - earliestHour + 1 }, (_, i) => i + earliestHour);
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
          style={{ gridTemplateColumns: `60px repeat(${segments}, minmax(0, 1fr))` }}
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
          {DAYS.map((day, dayIndex) => (
            <div
            key={day}
            className="relative grid border-b border-gray-800 last:border-b-0"
            style={{ gridTemplateColumns: `60px repeat(${segments}, minmax(0, 1fr))` }}
            >
                <div className="h-20 flex items-center justify-center text-sm font-medium">
                    {day}
                </div>

                {/* Vertical grid lines */}
                {hours.map(hour => (
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
                    const scheduleStartTime = hours[0] * 60;
                    const scheduleEndTime = hours[hours.length - 1] * 60 + 60;

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