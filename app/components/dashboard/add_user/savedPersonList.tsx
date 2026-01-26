import { Button } from "@/components/ui/button";
import { ContactPerson } from "@/lib/types";
import { Trash2, Edit2, Check } from "lucide-react";
import { memo, useState } from "react";
import DeleteAlert from "./deleteAlert";

const SavedContactPerson = memo(
  ({
    person,
    onRemove,
    onUpdate
  }: {
    person: ContactPerson;
    onRemove: (id: string) => void;
    onUpdate: (updatedPerson: ContactPerson) => void;
  }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editablePerson, setEditablePerson] = useState(person);

    const handleDeleteClick = () => setShowDeleteDialog(true);
    const handleDeleteConfirm = () => {
      onRemove(person.id);
      setShowDeleteDialog(false);
    };

    const handleEditClick = () => {
      if (isEditing) {
        // Save changes
        onUpdate(editablePerson);
      }
      setIsEditing(!isEditing);
    };

    const handleChange = (name:string,value:string) => {
      setEditablePerson((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    return (
      <>
        <div className="p-4 border rounded-lg relative flex flex-col gap-2">
          <div className="absolute top-2 right-2 flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleEditClick}>
              {isEditing ? <Check className="w-4 h-4 text-green-500" /> : <Edit2 className="w-4 h-4 text-blue-500" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDeleteClick}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>

          <div className="grid gap-2 text-sm">
            {isEditing ? (
              <>
                <div>
                  <strong>Imię i nazwisko:</strong>
                  <input
                    name="imieNazwisko"
                    value={editablePerson.imieNazwisko}
                    onChange={(e)=>handleChange(e.target.name,e.target.value)}
                    className="ml-2 border rounded p-1 text-sm w-full"
                  />
                </div>
                <div>
                  <strong>Stanowisko:</strong>
                  <input
                    name="stanowisko"
                    value={editablePerson.stanowisko}
                    onChange={(e)=>handleChange(e.target.name,e.target.value)}
                    className="ml-2 border rounded p-1 text-sm w-full"
                  />
                </div>
                <div>
                  <strong>Tel 1:</strong>
                  <input
                    name="tel1"
                    value={editablePerson.tel1}
                    onChange={(e)=>handleChange(e.target.name,e.target.value)}
                    className="ml-2 border rounded p-1 text-sm w-full"
                  />
                </div>
                <div>
                  <strong>Tel 2:</strong>
                  <input
                    name="tel2"
                    value={editablePerson.tel2}
                    onChange={(e)=>handleChange(e.target.name,e.target.value)}
                    className="ml-2 border rounded p-1 text-sm w-full"
                  />
                </div>
                <div>
                  <strong>Email:</strong>
                  <input
                    name="email"
                    type="email"
                    value={editablePerson.email}
                    onChange={(e)=>handleChange(e.target.name,e.target.value)}
                    className="ml-2 border rounded p-1 text-sm w-full"
                  />
                </div>
              </>
            ) : (
              <>
                <p><strong>Imię i nazwisko:</strong> {person.imieNazwisko}</p>
                <p><strong>Stanowisko:</strong> {person.stanowisko}</p>
                <p><strong>Tel 1:</strong> {person.tel1}</p>
                <p><strong>Tel 2:</strong> {person.tel2}</p>
                <p><strong>Email:</strong> {person.email}</p>
              </>
            )}
          </div>
        </div>

        <DeleteAlert
          setShowDeleteDialog={setShowDeleteDialog}
          showDeleteDialog={showDeleteDialog}
          handleDeleteConfirm={handleDeleteConfirm}
          prodCategory="osobe"
          prodName={person.imieNazwisko}
        />
      </>
    );
  }
);

SavedContactPerson.displayName = "SavedContactPerson";
export default SavedContactPerson;
