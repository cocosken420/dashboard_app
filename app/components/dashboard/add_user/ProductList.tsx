"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import React, { useCallback } from "react"
import { ProductOption, subOptionsInterface } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductItem from "./ProductItem"

type ProductOption2 = {
  id: string
  name: string
  subOptions: subOptionsInterface[]
}

interface ProductListProps {
  setSelectedProduct: React.Dispatch<React.SetStateAction<string>>
  setCheckedSubOptions: React.Dispatch<React.SetStateAction<Record<string, Set<string>>>>
  setNewProductName: React.Dispatch<React.SetStateAction<string>>
  products: ProductOption[]
  selectedProduct: string
  newSubOption: subOptionsInterface
  setNewSubOption: React.Dispatch<React.SetStateAction<subOptionsInterface>>
  availableProducts: ProductOption2[]
  checkedSubOptions: Record<string, Set<string>>
  newProductName: string
  setProducts: React.Dispatch<React.SetStateAction<ProductOption[]>>
  showAlert: (message: string, type: "error" | "success" | "warning") => void
}

export default function ProductList({
  setSelectedProduct,
  setCheckedSubOptions,
  setNewProductName,
  products,
  selectedProduct,
  newSubOption,
  setNewSubOption,
  availableProducts,
  checkedSubOptions,
  newProductName,
  setProducts,
  showAlert
}: ProductListProps) {
  const toggleSubOption = useCallback(
    (productId: string, subOptionId: string) => {
      setCheckedSubOptions((prev) => {
        const productSet = new Set(prev[productId] ?? [])

        if (productSet.has(subOptionId)) {
          productSet.delete(subOptionId)
        } else {
          productSet.add(subOptionId)
        }

        return {
          ...prev,
          [productId]: productSet,
        }
      })
    },
    [setCheckedSubOptions]
  )

  const addSelectedSubOptionsToProducts = useCallback(() => {
    setProducts((prev) => {
      const productMap = new Map(prev.map((p) => [p.id, p]))

      availableProducts.forEach((product) => {
        const selectedIds = checkedSubOptions[product.id]
        if (!selectedIds || selectedIds.size === 0) return

        const selectedSubs = product.subOptions.filter((s) =>
          selectedIds.has(s.id)
        )

        if (productMap.has(product.id)) {
          // product already exists → merge subOptions
          const existing = productMap.get(product.id)!

          const existingSubIds = new Set(existing.subOptions.map((s) => s.id))

          existing.subOptions.push(
            ...selectedSubs.filter((s) => !existingSubIds.has(s.id))
          )
        } else {
          // new product
          productMap.set(product.id, {
            id: product.id,
            name: product.name,
            subOptions: selectedSubs,
          })
        }
      })

      return Array.from(productMap.values())
    })

    setCheckedSubOptions({})
  }, [availableProducts, checkedSubOptions, setProducts, setCheckedSubOptions])

  const editSubOption = useCallback((productId: string, subOptionId: string, updated: subOptionsInterface) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            subOptions: p.subOptions.map((sub) => (sub.id === subOptionId ? updated : sub)),
          }
        }
        return p
      }),
    )
  }, [setProducts])
  // Product handlers
  const addProduct = useCallback(() => {
    if (!newProductName) {
      showAlert("Proszę wpisać nazwę produktu", "warning")
      return
    }

    const newProduct: ProductOption = {
      id: crypto.randomUUID(),
      name: newProductName,
      subOptions: [],
    }

    setProducts((prev) => [...prev, newProduct])
    setNewProductName("")
  }, [newProductName, setProducts, setNewProductName, showAlert])

  const addSubOption = useCallback(() => {
    if (!selectedProduct || !newSubOption) {
      showAlert("Wybierz produkt i wpisz opcję", "warning")
      return
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === selectedProduct) {
          return {
            ...p,
            subOptions: [...p.subOptions, { ...newSubOption, id: crypto.randomUUID() }],
          }
        }
        return p
      }),
    )

    setNewSubOption({
      id: "",
      name: "",
      zuzycie: "",
      konkurencja: "",
    })
    showAlert("Opcja została dodana", "success")
  }, [selectedProduct, newSubOption, setProducts, setNewSubOption, showAlert])

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [setProducts])

  const removeSubOption = useCallback((productId: string, subOptionIndex: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            subOptions: p.subOptions.filter((_, idx) => idx !== subOptionIndex),
          }
        }
        return p
      }),
    )
  }, [setProducts])
    
    return  <Card>
    <CardHeader>
      <CardTitle className="break-words [overflow-wrap:anywhere]">Lista Produktów</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Add New Product */}
      <div className="border rounded-lg p-3 max-h-[12.5rem] overflow-y-auto space-y-4">
      {availableProducts.map((product) => (
        <div key={product.id} className="space-y-2">
          <p className="font-medium text-sm">{product.name}</p>

          {product.subOptions.map((sub) => (
            <label
              key={sub.id}
              className="flex items-center gap-2 pl-3 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={
                  checkedSubOptions[product.id]?.has(sub.id) ?? false
                }
                onChange={() => toggleSubOption(product.id, sub.id)}
              />
              <span className="break-words">{sub.name}</span>
            </label>
          ))}
        </div>
      ))}
    </div>

    <Button
      onClick={addSelectedSubOptionsToProducts}
      disabled={Object.keys(checkedSubOptions).length === 0}
      className="w-full"
    >
      Dodaj zaznaczone opcje
    </Button>
      <div className="space-y-4 p-4 border-2  rounded-lg">
        <h3 className="font-semibold   break-words [overflow-wrap:anywhere]">
          Dodaj produkt
        </h3>
        <div className="flex gap-2">
          <Input
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            placeholder="Nazwa produktu"
            className="break-words [overflow-wrap:anywhere]"
          />
          <Button onClick={addProduct}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Existing Products */}
      {products.map((product) => (
        <ProductItem
        onEditSubOption={editSubOption}
          key={product.id}
          product={product}
          onRemove={removeProduct}
          onRemoveSubOption={removeSubOption}
        />
      ))}

      {/* Add Sub-option */}
      {products.length > 0 && (
        <div className="space-y-4 p-4 border-2  ">
          <h3 className="font-semibold  break-words [overflow-wrap:anywhere]">
            Dodaj opcję do produktu
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">
              Wybierz produkt
            </label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz produkt" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">
              Nazwa opcji
            </label>
            <Input
              value={newSubOption.name}
              onChange={(e) => setNewSubOption({ ...newSubOption, name: e.target.value })}
              placeholder="Nazwa opcji"
              className="break-words [overflow-wrap:anywhere]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">Zużycie miesięczne(kg)</label>
            <Input
              value={newSubOption.zuzycie}
              onChange={(e) => setNewSubOption({ ...newSubOption, zuzycie: e.target.value })}
              placeholder="Zużycie"
              className="break-words [overflow-wrap:anywhere]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">
              Konkurencja
            </label>
            <Input
              value={newSubOption.konkurencja}
              onChange={(e) => setNewSubOption({ ...newSubOption, konkurencja: e.target.value })}
              placeholder="Konkurencja"
              className="break-words [overflow-wrap:anywhere]"
            />
          </div>

          <Button onClick={addSubOption} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Dodaj opcję
          </Button>
        </div>
      )}
    </CardContent>
  </Card>

}