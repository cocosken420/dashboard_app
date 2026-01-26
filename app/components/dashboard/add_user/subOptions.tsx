import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { subOptionsInterface } from "@/lib/types";
import {  Check, Edit2, Trash2, X } from "lucide-react";
import React, { memo, useState, useEffect, useCallback } from "react";

import DeleteAlert from "./deleteAlert";

interface SubOptionItemProps {
  subOption: subOptionsInterface;
  onRemove: () => void;
  onEdit: (updated: subOptionsInterface) => void;
}

const SubOptionItem = memo(({ subOption, onRemove, onEdit }: SubOptionItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<subOptionsInterface>(subOption);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Sync editData when subOption prop changes
  useEffect(() => {
    setEditData(subOption);
  }, [subOption]);

  const handleSave = () => {
    onEdit(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(subOption);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onRemove();
    setShowDeleteDialog(false);
  };
  const handleTaskChange: React.ChangeEventHandler<
  HTMLInputElement | HTMLTextAreaElement
> = useCallback((e) => {
  const { name, value } = e.target
  setEditData((prev) => ({
    ...prev,
    [name]: value,
  }))
}, [setEditData])
  if (isEditing) {
    return (
      <div className="p-3 border rounded-lg space-y-2">
        <Input
          value={editData.name}
          name="name"
          onChange={ handleTaskChange}
          placeholder="Nazwa opcji"
          className="text-sm"
        />
        <Input
          name="zuzycie"
          value={editData.zuzycie}
          onChange={ handleTaskChange}
          placeholder="Zużycie"
          className="text-sm"
        />
        <Textarea
          name="konkurencja"
          value={editData.konkurencja}
          onChange={ handleTaskChange}
          placeholder="Konkurencja"
          className="text-sm resize-none"
          rows={2}
        />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleSave} className="flex-1">
              <Check className="w-3 h-3 mr-1" />
              Zapisz
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleCancel} className="flex-1">
              <X className="w-3 h-3 mr-1" />
              Anuluj
            </Button>
          </div>
        </div>
      );
    }
  
  return (
    <>
      <div className="p-3 border rounded-lg space-y-1 relative group">
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-7 w-7 p-0"
          >
            <Edit2 className="w-3 h-3 text-blue-500" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            className="h-7 w-7 p-0"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
          </Button>
        </div>
        <p className="text-sm font-semibold pr-16">{subOption.name}</p>
        <p className="text-xs text-gray-600">
          <span className="font-medium">Zużycie:</span> {subOption.zuzycie || "—"}
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-medium">Konkurencja:</span> {subOption.konkurencja || "—"}
        </p>
      </div>
      <DeleteAlert setShowDeleteDialog={setShowDeleteDialog} showDeleteDialog={showDeleteDialog} handleDeleteConfirm={handleDeleteConfirm} prodCategory="opcję" prodName={subOption.name} />

    </>
  );
});

SubOptionItem.displayName = "SubOptionItem";

export default SubOptionItem;