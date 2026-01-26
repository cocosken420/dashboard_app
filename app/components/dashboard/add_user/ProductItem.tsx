import { Button } from "@/components/ui/button";
import { ProductOption, subOptionsInterface } from "@/lib/types";
import { Trash2, AlertTriangle } from "lucide-react";
import { memo, useState } from "react";
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
import SubOptionItem from "./subOptions";
import DeleteAlert from "./deleteAlert";

const ProductItem = memo(
  ({
    product,
    onRemove,
    onEditSubOption,
    onRemoveSubOption,
  }: {
    product: ProductOption;
    onRemove: (id: string) => void;
    onEditSubOption: (productId: string, subOptionId: string, updated: subOptionsInterface) => void;
    onRemoveSubOption: (productId: string, subOptionIndex: number) => void;
  }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDeleteClick = () => {
      setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
      onRemove(product.id);
      setShowDeleteDialog(false);
    };

    return (
      <>
        <div className="p-4 border-2 rounded-lg space-y-3 relative shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">{product.name}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>

          {product.subOptions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 font-medium">Opcje produktu:</p>
              {product.subOptions.map((sub, idx) => (
                <SubOptionItem
                  key={idx}
                  subOption={sub}
                  onRemove={() => onRemoveSubOption(product.id, parseInt(sub.id))}
                  onEdit={(updated:subOptionsInterface) => onEditSubOption(product.id, sub.id, updated)}
                />
              ))}
            </div>
          ) : (
            <></>
          )}
        </div>

        <DeleteAlert setShowDeleteDialog={setShowDeleteDialog} showDeleteDialog={showDeleteDialog} handleDeleteConfirm={handleDeleteConfirm} prodCategory="produkt" prodName={product.name} />
      </>
    );
  }
);
ProductItem.displayName = "ProductItem";

export default ProductItem;