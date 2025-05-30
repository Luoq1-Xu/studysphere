import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress";
import { ModuleInfo } from "@/lib/types";


export function WorkLoadDistribution({ modulesData }: {  modulesData: ModuleInfo[] }) {

    // Compute total workload and categories
    let totalWorkload = 0;
    const categories = [
        { name: "Lectures", hours: 0 },
        { name: "Tutorials", hours: 0 },
        { name: "Labs", hours: 0 },
        { name: "Projects/Fieldwork", hours: 0 },
        { name: "Preparation", hours: 0 },
    ];

    modulesData.forEach((moduleData: ModuleInfo) => {
            const workloads = JSON.parse(moduleData.workload);
            workloads.forEach((workload: number, index: number) => {
                categories[index].hours += workload;
            });
            const sum = workloads.reduce((total: number, num: number) => total + num, 0);
            totalWorkload += sum;
        })


    return (
        <Card className="w-full min-w-56 h-full flex flex-col">
            <CardHeader>
            <CardTitle>Weekly Workload Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Modules:</span>
                <span className="text-2xl font-bold">{modulesData.length}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Workload:</span>
                <span className="text-2xl font-bold">{totalWorkload} hours</span>
            </div>
            <div className="flex flex-col justify-evenly h-full">
                {categories.map((category) => (
                <CategoryWorkload 
                    key={category.name} 
                    category={category} 
                    totalWorkload={totalWorkload} 
                />
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
      <Progress value={percentage} className="h-5" />
    </div>
  )
}
