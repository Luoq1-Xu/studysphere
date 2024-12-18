import { DetailedModuleInfo } from "@/lib/types";
import { convertLessonType, parseFunc } from "@/lib/utils";




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
    
        console.log('Parsed Modules:', modules);

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

        // Fetch all module info in a single request
        const moduleCodes = Object.keys(modules).join('&moduleCode=');
        const moduleInfoUrl = new URL(`/api/moduleInfo?moduleCode=${moduleCodes}`, request.url).toString();
        const moduleInfoResponese = await fetch(moduleInfoUrl);
        if (!moduleInfoResponese.ok) {
            throw new Error('Failed to fetch module info');
        }
        const detailedModules = await moduleInfoResponese.json() as DetailedModuleInfo[];
        const filteredEntries = Object.entries(modules).filter(([key]) => key !== "hidden");


        // Flatmap modules and lessons to get detailed lesson data
        const finalModuleData = filteredEntries.map(([moduleCode, lessons]) => {
            const modDetails = detailedModules.find((module) => module.moduleCode === moduleCode);
            if (modDetails?.semesterData === undefined) {
                return {
                    moduleCode,
                    title: null,
                    description: null,
                    lessons: [],
                };
            }
            const semData = parseFunc(modDetails?.semesterData as unknown as string) as DetailedModuleInfo['semesterData'];
            const lessonsAndWorkloads = Object.entries(lessons).flatMap(([lessonType, lessonNumber]) => {    
                const matchingSemesterData = semData.find((semesterdata) => semesterdata.semester === parseInt(semester));
                const lessonData = matchingSemesterData?.timetable.filter(
                    (lesson) => lesson.lessonType === convertLessonType(lessonType) && lesson.classNo === lessonNumber);
                return lessonData?.map((lesson) => ({
                    lessonType: convertLessonType(lessonType),
                    lessonNumber,
                    startTime: lesson.startTime,
                    endTime: lesson.endTime,
                    venue: lesson.venue,
                    day: lesson.day,
                    size: lesson.size,
                    weeks: lesson.weeks,
                  })) || [];
            });
            return {
                moduleCode,
                title: modDetails?.title,
                description: modDetails?.description,
                lessons: lessonsAndWorkloads,
            };
        });

        return new Response(JSON.stringify(finalModuleData), { status: 200 });
    } catch (error) {
        console.error('Error expanding URL:', error);
        return new Response(JSON.stringify({ error: 'Failed to expand URL' }), { status: 500 });
    }
}