"use client"

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { DayChart } from "./DayChart"
import { useState, useEffect } from "react";
import { ModuleSchedule } from "@/lib/types";
  

export const Daycard = ({ modData }: { modData: ModuleSchedule[] }) => {

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
        </CardHeader>
        <CardContent>
            <DayChart modData={modData} />
        </CardContent>
        <CardFooter>
            <p>Card Footer</p>
        </CardFooter>
    </Card>
      )
    }