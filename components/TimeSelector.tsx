import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

export function TimeSelector() {
    const hours = Array.from({ length: 12 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
    return (
        <Popover >
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 rounded-md">
            <div className="flex justify-between p-4">
                <ScrollArea className="h-72 w-48 rounded-md border">
                    <div className="p-4">
                        <h4 className="mb-4 text-sm font-medium leading-none">Hour</h4>
                        {hours.map((hour) => (
                            <div key={hour} className="text-sm">
                                {hour}
                                <Separator className="my-2" />
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <ScrollArea className="h-72 w-48 rounded-md border">
                    <div className="p-4">
                        <h4 className="mb-4 text-sm font-medium leading-none">Minute</h4>
                        {minutes.map((minute) => (
                            <div key={minute} className="text-sm">
                                {minute}
                                <Separator className="my-2" />
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            
        </PopoverContent>
      </Popover>
    );
}