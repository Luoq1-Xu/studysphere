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
        
        // Extract the semester value using a regular expression
        const semesterMatch = fullUrl.match(/timetable\/sem-(\d+)\//);
        const semester = semesterMatch ? semesterMatch[1] : null;

        console.log('Semester:', semester);


        const searchParams = new URLSearchParams(new URL(fullUrl).search);
        const modules: Record<string, Record<string, string>> = {};
        searchParams.forEach((value, key) => {
            console.log('Key:', key, 'Value:', value);
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

        const moduleDetails = Object.keys(modules).map(async (moduleCode) => {
            const moduleInfoUrl = new URL(`/api/moduleInfo?moduleCode=${moduleCode}`, request.url).toString();
            const response = await fetch(moduleInfoUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });

        const detailedModules = await Promise.all(moduleDetails) as DetailedModuleInfo[];



        const finalModuleData = Object.entries(modules).map(([moduleCode, lessons]) => {
            const modDetails = detailedModules.find((module) => module.moduleCode === moduleCode);
            const lessonsAndWorkloads = Object.entries(lessons).flatMap(([lessonType, lessonNumber]) => {
                const semData = parseFunc(modDetails?.semesterData as unknown as string) as DetailedModuleInfo['semesterData'];
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
                lessons: lessonsAndWorkloads,
            };
        });

        return new Response(JSON.stringify(finalModuleData), { status: 200 });
    } catch (error) {
        console.error('Error expanding URL:', error);
        return new Response(JSON.stringify({ error: 'Failed to expand URL' }), { status: 500 });
    }
}