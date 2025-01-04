import { Lesson, ModuleInfo, RawModuleInfo } from "@/lib/types";

const LESSONMAPPINGS: { [key: string]: string } = {
    LEC: "Lecture",
    TUT: "Tutorial",
    SEM: "Seminar-Style Module Class",
    LAB: "Laboratory",
    REC: "Recitation",
  };



export async function GET(request: Request) {
    const url = new URL(request.url);
    const shortUrl = url.searchParams.get('url');

    if (!shortUrl) {
        return new Response(JSON.stringify({ error: 'Short URL is required' }), { status: 400 });
    }

    try {
        const apiUrl = new URL(`/api/expandUrl?shortUrl=${encodeURIComponent(shortUrl)}`, request.url).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            redirect: 'follow'
        });

        const fullUrl = await response.json();
        
        // Extract the semester value (numerical value) using a regular expression
        const semesterMatch = fullUrl.match(/timetable\/sem-(\d+)\//);
        const semester = semesterMatch ? semesterMatch[1] : null;

        const searchParams = new URLSearchParams(new URL(fullUrl).search);
        const modules: Record<string, Record<string, string>> = {};
        searchParams.forEach((value, key) => {
            const moduleCode = key;
            if (!modules[moduleCode]) {
                modules[moduleCode] = {};
            }
            value.split(',').forEach((lesson) => {
                const [lessonType, lessonNumber] = lesson.split(':');
                modules[moduleCode][lessonType] = lessonNumber;
            });
        });
    
        // Check if "hidden" key exists in the modules object
        if (modules.hidden) {
            // Iterate over each key in modules["hidden"]
            Object.keys(modules.hidden).forEach((hiddenKey) => {
                // Remove the corresponding key from the modules object if it exists
                if (modules[hiddenKey]) {
                    delete modules[hiddenKey];
                }
            });
        }

        console.log('Parsed Modules:', modules);

        // Fetch all module info in a single request
        const moduleCodes = Object.keys(modules).join('&moduleCode=');
        const moduleInfoUrl = new URL(`/api/moduleInfo?moduleCode=${moduleCodes}`, request.url).toString();
        const moduleInfoResponese = await fetch(moduleInfoUrl);
        if (!moduleInfoResponese.ok) {
            throw new Error('Failed to fetch module info');
        }
        const detailedModules = await moduleInfoResponese.json() as RawModuleInfo[];
        const filteredEntries = Object.entries(modules).filter(([key]) => key !== "hidden");


        // Flatmap modules and lessons to get detailed lesson data
        const finalModuleData = filteredEntries.map(([moduleCode, lessons]) => {
            const modDetails = detailedModules.find((module) => module.moduleCode === moduleCode)!;
            const selectedLessons = Object.entries(lessons).flatMap(([lessonType, lessonNumber]) => {
                // Expanded lesson type
                const fullLessonType = LESSONMAPPINGS[lessonType];

                // Check if lesson type exists
                if (fullLessonType === undefined) {
                    console.log('Lesson type not found:', lessonType);
                    return [];
                }

                // 0-indexed semester
                const lessonTypeDetails = modDetails
                                            .semesterData
                                            .find((semesterData) => semesterData.semester === parseInt(semester, 10))!
                                            .timetable.find((lesson) => lesson.lessonType === fullLessonType);
                if (!lessonTypeDetails) {
                    console.log('Lesson type details not found for lesson type:', lessonType);
                    console.log(modDetails.moduleCode, fullLessonType, lessonNumber);
                    console.log(modDetails.title);
                    throw new Error(`Lesson type details not found for lesson type: ${lessonType}`);
                }
        
                const lessonDetails = lessonTypeDetails.lessons.filter((lesson) => lesson.classNo === lessonNumber);
                if (!lessonDetails) {
                    console.log('Lesson details not found for class number:', lessonNumber);
                    console.log(modDetails.moduleCode, fullLessonType, lessonNumber);
                    console.log(modDetails.title);
                    throw new Error(`Lesson details not found for class number: ${lessonNumber}`);
                }
        
                return lessonDetails as Lesson[];
            });

            return {
                ...modDetails,
                selectedLessons: selectedLessons
            } as ModuleInfo;
            
        });

        return new Response(JSON.stringify(finalModuleData), { status: 200 });
    } catch (error) {
        console.error('Error expanding URL:', error);
        return new Response(JSON.stringify({ error: 'Failed to expand URL' }), { status: 500 });
    }
}