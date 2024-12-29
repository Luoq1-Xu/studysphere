import path from "path"
import * as fs from "fs"
import { parse } from 'csv-parse'
import { headers, rawDetailedModuleInfo, RawModuleInfo } from "@/lib/types"
import { parseFunc } from "@/lib/utils";

export async function GET( request: Request, ) {
    const url = new URL(request.url);
    const moduleCodes = url.searchParams.getAll('moduleCode');

    if (!moduleCodes) {
        return new Response(JSON.stringify({ error: 'Module code is required' }), { status: 400 });
    }

    const csvfile = path.join(process.cwd(), 'public', 'detailed_module_info.csv');
    const fileContent = fs.readFileSync(csvfile, 'utf8');

    return new Promise((resolve, reject) => {
        parse(fileContent, {
            delimiter: ',',
            columns: headers
        }, (err, records: rawDetailedModuleInfo[]) => {
            if (err) {
                console.error('Error parsing CSV file:', err);
                reject(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
            } else {
                const results = moduleCodes.map(moduleCode => {
                    const record = records.find(r => r.moduleCode == moduleCode);
                    return record ? record : { error: 'Module not found', moduleCode };
                });
                const processedResults = results.map((result) => {
                    if ('error' in result) {
                        return result;
                    }
                    const parsedSemData = parseFunc(result.semesterData) as ParsedSemData[];
                    
                    return {
                        // Process semData into an object
                        // Structure is like this:
                        // SemesterData: [
                        //     {
                        //         semester: 1,
                        //         timetable: [
                        //             {
                        //                 lessonType: "LEC",
                        //                 lessons: [
                        //                     {
                        //                         classNo: "1",
                        //                         startTime: "0830",
                        //                         endTime: "0930",
                        //                         weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        //                         venue: "LT1",
                        //                         day: "Monday",
                        //                         size: 100
                        //                     },
                        //              }
                        //         ],
                        //         covidZones: "Zone 1"
                        //     },
                        //     {
                        //         semester: 2,
                        //         etc...
                        //     }
                        // ]
                        ...result,
                        semesterData: parsedSemData.map((semData) => {

                            const grouped = semData.timetable.reduce(
                                (acc, lesson) => {
                                  const type = lesson.lessonType;
                                  if (!acc[type]) {
                                    acc[type] = [];
                                  }
                                  acc[type].push(lesson);
                                  return acc;
                                }, {} as { [key: string]: ParsedSemData["timetable"] });

                            const reorderedTimetable = Object.keys(grouped).map((type) => ({
                                lessonType: type,
                                lessons: grouped[type]
                                }));
                                
                            return ({
                                semester: semData.semester,
                                timetable: reorderedTimetable,
                                covidZones: semData.covidZones
                            });
                        }),
                    } as RawModuleInfo;
                })
                resolve(new Response(JSON.stringify(processedResults), { status: 200 }));
            }
        });
    });
}


type ParsedSemData = {
    semester: number;
    timetable: {
        classNo: string;
        startTime: string;
        endTime: string;
        weeks: number[];
        venue: string;
        day: string;
        lessonType: string;
        size: number;
        covidZones: string;
    }[];
    covidZones: string[];
}