import { ModuleInfo } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Book, ClipboardCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";


export function PopModuleSelectCard({ 
    modInfo,
    index,
    onClick 
}: 
{
    modInfo: ModuleInfo,
    index: number,
    onClick: (modInfo: ModuleInfo, operation: string, newModuleInfo?: ModuleInfo) => void 
}) {

    const SEMESTER = 2; // Change this to the current semester

    const colors = [
        "bg-red-500",
        "bg-yellow-500",
        "bg-green-500",
        "bg-blue-500",
        "bg-indigo-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-teal-500",
    ]

    const color = colors[index % colors.length];

    // For the remove button
    const handleClick = (operation: string) => {
        onClick(modInfo, operation);
    }

    // 1) Create a handler to replace the original lesson with the new selection.
    const handleLessonChange = (oldLessonType: string, newClassNo: string) => {
        // Find all newly selected lessons for the chosen classNo
        const newLessonGroup =
          modInfo.semesterData
            .find((data) => data.semester === SEMESTER)
            ?.timetable
            .find((data) => data.lessonType === oldLessonType)
            ?.lessons.filter((lesson) => lesson.classNo === newClassNo) ?? [];
      
        // If no new lessons found, do nothing
        if (newLessonGroup.length === 0) return;
      
        // Remove all old lessons of the same lessonType
        const filteredOldLessons = modInfo.selectedLessons.filter(
          (l) => l.lessonType !== oldLessonType
        );
      
        // Append the new lesson group
        const updatedSelectedLessons = [...filteredOldLessons, ...newLessonGroup];
      
        // Build a new ModuleInfo object
        const updatedModuleInfo = {
          ...modInfo,
          selectedLessons: updatedSelectedLessons,
        };
      
        // Call onClick with the original modInfo, operation, and new ModuleInfo
        onClick(modInfo, "updateLesson", updatedModuleInfo);
      };

    // Get unique lesson types:
    const uniqueLessonTypes = Array.from(
        new Set(modInfo.selectedLessons.map((lesson) => lesson.lessonType))
    ).sort((a, b) => a.localeCompare(b));
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Card className="w-full max-w-md bg-white shadow-md rounded-lg overflow-hidden transition-all ease-in-out duration-300 hover:shadow-xl">
                    <a rel="noopener noreferrer">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                            <Badge variant="outline" className={color}>
                                {modInfo.moduleCode}
                            </Badge>
                            <Badge variant="secondary" className="truncate">{modInfo.faculty}</Badge>
                            </div>
                            <CardTitle>{modInfo.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                                <Book className="mr-1 h-4 w-4" />
                                <span>{modInfo.moduleCredit} credits</span>
                            </div>
                            <div className="flex items-center">
                                <ClipboardCheck className="mr-1 h-4 w-4" />
                                <span>{modInfo.gradingBasisDescription}</span>
                            </div>
                            </div>
                        </CardContent>
                    </a>
                </Card>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col h-full w-full max-w-md">
                <div className="flex-1">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{modInfo.title}</h4>
                        <p className="text-sm text-muted-foreground">
                            {modInfo.moduleCode}
                        </p>
                    </div>
                    <p className="leading-7 [&:not(:first-child)]:mt-3">
                        {modInfo.description}
                    </p>
                    <div className="grid sm:grid-cols-1 gap-4 pt-3">
                        {/* One Select for each unique lessonType */}
                        {uniqueLessonTypes.map((lessonType) => {
                        // Grab the first selected lesson with this type for initial placeholder
                        const firstSelected = modInfo.selectedLessons.find(
                            (l) => l.lessonType === lessonType
                        );

                        const availableLessons = modInfo.semesterData
                                                .find((data) => data.semester === SEMESTER)
                                                ?.timetable.find((data) => data.lessonType === lessonType)
                                                ?.lessons.sort((a, b) => Number(a.classNo) - Number(b.classNo)) ?? [];

                        return (
                            <Select
                            key={lessonType}
                            onValueChange={(newClassNo) =>
                                handleLessonChange(lessonType, newClassNo)
                            }
                            >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={`${lessonType} ${firstSelected?.classNo ?? ""}`}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                {availableLessons.map((entry, idx) => (
                                    <SelectItem key={idx} value={entry.classNo}>
                                        {entry.lessonType} {entry.classNo}<br/>
                                        {entry.day}   {entry.startTime} - {entry.endTime}
                                    </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                            </Select>
                        );
                        })}
                    </div>
                </div>     
                <Button className="w-full mt-10" variant="destructive" onClick={() => handleClick("remove")}>Remove Mod</Button>        
            </PopoverContent>           
        </Popover>
    )
}