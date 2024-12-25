'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/EventCard'
import { CustomEvent } from '@/lib/types'
import { Switch } from './ui/switch'
import { Label } from './ui/label'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const FULLDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAYHOURS = Array.from({ length: 12 }, (_, i) => i + 8)
const NIGHTHOURS = Array.from({ length: 12 }, (_, i) => (i + 20) % 24);
const WEEKOPTIONS = ["1", "2", "3", "4", "5", "6", "Recess Week", "7", "8", "9", "10", "11", "12", "13", "Reading Week", "Examination Week 1", "Examination Week 2"];

export function WeeklyCalendar({ events }: { events: CustomEvent[] }) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [isNightMode, setIsNightMode] = useState(false) // New state for day/night
  const currentWeek = WEEKOPTIONS[currentWeekIndex].includes("Week")
    ? WEEKOPTIONS[currentWeekIndex]
    : "Week " + WEEKOPTIONS[currentWeekIndex];
  const hours = isNightMode ? NIGHTHOURS : DAYHOURS;
  const weekNumber = currentWeekIndex < 6 ? currentWeekIndex + 1 : currentWeekIndex;


  const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // convert Date object to day of week
  function getDayOfWeek(date: Date): string {
    return DAYS_OF_WEEK[date.getDay()];
  }

  const processedEvents = events.map((event, index) => {

    let startHour;
    let endHour;
    let startMinutes;
    let endMinutes;
    let day;
    if (event.isRecurring) {
      startHour = Number(event.recurringStartTime.hour);
      endHour = Number(event.recurringEndTime.hour);
      startMinutes = Number(event.recurringStartTime.minute);
      endMinutes = Number(event.recurringEndTime.minute);
      day = FULLDAYS.indexOf(event.dayOfWeek);
    } else {
      startHour = Number(event.startDateAndTime.getHours());
      endHour = Number(event.endDateAndTime.getHours());
      startMinutes = Number(event.startDateAndTime.getMinutes());
      endMinutes = Number(event.endDateAndTime.getMinutes());
      day = FULLDAYS.indexOf(getDayOfWeek(event.startDateAndTime));
    }

    return {
        id: index.toString(),
        name: event.eventName,
        description: event.eventDescription,
        location: event.eventLocation,
        weeks: event.weeks,
        startHour: startHour,
        endHour: endHour,
        startMinutes: startMinutes,
        endMinutes: endMinutes,
        day: day,
        color: event.color as 'coral' | 'yellow'| 'pink' | 'green' | 'blue' | 'purple' | 'teal' | 'gray' | 'rose',
    };
  });

  return (
    <div
      className={`
        w-full h-full p-4 rounded-lg overflow-hidden
        ${isNightMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-950'}
      `}
    >
    
      {/* Options */}
      <div className="flex items-center justify-between mb-3">
        <div className="mb-6 w-24">
          <label htmlFor="week-selector" 
            className={`block text-sm font-medium 
             ${isNightMode ? 'text-gray-200' : 'text-gray-800'}
            `}
            >
            Select Week:
          </label>
          <select
            id="week-selector"
            value={currentWeekIndex}
            onChange={(e) => setCurrentWeekIndex(Number(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-slate-950 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {WEEKOPTIONS.map((week, index) => (
              <option key={index} value={index}>
                {typeof week === 'number' ? `Week ${week}` : week}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="dayNightMode">Day</Label>
          <Switch 
            id="dayNightMode"
            checked={isNightMode} 
            onCheckedChange={(checked) => setIsNightMode(checked)} 
          />
          <Label htmlFor="dayNightMode">Night</Label>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeekIndex(prev => Math.min(Math.max(0, prev - 1), WEEKOPTIONS.length - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">{currentWeek}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeekIndex(prev => Math.min(Math.max(0, prev + 1), WEEKOPTIONS.length - 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Container */}

      <div className="overflow-x-auto">
        {/* Calendar Grid */}
        <div className="border border-gray-800 rounded-lg min-w-[560px]">
          {/* Time Headers */}
          <div
            className="grid border-b border-gray-800"
            style={{ gridTemplateColumns: `60px repeat(12, minmax(0, 1fr))` }}
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
              style={{ gridTemplateColumns: `60px repeat(12, minmax(0, 1fr))` }}
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
                  {processedEvents
                      .filter((event) => event.day === dayIndex && event.weeks.includes(weekNumber))
                      .map((event) => {
                        const startHour = event.startHour;
                        const endHour = event.endHour;
                        const startMinutes = event.startMinutes;
                        const endMinutes = event.endMinutes;

                        console.log("EVENT: " + event.name + " START: " + startHour + " END: " + endHour);

                        // Calculate the total number of minutes in the schedule
                        const scheduleStartTime = hours[0] * 60;
                        // Account for overnight in night mode 
                        const scheduleEndTime = isNightMode? 
                          (hours[hours.length - 1] * 60 + 60) + 24 * 60 :
                          hours[hours.length - 1] * 60 + 60;
    
                        let eventStartTime = startHour * 60 + startMinutes;
                        let eventEndTime = endHour * 60 + endMinutes;

                        // Clip event times to the visible window (for those events that span day and night)
                        eventStartTime = Math.max(scheduleStartTime, eventStartTime);
                        eventEndTime = Math.min(scheduleEndTime, eventEndTime);

                        // Adjust for overnight events
                        if (isNightMode && eventEndTime <= eventStartTime) {
                          eventEndTime += 24 * 60; // Add 24 hours to the end time
                        }
    
                        // Adjust for overnight events
                        if (isNightMode && eventStartTime < 20) {
                          eventStartTime += 24 * 60; // Add 24 hours to the start time
                        }

                        // 2) Clip event times to the visible window
                        const visibleStart = Math.max(scheduleStartTime, eventStartTime);
                        const visibleEnd = Math.min(scheduleEndTime, eventEndTime);

                        // 3) If no overlap, skip
                        if (visibleEnd <= visibleStart) return null;
    
                        // 4) Calculate offset/width based on clipped range
                        const totalScheduleMinutes = scheduleEndTime - scheduleStartTime;
                        const eventStartPercent = ((visibleStart - scheduleStartTime) / totalScheduleMinutes) * 100;
                        const eventDurationPercent = ((visibleEnd - visibleStart) / totalScheduleMinutes) * 100;

                        
                    
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




    </div>
  )
}