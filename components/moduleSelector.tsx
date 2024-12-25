/* eslint-disable @typescript-eslint/no-unused-vars */

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useQuery } from "react-query"
import { FixedSizeList as List } from "react-window"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useVirtualizer } from "@tanstack/react-virtual"



type mod = {
  code: string
  title: string
  semesters: string
}

interface CourseSelectorProps {
  onCourseSelect: (course: mod) => void;
}

export function ModuleSelector({ onCourseSelect }: CourseSelectorProps) {
    const [open, setOpen] = React.useState<boolean>(false);
    const [selectedOption, setSelectedOption] = React.useState("");
    const searchPlaceholder = "Search modules...";
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    const {
        data: mods,
        isError,
        isLoading,
    } = useQuery<mod[]>({
        queryKey: "mods",
        queryFn: async () => {
        const response = await fetch("/api/modules")
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        return response.json()
        },
        staleTime: Infinity,
    })

    if (isLoading) {
        return (
        <Popover open={false} modal={true}>
            <PopoverTrigger asChild>
            <Button
                variant="outline"
                className="w-full justify-between"
                disabled
            >
                Loading...
            </Button>
            </PopoverTrigger>
        </Popover>
        )
    }

    if (isError) {
        return <div>Error loading mods</div>
    }

    if (!mods) {
        return <div>No mods found</div>
        }

    const options = mods.map((mod) => ({
        value: mod.code,
        label: `${mod.code} - ${mod.title}`
    }));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between"
                style={{
                width: "100%",
                }}
                ref={triggerRef}
            >
                {selectedOption
                ? options.find((option) => option.value === selectedOption)?.value
                : searchPlaceholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: triggerRef.current?.offsetWidth }} >
            <VirtualizedCommand
                height={"400px"}
                options={options}
                placeholder={searchPlaceholder}
                selectedOption={selectedOption}
                onSelectOption={(currentValue) => {
                    setSelectedOption(
                        currentValue === selectedOption ? "" : currentValue
                    );
                    const mod = mods.find((mod) => mod.code === currentValue);
                    if (mod) {
                        onCourseSelect(mod);
                    }
                    setOpen(false);
                }}
            />
            </PopoverContent>
        </Popover>
        );
}


type Option = {
  value: string;
  label: string;
};

interface VirtualizedCommandProps {
  height: string;
  options: Option[];
  placeholder: string;
  selectedOption: string;
  onSelectOption?: (option: string) => void;
}

const VirtualizedCommand = ({
  height,
  options,
  placeholder,
  selectedOption,
  onSelectOption,
}: VirtualizedCommandProps) => {
  const [filteredOptions, setFilteredOptions] =
    React.useState<Option[]>(options);
  const parentRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  const virtualOptions = virtualizer.getVirtualItems();

  const handleSearch = (search: string) => {
    try {
        setFilteredOptions(
            options.filter((option) =>
              option.value
                  .toLowerCase()
                  .includes(search?.toLowerCase() ?? [])
            )
          );
    } catch (error) {
        console.log(error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
    }
  };

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      <CommandInput onValueChange={handleSearch} placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>No item found.</CommandEmpty>
        <CommandGroup
            ref={parentRef}
            style={{
            height: height,
            width: "100%",
            overflow: "auto",
            scrollbarWidth: "none",
            }}
        >
            <div
            style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
            }}
            >
            {virtualOptions.map((virtualOption) => {
                const option = filteredOptions[virtualOption.index];
                
                if (!option) {
                console.error(`No option found for index ${virtualOption.index}`);
                return null;
                }

                return (
                <CommandItem
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualOption.start}px)`,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "normal",
                        lineHeight: "1.4",
                        padding: "8px 0",
                    }}
                    key={filteredOptions[virtualOption.index].value}
                    value={filteredOptions[virtualOption.index].value}
                    onSelect={onSelectOption}
                >
                <Check
                    className={cn(
                    "mr-2 h-4 w-4",
                    selectedOption === filteredOptions[virtualOption.index].value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                />
                <div className="truncate">{filteredOptions[virtualOption.index].label}</div>
                </CommandItem>
            )}
            )}
            </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
