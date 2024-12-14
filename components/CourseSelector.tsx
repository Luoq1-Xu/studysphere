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
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "./ui/skeleton"

type mod = {
  code: string
  title: string
  semesters: string
}

interface CourseSelectorProps {
  onCourseSelect: (course: mod) => void;
}

export function CourseSelector({ onCourseSelect }: CourseSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [search, setSearch] = React.useState("")
  const listRef = React.useRef<List>(null);

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

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  }, [search]);

  if (isLoading) {
    return (
      <Popover open={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between mx-5"
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

  const filteredModules = mods?.filter((mod) =>
    mod.title.toLowerCase().includes(search.toLowerCase()) ||
    mod.code.toLowerCase().includes(search.toLowerCase())
  ) || []

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {

    const mod = filteredModules[index]
    if (filteredModules.length === 0 || !mod) {
      return (
        <div style={style}>
          No modules found
        </div>
      );
    }

    return (
      <CommandItem
        key={mod.code}
        value={mod.code + " " + mod.title}
        onSelect={(currentValue: string) => {
          setValue(currentValue === value ? "" : currentValue)
          setOpen(false)
          onCourseSelect(mod)
        }}
        style={style}
      >
        {mod.code + " " + mod.title}
        <Check
          className={cn(
            "ml-auto",
            value === mod.title ? "opacity-100" : "opacity-0"
          )}
        />
      </CommandItem>
    )
  }

  if (!mods) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="w-full justify-between mx-5"/>
        </CardContent>
      </Card>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between mx-5"
        >
          {value
            ? mods?.find((mod: mod) => mod.code + " " + mod.title === value)?.title
            : "Add Module..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-5">
        <Command>
          <CommandInput 
            placeholder="Search mod..." 
            value={search}
            onValueChange={setSearch}/>
          <CommandList className="hide-scrollbar">
            <CommandEmpty>No mods found.</CommandEmpty>
            <CommandGroup>
              <List
                ref={listRef}
                height={400}
                itemCount={filteredModules.length}
                itemSize={40}
                width={600}
              >
                {({ index, style }) => (
                  <Row index={index} style={style} />
                )}
              </List>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}