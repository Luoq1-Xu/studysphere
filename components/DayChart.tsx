"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, Legend, Tooltip, XAxis, YAxis } from "recharts"

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
} from "@/components/ui/chart"
import { ModuleSchedule } from "@/lib/types"

export function DayChart({ modData }: { modData: ModuleSchedule[] }) {

  interface WorkloadData {
    date: string;
    modules: {
      [moduleCode: string]: number;
    };
  }

  const data: WorkloadData[] = [
    {
      date: "Monday",
      modules: {},
    },
    {
      date: "Tuesday",
      modules: {},
    },
    {
      date: "Wednesday",
      modules: {},
    },
    {
      date: "Thursday",
      modules: {},
    },
    {
      date: "Friday",
      modules: {},
    },
    {
      date: "Saturday",
      modules: {},
    },
    {
      date: "Sunday",
      modules: {},
    },
  ];

  interface chartConfigType {
    [moduleCode: string]: {
      label: string;
      color: string;
    };
  }

  const chartConfig: chartConfigType = {} satisfies ChartConfig;

  for (const mod of modData) {
    const modCode = mod.moduleCode
    for (const item of data) {
      item.modules[modCode] = 0;
    }
    chartConfig[modCode] = {
      label: mod.moduleCode + " " + mod.moduleTitle,
      color: getColor(data.length),
    }
    for (const lesson of mod.lessons) {
      const day = lesson.day
      const startTime = lesson.startTime
      const endTime = lesson.endTime
      const duration = (parseTime(endTime) - parseTime(startTime)) / 60
      const index = data.findIndex((d) => d.date === day)
      data[index].modules[modCode] += duration
    }
  }

  const flattenedData = data.map((item) => ({
    date: item.date,
    ...item.modules,
  }));

  // Get module codes
  const moduleCodes = Array.from(
    new Set(
      data.flatMap((item) => Object.keys(item.modules))
    )
  );

  return (
    <Card className="min-w-36 w-3/4">
      <CardHeader>
        <CardTitle>Weekly Lesson Time</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            width={500}
            height={300}
            data={flattenedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="date" />
              <YAxis  label={{ value: 'Workload in hours', angle: -90, position: 'insideLeft' }}/>
              <Tooltip />
              <Legend />
                {moduleCodes.map((code, index) => (
                  <Area
                    key={code}
                    type="step"
                    dataKey={code}
                    stackId="1"
                    stroke={getColor(index)}
                    fill={getColor(index)}
                  />
                ))}
            </AreaChart>
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

// Helper function to assign colors
function getColor(index: number) {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#387908'];
  return colors[index % colors.length];
}