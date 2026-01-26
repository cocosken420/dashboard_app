import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
interface props{
    prodName:string
    prodCategory:string
    showDeleteDialog: boolean
    setShowDeleteDialog:(e:boolean)=>void
    handleDeleteConfirm:()=>void
}
export default function DeleteAlert({prodName,
    prodCategory,
    showDeleteDialog,
    setShowDeleteDialog,
    handleDeleteConfirm}:props){

    return <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Potwierdź usunięcie
        </AlertDialogTitle>
        <AlertDialogDescription>
          Czy na pewno chcesz usunąć {prodCategory}{" "}
          <span className="font-semibold text-foreground">{prodName}</span>? Ta operacja jest
          nieodwracalna.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Anuluj</AlertDialogCancel>
        <AlertDialogAction
          onClick={handleDeleteConfirm}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Usuń
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
}