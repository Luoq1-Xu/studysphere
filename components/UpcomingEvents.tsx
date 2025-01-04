import { useState } from "react";
import { EventEntry } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { EventForm } from "./EventForm";

export function UpcomingEvents({ 
    events,
    handleEventOperation, 
}: { 
    events: EventEntry[],
    handleEventOperation: (operation: string, event: EventEntry, modifiedEvent?: EventEntry) => void 
}) {

  // Show user created events only.
  const filteredEvents = events.filter(event => event.type === "user");
  filteredEvents.sort((a, b) => a.startDateAndTime.getTime() - b.startDateAndTime.getTime());

  const [isOpen, setIsOpen] = useState(false);
  const hasMoreEvents = events.length > 2;
  const visibleEvents = hasMoreEvents ? filteredEvents.slice(0, 2) : filteredEvents;
  const hiddenEvents = hasMoreEvents ? filteredEvents.slice(2) : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-1 gap-4">
            {visibleEvents.map((event, index) => (
                <UpcomingEventCard key={index} event={event} index={index} handleEventOperation={handleEventOperation}/>)
            )}

            {hasMoreEvents && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="col-span-full">
                <CollapsibleContent>
                <div className="grid sm:grid-cols-1 gap-4">
                  {hiddenEvents.map((event, index) => (
                    <UpcomingEventCard key={index} event={event} index={index} handleEventOperation={handleEventOperation}/>
                  ))}
                </div>
                </CollapsibleContent>
                <CollapsibleTrigger className="underline text-md">
                    {isOpen ? "Show fewer" : `Show ${hiddenEvents.length} more`}
                </CollapsibleTrigger>
            </Collapsible>
            )}
        </div>
      </CardContent>
    </Card>
  );
}


function UpcomingEventCard({ 
  event, 
  index,
  handleEventOperation 
}: { 
  event: EventEntry, 
  index: number,
  handleEventOperation: (operation: string, event: EventEntry, modifiedEvent?: EventEntry) => void}) {

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    return (
        <Card key={index} className="my-3">
        <CardHeader>
            <div className="flex justify-between">
                <div className="w-full">
                    <CardTitle className="max-w-[75%] truncate">{event.eventName}</CardTitle>
                    <CardDescription className="max-w-[75%] truncate">{event.eventLocation}</CardDescription>
                </div>
                <Badge
                    variant={`${event.isRecurring ? "default" : "outline"}`}
                >
                    {event.isRecurring? "recurring" : "Non-Recurring"}
                </Badge>
            </div>
        </CardHeader>
        <CardContent>
            <div className="max-w-[50%] truncate">{event.eventDescription}</div>
            {!event.isRecurring &&
                (
                    <div>
                        <div>Start: {event.startDateAndTime.toLocaleDateString("en-SG", { timeZone: "Asia/Singapore" })} {event.startDateAndTime.toLocaleTimeString("en-SG", { timeZone: "Asia/Singapore" })}</div>
                        <div>End: {event.endDateAndTime.toLocaleDateString("en-SG", { timeZone: "Asia/Singapore" })} {event.endDateAndTime.toLocaleTimeString("en-SG", { timeZone: "Asia/Singapore" })}</div>
                    </div>
                )}
            {event.isRecurring &&
                (
                    <div>
                        <div>{event.dayOfWeek}</div>
                        <div>{event.recurringStartTime.hour}:{event.recurringStartTime.minute} - {event.recurringEndTime.hour}:{event.recurringEndTime.minute}</div>
                    </div>
                )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogDescription></DialogDescription> {/* Add description */}
              <p>Are you sure you want to delete this event?</p>
              <div className="flex justify-end">
                <Button variant="destructive" onClick={() => {
                  handleEventOperation("remove", event);
                  setIsDeleteOpen(false);
                }}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">Edit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription></DialogDescription> {/* Add description */}
                <EventForm 
                  onEventSubmit={(modifiedEvent) => {
                    handleEventOperation("edit", event, modifiedEvent);
                    setIsEditOpen(false);
                  }} 
                  buttonText="Edit Event" 
                  existingEvent={event}
                />
            </DialogContent>
          </Dialog>
        </CardFooter>
        </Card>
    );
}