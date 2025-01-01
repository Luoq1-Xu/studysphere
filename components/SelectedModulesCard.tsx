import { ModuleInfo } from "@/lib/types";
import { ModuleSelectCard } from "./ModuleSelectCard";
import { Card, CardContent, CardHeader } from "./ui/card";


export function SelectedModulesCard({ 
    modInfoList,
    handleModCardClick,
 }: { 
    modInfoList: ModuleInfo[];
    handleModCardClick: (module: ModuleInfo, operation: string) => void;
}) {

    return (
        <Card>
            <CardHeader>
                <h2 className="font-semibold leading-none tracking-tight">Selected Mods</h2> 
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {modInfoList?.map((module, index) => (
                        <ModuleSelectCard 
                            key={module.moduleCode}  
                            modInfo={module}
                            index={index}
                            onClick={ handleModCardClick } />
                    ))}
                </div>
            </CardContent>
        </Card>
    )   
}