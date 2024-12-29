"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { CustomEvent, Module, ModuleInfo, RawModuleInfo, Lesson } from "@/lib/types";
import { WorkLoadDistribution } from "@/components/WorkloadDistribution";
import { ImportModules } from "@/components/ImportModules";
import { LessonsCard } from "@/components/LessonsCard";
import { Daycard } from "@/components/Daycard";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { CreateEvent } from "@/components/CreateEvent";
import { ClearCourses } from "@/components/ClearCourses";
import { ModuleSelector } from "@/components/ModuleSelector";
import { ModuleSelectCard } from "@/components/ModuleSelectCard";

export default function Page() {

    // selectedCourses -> Array of selected courses
    // modInfoList -> Array of module details (detailed module data) with each
    //                module containing an array of selected lessons
    // importUrl -> URL to import modules

    const name = "StudySphere";
    const CHOSENSEMESTER = 0; // 0-indexed - Sem 1 is 0 and Sem 2 is 1
    const [selectedCourses, setSelectedCourses] = useState<Module[]>([]);
    const [importUrl, setImportUrl] = useState<string | null>(null);
    const [events, setEvents] = useState<CustomEvent[]>([]);
    const [modInfoList, setModInfoList] = useState<ModuleInfo[]>([]);
    const prevSelectedCoursesRef = useRef<Module[]>([]);

    // Fetch module info from the API
    const fetchModuleInfo = async (moduleCode: string): Promise<RawModuleInfo> => {
        const response = await fetch(`/api/moduleInfo?moduleCode=${moduleCode}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    };

    // Update ModuleInfoList
    const updateModuleInfoList = async (addedCourses: Module[]) => {
        try {
            const newModulesData: RawModuleInfo[] = await Promise.all(
                addedCourses.map((course) => fetchModuleInfo(course.code))
            );
            const flattenedModulesData = newModulesData.flat();
            const processedData = flattenedModulesData.map((module: RawModuleInfo) => {
                const semData = module.semesterData;
                const chosenSemester = semData[CHOSENSEMESTER];
                // Default select the first classNo of each lesson type
                const selectedLessonsNums = chosenSemester.timetable.map((lessonData: { lessonType: string, lessons: Lesson[] }) => {
                    return {
                        lessonType: lessonData.lessonType,
                        classNo: lessonData.lessons[0].classNo
                    }
                });
                // Get the selected lessons based on the selectedLessonsNums
                const selectedLessons = selectedLessonsNums.flatMap((lesson) => {
                    return (
                        chosenSemester.timetable.find((lessonData: { lessonType: string, lessons: Lesson[] }) => lessonData.lessonType === lesson.lessonType)!
                        .lessons
                        .filter((lessonData: Lesson) => lessonData.classNo === lesson.classNo)
                    );
                });

                return {
                    ...module,
                    selectedLessons: selectedLessons,
                }
            }) as ModuleInfo[];

            console.log("PROCESSED DATA");
            console.log(processedData);

            setModInfoList((prevData) => [...prevData, ...processedData]);

            console.log("CHANGED")
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

    // Handle event creation
    const handleEventAdd = (event: CustomEvent) => {
        setEvents((prevEvents) => [...prevEvents, event]);
        console.log("Event added:", event);
        console.log("Events:", events);
    };

    // Handle modules import from NUSMods
    const handleModuleImport = (url: string) => {
        console.log(url);
        setImportUrl(url);
    };

    // Use useEffect to update modInfoList when selectedCourses changes
    useEffect(() => {
        if (selectedCourses.length === 0) {
            setModInfoList([]);
        }

        // Check for added/removed courses
        const prevSelectedCourses = prevSelectedCoursesRef.current;
        const addedCourses = selectedCourses.filter((course) => !prevSelectedCourses.some((c) => c.code === course.code));
        const removedCourses = prevSelectedCourses.filter((course) => !selectedCourses.some((c) => c.code === course.code));

        // Fetch info for new courses
        if (addedCourses.length > 0) {
            updateModuleInfoList(addedCourses);
        }

        // Remove info for removed courses
        if (removedCourses.length > 0) {
            setModInfoList((prevData) => prevData.filter((data) => !removedCourses.some((course) => course.code === data.moduleCode)));
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCourses]);

    // Use useEffect to fetch parsed modules when importUrl changes
    useEffect(() => {
        if (importUrl) {
        (async () => {

            try {
                // Fetch ModuleInfo from urlToModInfo API
                const response = await fetch(`/api/urlToModInfo?url=${importUrl}`);
                if (!response.ok) {
                    throw new Error("Parsing URL Failed");
                }
                const parsedModules = await response.json();

                // Override the existing modInfoList
                setModInfoList(parsedModules);

                // Clear the importUrl after processing
                setImportUrl(null);
            } catch (error) {
                console.error("Error fetching modules using url:", error);
            }

            {/* }
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

            // Clear the importUrl after processing
            setImportUrl(null);
            } catch (error) {
                console.error("Error fetching parsed modules:", error);
            }

            */}
        })();
        }
    }, [importUrl]);

    // Update Events when modInfoList changes
    useEffect(() => {
        const COLOURS = ['coral', 'yellow', 'pink', 'green', 'blue', 'purple', 'teal', 'gray', 'rose']

        let modIndex = 0;
        // flatten the modScheduleData to get the lesson details
        const newEvents = modInfoList.flatMap((module) => {
            modIndex++;
            return module.selectedLessons.map((lesson) => {
                return {
                    eventName: `${module.moduleCode}`,
                    eventDescription: `${lesson.lessonType} ${lesson.classNo}`,
                    eventLocation: lesson.venue,
                    isRecurring: true,
                    startDateAndTime: new Date(),
                    endDateAndTime: new Date(),
                    dayOfWeek: lesson.day,
                    recurringStartTime: {
                        hour: lesson.startTime.slice(0, 2),
                        minute: lesson.startTime.slice(2),
                    },
                    recurringEndTime: {
                        hour: lesson.endTime.slice(0, 2),
                        minute: lesson.endTime.slice(2),
                    },
                    weeks: lesson.weeks,
                    type: 'lesson',
                    color: COLOURS[modIndex % COLOURS.length],
                } as CustomEvent;
            });
        });

        console.log(newEvents);
        
        setEvents((prevEvents) => {
            // 1) Filter out only user-created events (assuming user-created events have a type property set to 'user')
            const userEvents = prevEvents.filter((e) => e.type === 'user');
        
            // 2) Combine user events with newly generated module-based events
            return [...userEvents, ...newEvents];
          });


    }, [modInfoList]);

    const handleModCardClick = () => {
        console.log("LMFAO");
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-beige p-5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-row justify-start gap-4 sm:grid-cols-1">
                <CreateEvent onEventAdd={ handleEventAdd }/>
                <ImportModules onUrlImport={ handleModuleImport }/>
            </div>
            <div className="container mx-auto px-4 py-3 sm:p-6 lg:p-8">
                <h1 className="text-2xl sm:text-4xl font-bold">Dashboard</h1>
                <p className="text-base sm:text-lg text-center sm:text-left my-5">Welcome back, {name}.</p>
                <div className="flex flex-col sm:flex-row items-start justify-start gap-4">
                    <ClearCourses setSelectedCourses={ setSelectedCourses } />
                    <ModuleSelector onCourseSelect={ handleCourseSelect } />
                </div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1 flex-col gap-4 md:gap-8 py-5">
                    <div className="grid gap-4 md:grid-cols-1">
                        <WeeklyCalendar events={events}/>
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 md:gap-8">
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                        <div className="col-span-full">
                            <Card>
                                <CardHeader>
                                    <h2 className="font-semibold leading-none tracking-tight">Selected Mods</h2> 
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                        {modInfoList?.map((module, index) => (
                                            <ModuleSelectCard 
                                                key={module.moduleCode}  
                                                modInfo={module}
                                                index={index}
                                                onClick={handleModCardClick} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <WorkLoadDistribution modulesData={modInfoList} />
                        <LessonsCard data={modInfoList} />   
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 md:gap-8 py-5">
                    <div className="grid gap-4 md:grid-cols-1">
                        <Daycard modData={modInfoList} />
                    </div>
                </div>
            </div>
        </div>

  );
}
