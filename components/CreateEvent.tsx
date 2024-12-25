import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { FIRSTMONDAY } from "@/lib/utils";
import { Switch } from "./ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "./ui/toaster";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TimePicker } from "./TimePicker";
import { CustomEvent } from "@/lib/types";
import { DateTimePicker } from "./ui/datetime-picker";

type FormValues = {
  eventName: string;
  eventDescription: string;
  eventLocation: string;
  isRecurring: boolean;
  startDateAndTime: Date;
  endDateAndTime: Date;
  dayOfWeek: string;
  recurringStartTime: {
    hour: string;
    minute: string;
  };
  recurringEndTime: {
    hour: string;
    minute: string;
  };
  weeks: number[];
  type: string;
  color: string;
};

export function CreateEvent({ onEventAdd }: { onEventAdd: (event: CustomEvent) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      isRecurring: false,
      eventName: "",
      eventDescription: "",
      eventLocation: "",
      startDateAndTime: new Date(),
      endDateAndTime: new Date(),
      dayOfWeek: "Monday",
      recurringStartTime: {
        hour: "08",
        minute: "00",
      },
      recurringEndTime: {
        hour: "09",
        minute: "00",
      },
      weeks: [],
      type: "user",
      color: "rose",
    },
  });

  const { watch, control, handleSubmit } = form;

  const isRecurring = watch("isRecurring");

  const getWeekNumber = (date: Date): number => {
    const diffInDays = Math.floor((date.getTime() - FIRSTMONDAY.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(diffInDays / 7) + 1; // week 1 starts on FIRSTMONDAY
  };

  const onSubmit = (values: FormValues) => {
    if (values.isRecurring) {
      values.weeks = Array.from({ length: 13 }, (_, i) => i + 1);
    } else {
      const startWeek = Math.min(getWeekNumber(values.startDateAndTime), 0);
      const endWeek = Math.max(getWeekNumber(values.endDateAndTime), 15);
      values.weeks = Array.from({ length: endWeek - startWeek + 1 }, (_, i) => i + startWeek);
    }
    console.log("Form Values:", values);
    toast({
      title: `Event Created: ${values.eventName}`,
      description: "Event has been created successfully.",
    });
    onEventAdd(values as CustomEvent);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>Create Event</Button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col h-full p-6">
        <div className="flex-1 overflow-y-auto mx-auto w-full max-w-md p-3">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit, (errors) => {
                console.log("Validation Errors:", errors);
              })}
              className="space-y-8"
            >
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
                <DialogDescription>
                  Create a new event by entering the event details below.
                </DialogDescription>
              </DialogHeader>

              {/* Recurring Event Switch */}
              <FormField
                control={control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
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
                      <FormItem>
                        <FormLabel>Start Date & Time (12h)</FormLabel>
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
                      <FormItem>
                        <FormLabel>End Date & Time (12h)</FormLabel>
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
                      <FormItem>
                        <FormLabel>Recurring Day</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                      <FormItem>
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
                      <FormItem>
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
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="name" {...field} />
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
                  <FormItem>
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Input placeholder="description" {...field} />
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
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="location" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a location for the event.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Create Event</Button>
            </form>
          </Form>
          <DrawerClose asChild>
            <Button variant="outline" className="my-5">Cancel</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
      <Toaster />
    </Drawer>
  );
}

