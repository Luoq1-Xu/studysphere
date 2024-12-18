"use client"
import { CourseSelector } from "@/components/CourseSelector";
import { NavBar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { DetailedModuleInfo, Module, ModuleSchedule } from "@/lib/types";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { useQuery } from "react-query";
import { TestWorkloadCard } from "@/components/TestWorkLoadCard";
import { ModuleCard } from "@/components/ModuleCard";
import { ImportModules } from "@/components/ImportModules";
import { LessonsCard } from "@/components/LessonsCard";
import { Daycard } from "@/components/Daycard";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { convertLessonType, parseFunc } from "@/lib/utils";

export default function Page() {

    // selectedCourses -> Array of selected courses
    // modulesData -> Array of module details (detailed module data)
    // importUrl -> URL to import modules
    // lessonsData -> 1 object with key-value pairs where key = moduleCode and value = lesson details
    // modScheduleData -> Array of module schedules



    const name = "StudySphere";
    const [selectedCourses, setSelectedCourses] = useState<Module[]>([]);
    const [modulesData, setModulesData] = useState<DetailedModuleInfo[]>([]);
    const [importUrl, setImportUrl] = useState<string | null>(null);
    const [lessonsData, setLessonsData] = useState<Record<string, Record<string, string>>>({});
    const [modScheduleData, setModScheduleData] = useState<ModuleSchedule[]>([]);
    const prevModulesDataRef = useRef<DetailedModuleInfo[]>([]);
    const prevSelectedCoursesRef = useRef<Module[]>([]);

    // Fetch module info from the API
    const fetchModuleInfo = async (moduleCode: string) => {
        const response = await fetch(`/api/moduleInfo?moduleCode=${moduleCode}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    };

    // Update lessonsData (lesson details) based on the added courses
    const updateLessonsData = async (addedCourses: Module[]) => {
        try {
            const newModulesData = await Promise.all(
                addedCourses.map((course) => fetchModuleInfo(course.code))
            );
            const newLessonData = { ...lessonsData };
            const uniqueLessons = [] as { lessonType: string, lessonNumber: string }[];

            const flattenedModulesData = newModulesData.flat();

            flattenedModulesData.forEach((module: DetailedModuleInfo) => {
                const moduleCode = module.moduleCode;
                const semesterData = parseFunc(module.semesterData as unknown as string) as DetailedModuleInfo['semesterData'];
                const lessons: Record<string, string> = {};

                const chosenSemester = semesterData[0];
                chosenSemester.timetable.forEach((lesson) => {
                    const lessonType = lesson.lessonType;
                    const lessonNumber = lesson.classNo;
                    if (!lessons[lessonType]) {
                        uniqueLessons.push({ lessonType, lessonNumber });
                        lessons[lessonType] = lessonNumber;
                    }
                });

                newLessonData[moduleCode] = lessons;
            });

            const updatedLessonDetails = flattenedModulesData.map((module: DetailedModuleInfo) => {
                const semesterData = parseFunc(module.semesterData as unknown as string) as DetailedModuleInfo['semesterData'];
                const chosenSemester = semesterData[0];
                const lessonWorkload = uniqueLessons.flatMap((lessonType: { lessonType: string, lessonNumber: string }) => {
                    const lessonData = chosenSemester.timetable.filter((lessonData) => lessonData.lessonType === lessonType.lessonType && lessonData.classNo === lessonType.lessonNumber);
                    return lessonData.map((lesson) => ({
                        lessonType: convertLessonType(lesson.lessonType),
                        lessonNumber: lessonType.lessonNumber,
                        startTime: lesson.startTime,
                        endTime: lesson.endTime,
                        venue: lesson.venue,
                        day: lesson.day,
                        size: lesson.size,
                        weeks: lesson.weeks,
                    })) || [];
                });
                return {
                    moduleCode: module.moduleCode,
                    moduleTitle: module.title,
                    description: module.description,
                    lessons: lessonWorkload,
                }
            });

            console.log("NEW LESSON DATA", updatedLessonDetails);

            setModScheduleData((prevData) => [...prevData, ...updatedLessonDetails]);

            setLessonsData(newLessonData);
            
        } catch (error) {
            console.error("Error fetching module info somewhere:", error);
        }
    };


    // Handle course selection
    const handleCourseSelect = (course: Module) => {
        setSelectedCourses((prevCourses) => {
          // Check if the course already exists in the array
          if (prevCourses.some((c) => c.code === course.code)) {
            return prevCourses; // Return the previous array if the course already exists
          }
          prevSelectedCoursesRef.current = prevCourses;
          return [...prevCourses, course]; // Add the new course to the array
        });
    };

    // Fetch module info from API based on selected courses
    const selectedModuleCodes = selectedCourses.map((course) => course.code).join('&moduleCode=');   
    const moduleInfoResponse = useQuery(
        ["moduleInfo", selectedModuleCodes],
        async () => {
            if (!selectedModuleCodes) {
                return [];
            }
            const response = await fetch(`/api/moduleInfo?moduleCode=${selectedModuleCodes}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
    )

    const isLoading = moduleInfoResponse.isLoading;
    const isError = moduleInfoResponse.isError;
    const newModulesData = moduleInfoResponse.data as DetailedModuleInfo[];

    // Update the modulesData state when newModulesData changes (if data has changed)
    useEffect(() => {
        if (!isLoading && !isError) {
          const hasDataChanged = JSON.stringify(newModulesData) !== JSON.stringify(prevModulesDataRef.current);
          if (hasDataChanged) {
            setModulesData(newModulesData);
            prevModulesDataRef.current = newModulesData;
          }
        }
      }, [isLoading, isError, newModulesData]);

    const handleModuleImport = (url: string) => {
        console.log(url);
        setImportUrl(url);
    };

    // Use useEffect to clear modulesData, lessonsData, and modScheduleData when selectedCourses is set to empty
    useEffect(() => {
        if (selectedCourses.length === 0) {
            setModulesData([]);
            setLessonsData({});
            setModScheduleData([]);
        }

        // Check for added/removed courses
        const prevSelectedCourses = prevSelectedCoursesRef.current;
        const addedCourses = selectedCourses.filter((course) => !prevSelectedCourses.some((c) => c.code === course.code));
        const removedCourses = prevSelectedCourses.filter((course) => !selectedCourses.some((c) => c.code === course.code));

        // Fetch info for new courses
        if (addedCourses.length > 0) {
            updateLessonsData(addedCourses);
        }

        // Remove info for removed courses
        if (removedCourses.length > 0) {
            setModScheduleData((prevData) => prevData.filter((data) => !removedCourses.some((course) => course.code === data.moduleCode)));
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCourses]);

    // Use useEffect to fetch parsed modules when importUrl changes
    useEffect(() => {
        if (importUrl) {
        (async () => {
            try {
                // Fetch the modules from the parseModules API
                const response = await fetch(`/api/parseModules?url=${importUrl}`);
                // Fetch the modules from the modules API to get the module titles
                const modsResponse = await fetch("/api/modules");
                // Fetch lesson details for the selected modules
                const lessonDetailsResponse = await fetch(`/api/lessonDetails?url=${importUrl}`);
            if (!response.ok) {
                throw new Error("Parsing URL Failed");
            } else if (!modsResponse.ok) {
                throw new Error("Fetching Modules Info Failed");
            } else if (!lessonDetailsResponse.ok) {
                throw new Error("Fetching Lesson Details Failed");
            }
            const parsedModules = await response.json(); // Parsed modules object

            const mods = await modsResponse.json(); // List of all mods

            const lessonDetails = await lessonDetailsResponse.json(); // Lesson details for the selected modules

            // Extract module codes from the parsedModules
            const moduleCodes = Object.keys(parsedModules).filter((code) => code !== "hidden");

            // Create an array of Module objects
            const newSelectedCourses: Module[] = moduleCodes.map((code) => ({
                code: code,
                title: mods.find((mod: Module) => mod.code === code)?.title || "Unknown",
            } as Module));

            // Update the prevSelectedCoursesRef to prevent the useEffect from running
            prevSelectedCoursesRef.current = newSelectedCourses

            // Update the selectedCourses state (override existing courses)
            setSelectedCourses(newSelectedCourses);

            // Update the lessonsData state
            setLessonsData(parsedModules);

            // Update the modScheduleData state
            setModScheduleData(lessonDetails);

            console.log("lesson details", lessonDetails);

            // Clear the importUrl after processing
            setImportUrl(null);
            } catch (error) {
                console.error("Error fetching parsed modules:", error);
            }
        })();
        }
    }, [importUrl]);

    useEffect(() => {
        if (!isLoading && !isError) {
          const hasDataChanged = JSON.stringify(newModulesData) !== JSON.stringify(prevModulesDataRef.current);
          if (hasDataChanged) {
            setModulesData(newModulesData);
            prevModulesDataRef.current = newModulesData;
          }
        }
      }, [isLoading, isError, newModulesData]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-beige p-5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-row justify-between">
                <NavBar/>
                <ImportModules onUrlImport={ handleModuleImport }/>
            </div>
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl sm:text-4xl font-bold">Dashboard</h1>
                <p className="text-base sm:text-lg text-center sm:text-left my-5">Welcome back, {name}.</p>
                <div className="flex flex-col sm:flex-row items-start justify-start gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button>Clear Courses</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-5 bg-white shadow-lg rounded-md">
                            <div className="grid gap-4">
                                Are you sure? This action cannot be undone.
                                <Button variant="destructive" onClick={() => setSelectedCourses([])}> Clear All Courses </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <CourseSelector onCourseSelect={ handleCourseSelect } />
                </div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1 flex-col gap-4 md:gap-8">
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                        <div className="col-span-2">
                            <Card>
                                <CardHeader>
                                    <h2 className="font-semibold leading-none tracking-tight">Selected Mods</h2> 
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                        {modulesData?.map((module, index) => (
                                            <ModuleCard key={module.moduleCode} moduleDetails={module} index={index} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <TestWorkloadCard modulesData={modulesData} />
                        <LessonsCard data={modScheduleData} />   
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 md:gap-8 py-5">
                    <div className="grid gap-4 md:grid-cols-1">
                        <Daycard modData={modScheduleData} />
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 md:gap-8 py-5">
                    <div className="grid gap-4 md:grid-cols-1">
                        <WeeklyCalendar moduleScheduleData={modScheduleData}/>
                    </div>
                </div>
            </div>
        </div>

  );
}