
import { Lesson, ModuleInfo } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";


export function UpcomingLessons({ data }: { data: ModuleInfo[] }) {

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Lessons</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid sm:grid-cols-1 gap-4">
                    {data.flatMap((modData) => (
                        modData.selectedLessons.map((lesson) => (
                            <LessonCard lesson={lesson} module={modData} />
                        ))
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}


function LessonCard({ lesson, module }: { lesson: Lesson, module: ModuleInfo }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{module.moduleCode}</CardTitle>
                <CardDescription>{module.title}</CardDescription>
            </CardHeader>
            <CardContent>
                
            </CardContent>
        </Card>
    )

}