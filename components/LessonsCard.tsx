import { ModuleInfo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";


export function LessonsCard({ data }: { data: ModuleInfo[] }) {



    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Lessons</CardTitle>
            </CardHeader>
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
                    {data.map((modData) => (
                        <TableRow key={modData.moduleCode}>
                            <TableCell>
                                {modData.moduleCode}
                                <br/>
                                {modData.title}
                            </TableCell>
                            <TableCell>
                            {modData.selectedLessons.map((lesson, index) => (
                                <div key={lesson.classNo + index}>
                                    {lesson.lessonType}: {lesson.classNo}
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
