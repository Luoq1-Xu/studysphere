import { ModuleInfo } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Book, ClipboardCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";




export function ModuleSelectCard({ 
    modInfo,
    index,
    onClick 
}: 
{
    modInfo: ModuleInfo,
    index: number,
    onClick: () => void 
}) {

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

    const color = colors[index % colors.length]

    const handleClick = () => {
        onClick()
    }
    
    return (
        <Dialog>
            <DialogTrigger asChild>
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
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{modInfo.title}</DialogTitle>
                    <DialogDescription>{modInfo.moduleCode}</DialogDescription>
                </DialogHeader>
                <p className="leading-7 [&:not(:first-child)]:mt-6">
                    {modInfo.description}
                </p>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modInfo.selectedLessons.map((lesson, index) => (
                        <Button key={index} variant="outline" size="sm">
                            {lesson.lessonType} {lesson.classNo}
                        </Button>
                    ))}
                </div>
                <Button onClick={handleClick}>Add to Plan</Button>
            </DialogContent>
        </Dialog>
    )
}