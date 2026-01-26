import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Task } from "@/lib/types"
import DeleteAlert from "./deleteAlert"

interface SavedTaskProps {
  task: Task
  onRemove: (id: string) => void
  onUpdate: (task: Task) => void
}

export default function SavedTask({
  task,
  onRemove,
  onUpdate,
}: SavedTaskProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<Task>(task)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleChange = (
    name:string,value:string
  ) => {
    setEditedTask((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const saveChanges = () => {
    if (!editedTask.zadanie.trim()) return
    onUpdate(editedTask)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setEditedTask(task)
    setIsEditing(false)
  }
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };
  const handleDeleteConfirm = () => {
    onRemove(task.id);
    setShowDeleteDialog(false);
  };
  if (isEditing) {
    return (
      <div className="space-y-2 border p-3 rounded">
        <Input
          name="zadanie"
          value={editedTask.zadanie}
          onChange={(e)=>handleChange(e.target.name,e.target.value)}
          placeholder="Nazwa zadania"
        />

        <Textarea
          name="opis"
          value={editedTask.opis}
          onChange={(e)=>handleChange(e.target.name,e.target.value)}
          placeholder="Opis"
          rows={3}
        />

        <div className="flex gap-2">
          <Button size="sm" onClick={saveChanges}>
            Zapisz
          </Button>
          <Button size="sm" variant="outline" onClick={cancelEdit}>
            Anuluj
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border p-3 rounded space-y-1">
      <DeleteAlert setShowDeleteDialog={setShowDeleteDialog} showDeleteDialog={showDeleteDialog} handleDeleteConfirm={handleDeleteConfirm} prodCategory="opcję" prodName={task.zadanie} />
      <h4 className="font-semibold break-words">{task.zadanie}</h4>
      {task.opis && (
        <p className="text-sm text-muted-foreground break-words">
          {task.opis}
        </p>
      )}

      <div className="flex gap-2 mt-2">
        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
          Edytuj
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleDeleteClick()}
        >
          Usuń
        </Button>
      </div>
    </div>
  )
}
