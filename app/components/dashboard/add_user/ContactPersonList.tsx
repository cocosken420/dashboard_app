"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit2 } from "lucide-react"
import { useCallback, useState } from "react"
import SavedContactPerson from "./savedPersonList"
import { ContactPerson } from "@/lib/types"

interface ContactPersonTemp {
  imieNazwisko: string
  stanowisko: string
  tel1: string
  tel2: string
  email: string
}

interface ContactPersonListProps {
  savedContactPersons: ContactPerson[]
  setSavedContactPersons: React.Dispatch<React.SetStateAction<ContactPerson[]>>
  showAlert: (message: string, type: "error" | "success" | "warning") => void
}

export default function ContactPersonList({
  savedContactPersons,
  setSavedContactPersons,
  showAlert
}: ContactPersonListProps) {
  const emptyContact: ContactPersonTemp = {
    imieNazwisko: "",
    stanowisko: "",
    tel1: "",
    tel2: "",
    email: "",
  }

  const [currentContactPerson, setCurrentContactPerson] = useState<ContactPersonTemp>(emptyContact)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Handle input changes
  const handleContactPersonChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const { name, value } = e.target
    setCurrentContactPerson((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  // Add or update contact
  const saveContactPerson = useCallback(() => {
    if (!currentContactPerson.imieNazwisko) {
      showAlert("Proszę wypełnić co najmniej imię i nazwisko", "warning")
      return
    }

    if (editingId) {
      // Update existing contact
      setSavedContactPersons((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...currentContactPerson } : p))
      )
      showAlert("Osoba kontaktowa została zaktualizowana", "success")
    } else {
      // Add new contact
      const newPerson: ContactPerson = { id: crypto.randomUUID(), ...currentContactPerson }
      setSavedContactPersons((prev) => [...prev, newPerson])
      showAlert("Osoba kontaktowa została dodana", "success")
    }

    // Reset form
    setCurrentContactPerson(emptyContact)
    setEditingId(null)
  }, [currentContactPerson, editingId, setSavedContactPersons, showAlert])
  const updateContactPerson = useCallback((updatedPerson: ContactPerson) => {
    setSavedContactPersons((prev) =>
      prev.map((p) => (p.id === updatedPerson.id ? updatedPerson : p))
    )
    showAlert("Osoba kontaktowa została zaktualizowana", "success")
  }, [setSavedContactPersons, showAlert])
  


  const removeContactPerson = useCallback((id: string) => {
    setSavedContactPersons((prev) => prev.filter((p) => p.id !== id))
  }, [setSavedContactPersons])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-words [overflow-wrap:anywhere]">Lista Osób Kontaktowych</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedContactPersons.map((person) => (
          <SavedContactPerson
          key={person.id}
          person={person}
          onRemove={removeContactPerson}
          onUpdate={updateContactPerson}
        />
        ))}

        <div className="space-y-4 p-4 border-2">
          <h3 className="font-semibold break-words [overflow-wrap:anywhere]">
            {editingId ? "Edytuj osobę kontaktową" : "Dodaj osobę kontaktową"}
          </h3>

          {/* Form fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">Imię i nazwisko</label>
            <Input
              name="imieNazwisko"
              value={currentContactPerson.imieNazwisko}
              onChange={handleContactPersonChange}
              placeholder="Jan Kowalski"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">Stanowisko</label>
            <Input
              name="stanowisko"
              value={currentContactPerson.stanowisko}
              onChange={handleContactPersonChange}
              placeholder="Manager"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">Telefon 1</label>
              <Input
                name="tel1"
                value={currentContactPerson.tel1}
                onChange={handleContactPersonChange}
                placeholder="+48 123 456 789"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">Telefon 2</label>
              <Input
                name="tel2"
                value={currentContactPerson.tel2}
                onChange={handleContactPersonChange}
                placeholder="+48 987 654 321"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">E-mail</label>
            <Input
              name="email"
              type="email"
              value={currentContactPerson.email}
              onChange={handleContactPersonChange}
              placeholder="jan@example.com"
            />
          </div>

          <Button onClick={saveContactPerson} className="w-full">
            {editingId ? <Edit2 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {editingId ? "Zaktualizuj osobę" : "Dodaj osobę"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
