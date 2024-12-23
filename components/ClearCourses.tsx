import { Button } from "@/components/ui/button";
import { Module } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";


export function ClearCourses({ setSelectedCourses }: { setSelectedCourses: (courses: Module[]) => void }) {

    return(
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" >Clear All Modules</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will clear all of your currently selected modules.
                    This action cannot be undone.
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setSelectedCourses([])}>
                        Clear Courses
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}