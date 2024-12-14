import { Module } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "./ui/card"




export function CourseBadge({ mod, index }: { mod: Module, index: number}) {

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
        <Card>
            <CardHeader>
            <Badge className={color}>
                {mod.code}
            </Badge>
            </CardHeader>
            <CardContent>
                {mod.title}
            </CardContent>
        </Card>
    )
}