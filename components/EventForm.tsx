import { EventEntry, FormValues } from "@/lib/types";
import { FIRSTMONDAY } from "@/lib/utils";
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { TimePicker } from "./TimePicker";
import { DateTimePicker } from "./ui/datetime-picker";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormDescription, 
  FormMessage, 
  FormControl 
} from "./ui/form";

export function EventForm({
  onEventSubmit,
  buttonText,
  existingEvent,
}: {
  onEventSubmit: (event: EventEntry) => void;
  buttonText: string;
  existingEvent?: EventEntry;
}) {
     const getWeekNumber = (date: Date): number => {
        const diffInDays = Math.floor((date.getTime() - FIRSTMONDAY.getTime()) / (1000 * 60 * 60 * 24));
        return Math.floor(diffInDays / 7) + 1; // week 1 starts on FIRSTMONDAY
      };
    
      const form = useForm<FormValues>({
        defaultValues: existingEvent
      ? {
          isRecurring: existingEvent.isRecurring,
          eventName: existingEvent.eventName,
          eventDescription: existingEvent.eventDescription,
          eventLocation: existingEvent.eventLocation,
          startDateAndTime: existingEvent.startDateAndTime,
          endDateAndTime: existingEvent.endDateAndTime,
          dayOfWeek: existingEvent.dayOfWeek || "Monday",
          recurringStartTime: existingEvent.recurringStartTime || { hour: "08", minute: "00" },
          recurringEndTime: existingEvent.recurringEndTime || { hour: "09", minute: "00" },
          weeks: existingEvent.weeks || [],
          type: existingEvent.type || "user",
          color: existingEvent.color || "rose",
        }
      : {
          isRecurring: false,
          eventName: "",
          eventDescription: "",
          eventLocation: "",
          startDateAndTime: new Date(),
          endDateAndTime: new Date(),
          dayOfWeek: "Monday",
          recurringStartTime: { hour: "08", minute: "00" },
          recurringEndTime: { hour: "09", minute: "00" },
          weeks: [],
          type: "user",
          color: "rose",
        },
      });
    
      const { watch, control, handleSubmit } = form;
    
      const isRecurring = watch("isRecurring");
    
      const onSubmit = (values: FormValues) => {
        if (values.isRecurring) {
          values.weeks = Array.from({ length: 13 }, (_, i) => i + 1);
        } else {
          const startWeek = Math.max(getWeekNumber(values.startDateAndTime), 0);
          const endWeek = Math.min(getWeekNumber(values.endDateAndTime), 15);
          values.weeks = Array.from({ length: endWeek - startWeek + 1 }, (_, i) => i + startWeek);
        }
        onEventSubmit(values as EventEntry);
      };

      return (
        <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit, (errors) => {
                console.log("Validation Errors:", errors);
              })}
              className="space-y-8"
            >
              {/* Recurring Event Switch */}
              <FormField
                control={control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-col" id="isRecurring">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="recurring-switch"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel htmlFor="recurring-switch">Recurring Event</FormLabel>
                    </div>
                    <FormDescription>
                      Select if the event occurs every week.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* One-time Event Fields */}
              {!isRecurring && (
                <>
                  {/* Start Date and Time */}
                  <FormField
                    control={control}
                    name="startDateAndTime"
                    rules={{ required: "Start date/time is required." }}
                    render={({ field }) => (
                      <FormItem id="start-date-time">
                        <FormLabel htmlFor="start-date-time">Start Date & Time (12h)</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            hourCycle={12}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>Select the start date and time for the event.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* End Date and Time */}
                  <FormField
                    control={control}
                    name="endDateAndTime"
                    rules={{ required: "End date/time is required.",
                      validate: (val) => {
                        const start = watch("startDateAndTime");
                        return (
                          val.getTime() > start.getTime() || "End date/time must be after start."
                        );
                      }
                     }}
                    render={({ field }) => (
                      <FormItem id="end-date-time">
                        <FormLabel htmlFor="end-date-time">End Date & Time (12h)</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            hourCycle={12}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>Select the end date and time for the event.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Recurring Event Fields */}
              {isRecurring && (
                <>
                  {/* Day of the Week */}
                  <FormField
                    control={control}
                    name="dayOfWeek"
                    rules={{ required: "A day of the week is required." }}
                    render={({ field }) => (
                      <FormItem id="day-of-week">
                        <FormLabel htmlFor="day-of-week">Recurring Day</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value} name="dayOfWeek">
                            <SelectTrigger>
                              <SelectValue placeholder="Select Day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Monday">Monday</SelectItem>
                              <SelectItem value="Tuesday">Tuesday</SelectItem>
                              <SelectItem value="Wednesday">Wednesday</SelectItem>
                              <SelectItem value="Thursday">Thursday</SelectItem>
                              <SelectItem value="Friday">Friday</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Recurring Start Time */}
                  <FormField
                    control={control}
                    name="recurringStartTime"
                    rules={{ required: "Recurring start time is required." }}
                    render={({ field }) => (
                      <FormItem id="recurring-start-time">
                        <TimePicker {...field} label="Recurring Start Time" />
                      </FormItem>
                    )}
                  />

                  {/* Recurring End Time */}
                  <FormField
                    control={control}
                    name="recurringEndTime"
                    rules={{
                      validate: (val) => {
                        const start = watch("recurringStartTime");
                        const startMinutes = parseInt(start.hour, 10) * 60 + parseInt(start.minute, 10);
                        const endMinutes = parseInt(val.hour, 10) * 60 + parseInt(val.minute, 10);
                        return (
                          endMinutes >= startMinutes || "Recurring end time must be after start."
                        );
                      },
                    }}
                    render={({ field }) => (
                      <FormItem id="recurring-end-time">
                        <TimePicker {...field} label="Recurring End Time" />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Event Name */}
              <FormField
                control={control}
                name="eventName"
                rules={{ required: "An event name is required." }}
                render={({ field }) => (
                  <FormItem id="event-name">
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input id="eventName" placeholder="name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a name for the event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Description */}
              <FormField
                control={control}
                name="eventDescription"
                rules={{ required: "Event description is required." }}
                render={({ field }) => (
                  <FormItem id="event-description">
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Input id="eventDescription" placeholder="description" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a description for the event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Location */}
              <FormField
                control={control}
                name="eventLocation"
                rules={{ required: "Event location is required." }}
                render={({ field }) => (
                  <FormItem id="event-location">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input id="eventLocation" placeholder="location" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a location for the event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">{buttonText}</Button>
            </form>
          </Form>
      );
}