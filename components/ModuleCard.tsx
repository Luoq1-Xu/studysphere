import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Book, ClipboardCheck } from 'lucide-react'
import { DetailedModuleInfo } from "@/lib/types"


export function ModuleCard({ moduleDetails, index }: { moduleDetails: DetailedModuleInfo, index: number }) {

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

    return (
        <Card className="w-full max-w-md">
        <CardHeader>
            <div className="flex items-center justify-between">
            <Badge variant="outline" className={color}>
                {moduleDetails.moduleCode}
            </Badge>
            <Badge variant="secondary">{moduleDetails.faculty}</Badge>
            </div>
            <CardTitle>{moduleDetails.title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
                <Book className="mr-1 h-4 w-4" />
                <span>{moduleDetails.moduleCredit} credits</span>
            </div>
            <div className="flex items-center">
                <ClipboardCheck className="mr-1 h-4 w-4" />
                <span>{moduleDetails.gradingBasisDescription}</span>
            </div>
            </div>
        </CardContent>
        </Card>
    )
}

