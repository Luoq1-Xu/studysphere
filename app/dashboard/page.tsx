"use client"
import { CourseSelector } from "@/components/CourseSelector";
import { NavBar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { DetailedModuleInfo, Module } from "@/lib/types";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { useQueries } from "react-query";
import { TestWorkloadCard } from "@/components/TestWorkLoadCard";
import { ModuleCard } from "@/components/ModuleCard";
import { ImportModules } from "@/components/ImportModules";
import { LessonsCard } from "@/components/LessonsCard";

export default function Page() {

    const name = "StudySphere";
    const [selectedCourses, setSelectedCourses] = useState<Module[]>([]);
    const [modulesData, setModulesData] = useState<DetailedModuleInfo[]>([]);
    const [importUrl, setImportUrl] = useState<string | null>(null);
    const [lessonsData, setLessonsData] = useState<Record<string, Record<string, string>>>({});
    const prevModulesDataRef = useRef<DetailedModuleInfo[]>([]);

    const moduleQueries = useQueries(
        selectedCourses.map((module) => ({
            queryKey: ["module", module.code],
            queryFn: async () => {
                const response = await fetch(`/api/moduleInfo?moduleCode=${module.code}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        }))
    );

    const isLoading = moduleQueries.some(query => query.isLoading);
    const isError = moduleQueries.some(query => query.isError);
    const newModulesData = moduleQueries.map(query => query.data);

    const handleCourseSelect = (course: Module) => {
        setSelectedCourses((prevCourses) => {
          // Check if the course already exists in the array
          if (prevCourses.some((c) => c.code === course.code)) {
            return prevCourses; // Return the previous array if the course already exists
          }
          return [...prevCourses, course]; // Add the new course to the array
        });
    };

    const handleModuleImport = (url: string) => {
        console.log(url);
        setImportUrl(url);
    };

    // Use useEffect to fetch parsed modules when importUrl changes
    useEffect(() => {
        if (importUrl) {
        (async () => {
            try {
                // Fetch the modules from the parseModules API
                const response = await fetch(`/api/parseModules?url=${importUrl}`);
                // Fetch the modules from the modules API to get the module titles
                const modsResponse = await fetch("/api/modules");
            if (!response.ok || !modsResponse.ok) {
                throw new Error("Network response was not ok");
            }
            const parsedModules = await response.json(); // Parsed modules object

            // Extract module codes from the parsedModules
            const moduleCodes = Object.keys(parsedModules).filter((code) => code !== "hidden");

            // List of all mods
            const mods = await modsResponse.json();

            // Create an array of Module objects
            const newSelectedCourses: Module[] = moduleCodes.map((code) => ({
                code: code,
                title: mods.find((mod: Module) => mod.code === code)?.title || "Unknown",
            } as Module));

            console.log(newSelectedCourses);

            // Update the selectedCourses state (override existing courses)
            setSelectedCourses(newSelectedCourses);

            // Update the lessonsData state
            setLessonsData(parsedModules);

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
                                    <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                                        {modulesData?.map((module, index) => (
                                            <ModuleCard key={module.moduleCode} moduleDetails={module} index={index} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <TestWorkloadCard modulesData={modulesData} />
                        <LessonsCard data={lessonsData} />
                    </div>
                </div>
            </div>
        </div>

  );
}