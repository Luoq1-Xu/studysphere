import { Button } from "@/components/ui/button";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "./ui/toaster";
import { Drawer, DrawerClose, DrawerContent, DrawerTitle, DrawerTrigger } from "./ui/drawer";
import { EventEntry } from "@/lib/types";
import { FormValues } from "@/lib/types";
import { EventForm } from "./EventForm";


export function CreateEvent({ onEventAdd }: { onEventAdd: (event: EventEntry) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const onSubmit = (values: FormValues) => {
    console.log("Form Values:", values);
    toast({
      title: `Event Created: ${values.eventName}`,
      description: "Event has been created successfully.",
    });
    onEventAdd(values as EventEntry);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>Create Event</Button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col h-full p-6 text-center">
        <DrawerTitle className="justify-center">Create Event</DrawerTitle>
        <div className="flex-1 overflow-y-auto mx-auto w-full max-w-md p-3">
          <EventForm onEventSubmit={onSubmit} buttonText="Create Event" />
          <DrawerClose asChild>
            <Button variant="outline" className="my-5">Cancel</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
      <Toaster />
    </Drawer>
  );
}

