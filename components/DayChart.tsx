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

type ChartData = {
  date: string,
  WorkloadHours: number,
}

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

export function DayChart({ data }: { data: ChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Workload</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="date"
              type="category"
              tickLine={false}
              tickMargin={-10}
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
            <Bar dataKey="visitors" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
