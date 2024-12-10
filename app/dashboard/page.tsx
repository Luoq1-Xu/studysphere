"use client"
import { CourseSelector } from "@/components/CourseSelector";
import { Daycard } from "@/components/Daycard";
import { NavBar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TypographyH2 } from "@/components/ui/typography";
import { useEffect, useState } from "react";


type Module = {
    code: string;
    title: string;
    semesters: string;
}

export default function Page() {
    const name = "StudySphere";
    const dates = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];
    const emptyWorkload = [
        {date: "Monday", WorkloadHours: 0},
        {date: "Tuesday", WorkloadHours: 0},
        {date: "Wednesday", WorkloadHours: 0},
        {date: "Thursday", WorkloadHours: 0},
        {date: "Friday", WorkloadHours: 0},
        {date: "Saturday", WorkloadHours: 0},
        {date: "Sunday", WorkloadHours: 0}
    ]
    const [selectedCourses, setSelectedCourses] = useState<Module[]>([]);
    const [workLoads, setWorkLoads] = useState(emptyWorkload);

    const handleCourseSelect = (course: Module) => {
        setSelectedCourses((prevCourses) => {
          // Check if the course already exists in the array
          if (prevCourses.some((c) => c.code === course.code)) {
            return prevCourses; // Return the previous array if the course already exists
          }
          return [...prevCourses, course]; // Add the new course to the array
        });
      };

    useEffect(() => {
        console.log(selectedCourses);
      }, [selectedCourses]);

    return (
        <div className="container mx-auto p-10">
            <NavBar />
            <div className="container mx-auto p-5">
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <p className="text-lg text-center sm:text-left my-5">Welcome to {name} Dashboard</p>
                <Button onClick={() => setSelectedCourses([])}> Add Course </Button>
                <CourseSelector onCourseSelect={ handleCourseSelect } />
            </div>
            <div className = "container mx-auto p-5">   
                <Card className="p-5 my-5">
                    <CardHeader>
                        <TypographyH2>Selected Mods</TypographyH2>
                    </CardHeader>
                    <CardContent>
                        {selectedCourses?.map((course) => (
                            <div key={course.code + course.title}> {course.code + " " + course.title}</div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <div className="container mx-auto p-5">
                <Daycard data={workLoads}/>
            </div>
            <div className="container mx-auto p-10">
                {dates.map((date) => (
                    <div key={date} className="border border-gray-200 rounded-md shadow-md p-10 my-2">
                        <h2 className="text-2xl font-bold">{date}</h2>
                        <p className="text-lg text-center sm:text-left py-5">Add your tasks for {date}</p>
                        <a className="px-4 py-2 text-white bg-blue-500 rounded-md shadow-md hover:bg-blue-600"> add task </a>
                    </div>
                ))}
            </div>
        </div>
  );
}