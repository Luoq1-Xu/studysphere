"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ModuleSchedule } from "@/lib/types"

const chartConfig = {
  WorkloadHours: {
    label: "Hours",
  },
  Monday: {
    label: "Monday",
    color: "hsl(var(--chart-1))",
  },
  Tuesday: {
    label: "Tuesday",
    color: "hsl(var(--chart-2))",
  },
  Wednesday: {
    label: "Wednesday",
    color: "hsl(var(--chart-3))",
  },
  Thursday: {
    label: "Thursday",
    color: "hsl(var(--chart-4))",
  },
  Friday: {
    label: "Friday",
    color: "hsl(var(--chart-5))",
  },
  Saturday: {
    label: "Saturday",
    color: "hsl(var(--chart-6))",
  },
  Sunday: {
    label: "Sunday",
    color: "hsl(var(--chart-7))",
  },
} satisfies ChartConfig

export function DayChart({ modData }: { modData: ModuleSchedule[] }) {

  const data = [
    {
      date: "Monday",
      WorkloadHours: 0,
    },
    {
      date: "Tuesday",
      WorkloadHours: 0,
    },
    {
      date: "Wednesday",
      WorkloadHours: 0,
    },
    {
      date: "Thursday",
      WorkloadHours: 0,
    },
    {
      date: "Friday",
      WorkloadHours: 0,
    },
    {
      date: "Saturday",
      WorkloadHours: 0,
    },
    {
      date: "Sunday",
      WorkloadHours: 0,
    }
  ]

  for (const mod of modData) {
    for (const lesson of mod.lessons) {
      const day = lesson.day
      const startTime = lesson.startTime
      const endTime = lesson.endTime
      const duration = (parseTime(endTime) - parseTime(startTime)) / 60
      const index = data.findIndex((d) => d.date === day)
      data[index].WorkloadHours += duration
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Workload</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px]">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 20,
            }}
          >
            <YAxis
              dataKey="date"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="WorkloadHours" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="WorkloadHours" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4"/>
        </div>
        <div className="leading-none text-muted-foreground">
          Showing weekly workload
        </div>
      </CardFooter>
    </Card>
  )
}


function parseTime(time: string): number {
  const hours = parseInt(time.slice(0, 2), 10);
  const minutes = parseInt(time.slice(2, 4), 10);
  return hours * 60 + minutes;
}