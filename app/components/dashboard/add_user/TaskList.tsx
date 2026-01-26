"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SavedTask from "./savedTask"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useCallback, useState } from "react"
import { Task } from "@/lib/types"
 
interface CurrentTask {
  data: string
  zadanie: string
  opis: string
}

interface TaskListProps {
  currentTask: CurrentTask
  setCurrentTask: React.Dispatch<React.SetStateAction<CurrentTask>>
  setSavedTasks: React.Dispatch<React.SetStateAction<Task[]>>
  savedTasks: Task[]
  showAlert: (message: string, type: "error" | "success" | "warning") => void
}

export default function TaskList({
  savedTasks,
  currentTask,
  setCurrentTask,
  setSavedTasks,
  showAlert,
}: TaskListProps) {
   const handleTaskChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(
    (e) => {
      const { name, value } = e.target
      setCurrentTask((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    [setCurrentTask]
  )

  const addTask = useCallback(() => {
    if (!currentTask.zadanie) {
      showAlert("Proszę wypełnić nazwę zadania", "warning")
      return
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      ...currentTask,
    }

    setSavedTasks((prev) => [...prev, newTask])
    setCurrentTask({
      data: "",
      zadanie: "",
      opis: "",
    })
    showAlert("Zadanie zostało dodane", "success")
  }, [currentTask, setSavedTasks, setCurrentTask, showAlert])

  const removeTask = useCallback(
    (id: string) => {
      setSavedTasks((prev) => prev.filter((t) => t.id !== id))
      showAlert("Zadanie usunięte", "success")
    },
    [setSavedTasks, showAlert]
  )

  const updateTask = useCallback(
    (updatedTask: Task) => {
      setSavedTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      )
      showAlert("Zadanie zaktualizowane", "success")
    },
    [setSavedTasks, showAlert]
  )

  return (
    <Card>

      <CardHeader>
        <CardTitle className="break-words [overflow-wrap:anywhere]">
          Lista Zadań
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {savedTasks.map((task) => (
          <SavedTask
            key={task.id}
            task={task}
            onRemove={removeTask}
            onUpdate={updateTask}
          />
        ))}

        <div className="space-y-4 p-4 border-2 rounded">
          <h3 className="font-semibold break-words [overflow-wrap:anywhere]">
            Dodaj zadanie
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Zadanie</label>
            <Input
              name="zadanie"
              value={currentTask.zadanie}
              onChange={handleTaskChange}
              placeholder="Nazwa zadania"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Opis</label>
            <Textarea
              name="opis"
              value={currentTask.opis}
              onChange={handleTaskChange}
              placeholder="Opis zadania..."
              rows={3}
              className="resize-none"
            />
          </div>

          <Button onClick={addTask} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Dodaj zadanie
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
