"use client"

import { useEffect, useRef, useState } from "react";
import {EventEntry, Module, ModuleInfo, RawModuleInfo, Lesson } from "@/lib/types";
import { WorkLoadDistribution } from "@/components/WorkloadDistribution";
import { ImportModules } from "@/components/ImportModules";
import { LessonsCard } from "@/components/LessonsCard";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { CreateEvent } from "@/components/CreateEvent";
import { ClearCourses } from "@/components/ClearCourses";
import { ModuleSelector } from "@/components/ModuleSelector";
import { DayChart } from "@/components/DayChart";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { SelectedModulesCard } from "@/components/SelectedModulesCard";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const CHOSENSEMESTER = 0; // 0-indexed - Sem 1 is 0 and Sem 2 is 1

type SemesterData = {
    selectedCourses: Module[];
    events: EventEntry[];
    modInfoList: ModuleInfo[];
};

const initialSemesterData: { [key: number]: SemesterData } = {
    0: {
      selectedCourses: [],
      events: [],
      modInfoList: [],
    },
    1: {
      selectedCourses: [],
      events: [],
      modInfoList: [],
    },
};

export default function Page() {

    // selectedCourses -> Array of selected courses
    // modInfoList -> Array of module details (detailed module data) with each
    //                module containing an array of selected lessons
    // importUrl -> URL to import modules

    const name = "StudySphere";

    const [semesterData, setSemesterData] = useState<{ [key: number]: SemesterData }>(initialSemesterData);
    const [chosenSemester, setChosenSemester] = useState<number>(0); // 0 or 1
    const prevSemesterRef = useRef<number>(chosenSemester);
    const [importUrl, setImportUrl] = useState<string | null>(null);
    const prevSelectedCoursesRef = useRef<Module[]>([]);

    const selectedCourses = semesterData[chosenSemester].selectedCourses as Module[];
    const events = semesterData[chosenSemester].events as EventEntry[];
    const modInfoList = semesterData[chosenSemester].modInfoList as ModuleInfo[];

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

            // Merge newly processed modules into existing modInfoList for current semester
            setSemesterData((prev) => {
                const next = { ...prev };
                next[chosenSemester] = {
                ...next[chosenSemester],
                modInfoList: [...next[chosenSemester].modInfoList, ...processedData],
                };
                return next;
            });

        } catch (error) {
            console.error("Error fetching module info somewhere:", error);
        }
    };

    // Handle course selection
    function handleCourseSelect(course: Module) {
        setSemesterData((prev) => {
          const next = { ...prev };
          const courses = next[chosenSemester].selectedCourses;
          // Only add if the course is not already in the list
          if (!courses.some((c) => c.code === course.code)) {
            next[chosenSemester] = {
              ...next[chosenSemester],
              selectedCourses: [...courses, course],
            };
          }
          return next;
        });
      }

    // Handle event creation
    function handleEventAdd(event: EventEntry) {
        setSemesterData((prev) => {
          const next = { ...prev };
          next[chosenSemester] = {
            ...next[chosenSemester],
            events: [...next[chosenSemester].events, event],
          };
          return next;
        });
      }

    // Handle event operations (add, update, remove)
    const handleEventOperation = (
        operation: string,
        event: EventEntry,
        modifiedEvent?: EventEntry
    ) => {
        setSemesterData((prev) => {
        const next = { ...prev };
        let oldEvents = next[chosenSemester].events;

        if (operation === "add") {
            oldEvents = [...oldEvents, event];
        } else if (operation === "update" && modifiedEvent) {
            oldEvents = oldEvents.map((e) => (e === event ? modifiedEvent : e));
        } else if (operation === "remove") {
            oldEvents = oldEvents.filter((e) => e !== event);
        }

        next[chosenSemester] = {
            ...next[chosenSemester],
            events: oldEvents,
        };
        return next;
        });
    };

    // Handle modules import from NUSMods
    const handleModuleImport = (url: string) => {
        setImportUrl(url);
    };

    // Use useEffect to update modInfoList when selectedCourses changes
    useEffect(() => {

        // If user is just changing the semester, do nothing
        if (prevSemesterRef.current !== chosenSemester) {
            prevSemesterRef.current = chosenSemester;
            prevSelectedCoursesRef.current = selectedCourses;
            // Do nothing on semester change
            return;
        }


        if (selectedCourses.length === 0) {
            // If no courses selected, clear modInfoList for this semester
            setSemesterData((prev) => {
              const next = { ...prev };
              next[chosenSemester].modInfoList = [];
              return next;
            });
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
            setSemesterData((prev) => {
            const next = { ...prev };
            next[chosenSemester].modInfoList = next[chosenSemester].modInfoList.filter(
                (data) => !removedCourses.some((course) => course.code === data.moduleCode)
            );
            return next;
            });
        }

        // Update the prevSelectedCoursesRef
        prevSelectedCoursesRef.current = selectedCourses;

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
                const parsedModules: ModuleInfo[] = await response.json();
                const newSelectedCourses = parsedModules.map((mod) => ({
                    code: mod.moduleCode,
                    title: mod.title,
                    semesters: mod.semesterData.map((sem) => sem.semester).toString(), // Ensure semesters property is included
                }))

                prevSelectedCoursesRef.current = newSelectedCourses; // To prevent useEffect from duplicating and trying to add modInfo again

                // Override the existing modInfoList for the current semester
                setSemesterData((prev) => {
                    const next = { ...prev };
                    next[chosenSemester] = {
                        ...next[chosenSemester],
                        modInfoList: parsedModules,
                        selectedCourses: newSelectedCourses as Module[], // Update selectedCourses as well
                    };
                    return next;
                });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [importUrl]);

    // Update Events when modInfoList changes, regenerating the events
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
                } as EventEntry;
            });
        });

        // Filter out the user events and recombine with the new events
        setSemesterData((prev) => {
            const next = { ...prev };
            const userEvents = next[chosenSemester].events.filter((ev) => ev.type === "user");
            next[chosenSemester].events = [...userEvents, ...newEvents];
            return next;
          });


    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modInfoList]);

    // Card click handler (remove or updateLesson)
    const handleModCardClick = (module: ModuleInfo, operation: string, newModuleInfo?: ModuleInfo) => {
        setSemesterData((prev) => {
            const next = { ...prev };

            if (operation === "remove") {
                // Remove from modInfoList
                next[chosenSemester].modInfoList = next[chosenSemester].modInfoList.filter(
                (data) => data.moduleCode !== module.moduleCode
                );
                // Remove from selectedCourses
                next[chosenSemester].selectedCourses = next[chosenSemester].selectedCourses.filter(
                (course) => course.code !== module.moduleCode
                );
            } else if (operation === "updateLesson" && newModuleInfo) {
                // Replace old module data with new
                next[chosenSemester].modInfoList = next[chosenSemester].modInfoList.map((data) =>
                data.moduleCode === module.moduleCode ? newModuleInfo : data
                );
            }

            return next;
        });
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-beige p-5">
            <div className="container mx-auto sm:px-6 lg:px-8 gap-4 grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <div className="col-span-1">
                    <CreateEvent onEventAdd={handleEventAdd}/>
                </div>
                <div className="col-span-1">
                    <ImportModules onUrlImport={handleModuleImport}/>
                </div>
                <div className="col-span-1">
                    <Select
                        onValueChange={(value: string) => setChosenSemester(parseInt(value, 10))}
                        value={chosenSemester.toString()}
                    >
                        <SelectTrigger className="bg-white w-full">
                            <SelectValue placeholder="Select Semester"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="0">Semester 1</SelectItem>
                                <SelectItem value="1">Semester 2</SelectItem>
                            </SelectGroup>
                        </SelectContent>        
                    </Select>
                </div>                
            </div>
            <div className="container mx-auto sm:px-6 p-6">
                <h1 className="text-2xl sm:text-4xl font-bold">Dashboard</h1>
                <p className="text-base sm:text-lg sm:text-left">Welcome back, {name}.</p>
            </div>
            <div className="container mx-auto sm:px-6">
                <div className="flex flex-1 flex-col gap-4 md:gap-8 py-3">
                    <div className="grid gap-4 md:grid-cols-1">
                        <WeeklyCalendar events={events}/>
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 md:gap-8">
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                        <div className="col-span-full">
                            <div className="flex flex-col sm:flex-row items-start justify-start gap-4">
                            <ClearCourses
                                setSelectedCourses={() =>
                                    setSemesterData((prev) => {
                                    // Clears out the currently chosen semester’s courses
                                    const next = { ...prev };
                                    next[chosenSemester].selectedCourses = [];
                                    next[chosenSemester].modInfoList = [];
                                    next[chosenSemester].events = next[chosenSemester].events.filter(
                                        (ev) => ev.type === "user"
                                    );
                                    return next;
                                    })
                                }
                                />
                                <ModuleSelector onCourseSelect={handleCourseSelect} />
                            </div>
                        </div>
                        <div className="col-span-full">
                            <SelectedModulesCard modInfoList={ modInfoList } handleModCardClick={handleModCardClick} />
                        </div>
                        <UpcomingEvents events={events} handleEventOperation={handleEventOperation}/>
                        <LessonsCard data={modInfoList} />
                        <WorkLoadDistribution modulesData={modInfoList} />
                        <DayChart modData={modInfoList} />   
                    </div>
                </div>
            </div>
        </div>
  );
}
