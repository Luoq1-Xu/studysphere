"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { DayChart } from "./DayChart"
import { useState, useEffect } from "react";
  
type ChartData = {
    date: string,
    WorkloadHours: number,
  }

export const Daycard = ({ data }: { data: ChartData[] }) => {

    const [today, setToday] = useState('');

    useEffect(() => {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        setToday(formattedDate);
    }, []);


    return (
    <Card>
        <CardHeader>
            <CardTitle>{today}</CardTitle>
            <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
            <DayChart data={data} />
        </CardContent>
        <CardFooter>
            <p>Card Footer</p>
        </CardFooter>
    </Card>
      )
    }