import { ModuleSchedule } from "@/lib/types";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";


export function LessonsCard({ data }: { data: ModuleSchedule[] }) {

    return (
        <Card className="w-full">
            <CardHeader>Lessons</CardHeader>
            <CardContent>
                <Table>
                    <TableCaption>Modules and Classes</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Module</TableHead>
                            <TableHead>Class and Slot</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {data.map((modScheduleData) => (
                        <TableRow key={modScheduleData.moduleCode}>
                            <TableCell>
                                {modScheduleData.moduleCode}
                                <br/>
                                {modScheduleData.moduleTitle}
                            </TableCell>
                            <TableCell>
                            {modScheduleData.lessons.map((lesson) => (
                                <div key={modScheduleData.moduleCode + lesson.lessonType + lesson.day + lesson.startTime}>
                                {lesson.lessonType}: {lesson.lessonNumber}
                                </div>
                            ))}
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
