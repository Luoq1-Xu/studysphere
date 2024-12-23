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
import { cn, FIRSTMONDAY } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Switch } from "./ui/switch";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "./ui/toaster";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TimePicker } from "./TimePicker";
import { CustomEvent } from "@/lib/types";

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

  const handleDateSelect = (date: Date | undefined, field: "startDateAndTime" | "endDateAndTime") => {
    if (date) {
      form.setValue(field, date);
    }
  };

  // Credit to Rudro Dip Sarker https://rdsx.dev/
  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    value: string,
    field: "startDateAndTime" | "endDateAndTime"
  ) => {
    const currentDate = watch(field) || new Date();
    const newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(value, 10);
      newDate.setHours(currentDate.getHours() >= 12 ? hour + 12 : hour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    } else if (type === "ampm") {
      const hours = currentDate.getHours();
      if (value === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (value === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    form.setValue(field, newDate);
  };

  const getWeekNumber = (date: Date): number => {
    const diffInDays = Math.floor((date.getTime() - FIRSTMONDAY.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(diffInDays / 7) + 1; // week 1 starts on FIRSTMONDAY
  };

  const onSubmit = (values: FormValues) => {
    if (values.isRecurring) {
      values.weeks = Array.from({ length: 13 }, (_, i) => i + 1);
    } else {
      const startWeek = getWeekNumber(values.startDateAndTime);
      const endWeek = getWeekNumber(values.endDateAndTime);
      values.weeks = Array.from({ length: endWeek - startWeek + 1 }, (_, i) => i + startWeek);
    }
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
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
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
                      <FormItem className="flex flex-col">
                        <FormLabel>Enter start date and time</FormLabel>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MM/dd/yyyy hh:mm aa")
                                ) : (
                                  <span>MM/DD/YYYY hh:mm aa</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 h-64">
                            <div className="sm:flex">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => handleDateSelect(date, "startDateAndTime")}
                                initialFocus
                              />
                              <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                                {/* Hours */}
                                <ScrollArea className="w-64 sm:w-auto">
                                  <div className="flex sm:flex-col p-2">
                                    {Array.from({ length: 12 }, (_, i) => i + 1)
                                      .reverse()
                                      .map((hour) => (
                                        <Button
                                          key={hour}
                                          size="icon"
                                          variant={
                                            field.value &&
                                            field.value.getHours() % 12 === hour % 12
                                              ? "default"
                                              : "ghost"
                                          }
                                          className="sm:w-full shrink-0 aspect-square"
                                          onClick={() =>
                                            handleTimeChange("hour", hour.toString(), "startDateAndTime")
                                          }
                                        >
                                          {hour}
                                        </Button>
                                      ))}
                                  </div>
                                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                                </ScrollArea>

                                {/* Minutes */}
                                <ScrollArea className="w-64 sm:w-auto">
                                  <div className="flex sm:flex-col p-2">
                                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                                      <Button
                                        key={minute}
                                        size="icon"
                                        variant={
                                          field.value &&
                                          field.value.getMinutes() === minute
                                            ? "default"
                                            : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() =>
                                          handleTimeChange("minute", minute.toString(), "startDateAndTime")
                                        }
                                      >
                                        {minute.toString().padStart(2, "0")}
                                      </Button>
                                    ))}
                                  </div>
                                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                                </ScrollArea>

                                {/* AM/PM */}
                                <ScrollArea className="">
                                  <div className="flex sm:flex-col p-2">
                                    {["AM", "PM"].map((ampm) => (
                                      <Button
                                        key={ampm}
                                        size="icon"
                                        variant={
                                          field.value &&
                                          ((ampm === "AM" &&
                                            field.value.getHours() < 12) ||
                                            (ampm === "PM" &&
                                              field.value.getHours() >= 12))
                                            ? "default"
                                            : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeChange("ampm", ampm, "startDateAndTime")}
                                      >
                                        {ampm}
                                      </Button>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Select the start date and time for the event.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* End Date and Time */}
                  <FormField
                    control={control}
                    name="endDateAndTime"
                    rules={{
                      required: "End date/time is required.",
                      validate: (endValue) => {
                        const startValue = watch("startDateAndTime");
                        return (
                          endValue > startValue || "End date and time must be after start date and time."
                        );
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Enter end date and time</FormLabel>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "MM/dd/yyyy hh:mm aa")
                                ) : (
                                  <span>MM/DD/YYYY hh:mm aa</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <div className="sm:flex">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => handleDateSelect(date, "endDateAndTime")}
                                disabled={(date) => date < watch("startDateAndTime")}
                                initialFocus
                              />
                              <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                                {/* Hours */}
                                <ScrollArea className="w-64 sm:w-auto">
                                  <div className="flex sm:flex-col p-2">
                                    {Array.from({ length: 12 }, (_, i) => i + 1)
                                      .reverse()
                                      .map((hour) => (
                                        <Button
                                          key={hour}
                                          size="icon"
                                          variant={
                                            field.value &&
                                            field.value.getHours() % 12 === hour % 12
                                              ? "default"
                                              : "ghost"
                                          }
                                          className="sm:w-full shrink-0 aspect-square"
                                          onClick={() =>
                                            handleTimeChange("hour", hour.toString(), "endDateAndTime")
                                          }
                                        >
                                          {hour}
                                        </Button>
                                      ))}
                                  </div>
                                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                                </ScrollArea>

                                {/* Minutes */}
                                <ScrollArea className="w-64 sm:w-auto max-h-72 overflow-auto pointer-events-auto">
                                  <div className="flex sm:flex-col p-2">
                                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                                      <Button
                                        key={minute}
                                        size="icon"
                                        variant={
                                          field.value &&
                                          field.value.getMinutes() === minute
                                            ? "default"
                                            : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() =>
                                          handleTimeChange("minute", minute.toString(), "endDateAndTime")
                                        }
                                      >
                                        {minute.toString().padStart(2, "0")}
                                      </Button>
                                    ))}
                                  </div>
                                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                                </ScrollArea>

                                {/* AM/PM */}
                                <ScrollArea className="">
                                  <div className="flex sm:flex-col p-2">
                                    {["AM", "PM"].map((ampm) => (
                                      <Button
                                        key={ampm}
                                        size="icon"
                                        variant={
                                          field.value &&
                                          ((ampm === "AM" &&
                                            field.value.getHours() < 12) ||
                                            (ampm === "PM" &&
                                              field.value.getHours() >= 12))
                                            ? "default"
                                            : "ghost"
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() => handleTimeChange("ampm", ampm, "endDateAndTime")}
                                      >
                                        {ampm}
                                      </Button>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Select the end date and time for the event.
                        </FormDescription>
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