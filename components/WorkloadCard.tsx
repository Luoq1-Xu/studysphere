import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailedModuleInfo, Module } from "@/lib/types";
import { useQueries } from "react-query";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "./ui/skeleton";

export function WorkloadCard({ data }: { data: Module[] }) {

    const moduleQueries = useQueries(
        data.map((module) => ({
            queryKey: ["module", module.code],
            queryFn: async () => {
                const response = await fetch(`/api/moduleInfo?moduleCode=${module.code}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        }))
    )

    const isLoading = moduleQueries.some(query => query.isLoading);
    const isError = moduleQueries.some(query => query.isError);
    const modulesData = moduleQueries.map(query => query.data);

    if (isLoading) {
        return (
            <Card>
            <CardHeader>
                <CardTitle>Total Workload</CardTitle>
            </CardHeader>
            <CardContent>
                <h2 className="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                    <Skeleton className="h-10 w-20 rounded-xl" />
                </h2>
            </CardContent>
        </Card>
        )
    }

    if (isError) {
        return (
            <Card>
                <CardContent>
                    <p>An Error Occured...</p>
                </CardContent>
            </Card>
        )
    }

    let totalWorkload = 0;
    const Categories = [
        { name: "Lectures", hours: 0 },
        { name: "Tutorials", hours: 0 },
        { name: "Labs", hours: 0 },
        { name: "Projects/Fieldwork", hours: 0 },
        { name: "Preparation", hours: 0 },
    ]

    
    modulesData.forEach((moduleData: DetailedModuleInfo) => {
        const workloads = JSON.parse(moduleData.workload);
        workloads.forEach((workload: number, index: number) => {
            Categories[index].hours += workload;
        });
        const sum = workloads.reduce((total: number, num: number) => total + num, 0);
        totalWorkload += sum;
    })

    return (
        <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle>User Workload Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
            <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Modules:</span>
            <span className="text-2xl font-bold">{data.length}</span>
            </div>
            <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Workload:</span>
            <span className="text-2xl font-bold">{totalWorkload} hours</span>
            </div>
            <div className="space-y-2">
            {Categories.map((category) => (
                <CategoryWorkload key={category.name} category={category} totalWorkload={totalWorkload} />
            ))}
            </div>
        </CardContent>
        </Card>
    )
}

function CategoryWorkload({ category, totalWorkload }: {
    category: { name: string; hours: number }
    totalWorkload: number
}) {
  const percentage = Math.round((category.hours / totalWorkload) * 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{category.name}</span>
        <span>{category.hours} hours ({percentage}%)</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}
