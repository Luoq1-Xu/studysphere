import { Card, CardContent, CardHeader } from "./ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";


type Classes = {
    [classType: string]: string;
}


type Data = {
    [module: string]: Classes;
}

export function LessonsCard({ data }: { data: Data }) {

    return (
        <Card>
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
                    {Object.entries(data).map(([module, classes]) => (
                        <TableRow key={module}>
                            <TableCell>{module}</TableCell>
                            <TableCell>
                            {Object.entries(classes).map(([classType, slot]) => (
                                <div key={classType}>
                                {classType}: {slot}
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
