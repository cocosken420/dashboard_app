"use client"
import React, { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ArrowLeft, Plus, WifiOff, Pencil, Trash2, Check, X, AlertTriangle, Loader2 } from "lucide-react"
import { Alert, getAlertStyles, ProductOption, subOptionsInterface } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  saveProductsToEmployee,
  getProductsFromDB,
  updateSubOption,
  removeProductFromDB,
  removeSubOptionFromDB,
} from "@/lib/dbActions"
import Link from "next/link"
import useOnlineStatus from "@/lib/useOnlineStatus"
import Alerts, { showAlert } from "@/app/components/dashboard/global/alerts"
import { CookieInterface, getUserCookie } from "@/lib/userCookies"

export default function Page() {
  const [newSubOption, setNewSubOption] = useState<subOptionsInterface>({
    id: "",
    name: "",
    zuzycie: "",
    konkurencja: "",
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [newProductName, setNewProductName] = useState("")
  const [products, setProducts] = useState<ProductOption[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editingProductName, setEditingProductName] = useState("")
  const [cookieUser,setCookieUser]=useState<CookieInterface>()
  const [editingSubOption, setEditingSubOption] = useState<{
    productId: string
    subOptionId: string
  } | null>(null)
  const [editingSubOptionData, setEditingSubOptionData] = useState<subOptionsInterface>({
    id: "",
    name: "",
    zuzycie: "",
    konkurencja: "",
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: 'product' | 'suboption'
    productId?: string
    productName?: string
    subOptionIndex?: number
    subOptionName?: string
  }>({
    open: false,
    type: 'product'
  })

  

  /* 🔄 LOAD FROM DB */
  useEffect(() => {
    async function load() {
      const user = await getUserCookie()
      if(!user) {window.location.href="/auth/login";return;}
      setCookieUser(user!)
      const data = await getProductsFromDB(user!.id)
      setProducts(data)
    }
    load()
  }, [])

  /* ➕ ADD PRODUCT */
  const addProduct = useCallback(() => {
    if (!newProductName.trim()) {
      showAlert("Nazwa produktu nie może być pusta", "warning",alerts,setAlerts)
      return
    }

    const newProduct: ProductOption = {
      id: crypto.randomUUID(),
      name: newProductName,
      subOptions: [],
    }

    setProducts((prev) => [...prev, newProduct])
    setNewProductName("")
    showAlert("Produkt został dodany", "success",alerts,setAlerts)
  }, [newProductName, showAlert])

  /* ✏️ START EDITING PRODUCT */
  const startEditingProduct = useCallback((product: ProductOption) => {
    setEditingProduct(product.id)
    setEditingProductName(product.name)
  }, [])

  /* ✅ SAVE PRODUCT EDIT */
  const saveProductEdit = useCallback(() => {
    if (!editingProductName.trim()) {
      showAlert("Nazwa produktu nie może być pusta", "warning",alerts,setAlerts)
      return
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct ? { ...p, name: editingProductName } : p
      )
    )
    setEditingProduct(null)
    setEditingProductName("")
    showAlert("Produkt został zaktualizowany", "success",alerts,setAlerts)
  }, [editingProduct, editingProductName, showAlert])

  /* ❌ CANCEL PRODUCT EDIT */
  const cancelProductEdit = useCallback(() => {
    setEditingProduct(null)
    setEditingProductName("")
  }, [])

  /* 💾 SAVE ALL */
  async function fetchToDB() {
    setIsLoading(true)
    try {
      await saveProductsToEmployee(cookieUser!.id,products)
      showAlert("Produkty zostały zapisane do bazy danych!", "success",alerts,setAlerts)
    } catch (error) {
      showAlert("Błąd podczas zapisywania produktów do bazy danych!", "error",alerts,setAlerts)
    } finally {
      setIsLoading(false)
    }
  }

  /* ✏️ START EDITING SUB OPTION */
  const startEditingSubOption = useCallback((productId: string, subOption: subOptionsInterface) => {
    setEditingSubOption({ productId, subOptionId: subOption.id })
    setEditingSubOptionData(subOption)
  }, [])

  /* ✅ SAVE SUB OPTION EDIT */
  const saveSubOptionEdit = useCallback(() => {
    if (!editingSubOption) return

    if (!editingSubOptionData.name.trim()) {
      showAlert("Nazwa opcji nie może być pusta", "warning",alerts,setAlerts)
      return
    }

    editSubOption(editingSubOption.productId, editingSubOption.subOptionId, editingSubOptionData)
    setEditingSubOption(null)
    setEditingSubOptionData({
      id: "",
      name: "",
      zuzycie: "",
      konkurencja: "",
    })
    showAlert("Opcja została zaktualizowana", "success",alerts,setAlerts)
  }, [editingSubOption, editingSubOptionData, showAlert])

  /* ❌ CANCEL SUB OPTION EDIT */
  const cancelSubOptionEdit = useCallback(() => {
    setEditingSubOption(null)
    setEditingSubOptionData({
      id: "",
      name: "",
      zuzycie: "",
      konkurencja: "",
    })
  }, [])

  /* ✏️ EDIT SUB OPTION */
  const editSubOption = useCallback(
    (productId: string, subOptionId: string, updated: subOptionsInterface) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                subOptions: p.subOptions.map((sub) =>
                  sub.id === subOptionId ? updated : sub
                ),
              }
            : p
        )
      )

      updateSubOption(cookieUser!.id,productId, updated)
    },
    [cookieUser]
  )

  /* ➕ ADD SUB OPTION */
  const addSubOption = useCallback(() => {
    if (!selectedProduct) {
      showAlert("Wybierz produkt", "warning",alerts,setAlerts)
      return
    }

    if (!newSubOption.name.trim()) {
      showAlert("Nazwa opcji nie może być pusta", "warning",alerts,setAlerts)
      return
    }

    const created = { ...newSubOption, id: crypto.randomUUID() }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct
          ? { ...p, subOptions: [...p.subOptions, created] }
          : p
      )
    )

    setNewSubOption({
      id: "",
      name: "",
      zuzycie: "",
      konkurencja: "",
    })
    showAlert("Opcja została dodana", "success",alerts,setAlerts)
  }, [selectedProduct, newSubOption, showAlert])

  /* 🗑️ REMOVE PRODUCT */
  const confirmRemoveProduct = useCallback((id: string, name: string) => {
    setDeleteDialog({
      open: true,
      type: 'product',
      productId: id,
      productName: name
    })
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteDialog.type === 'product' && deleteDialog.productId) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteDialog.productId))
      removeProductFromDB(cookieUser!.id,deleteDialog.productId)
      showAlert("Produkt został usunięty", "success",alerts,setAlerts)
    } else if (deleteDialog.type === 'suboption' && deleteDialog.productId !== undefined && deleteDialog.subOptionIndex !== undefined) {
      const sub = products
        .find((p) => p.id === deleteDialog.productId)
        ?.subOptions[deleteDialog.subOptionIndex]

      setProducts((prev) =>
        prev.map((p) =>
          p.id === deleteDialog.productId
            ? {
                ...p,
                subOptions: p.subOptions.filter((_, i) => i !== deleteDialog.subOptionIndex),
              }
            : p
        )
      )

      if (sub) {
        removeSubOptionFromDB(cookieUser!.id,deleteDialog.productId, sub.id)
      }
      showAlert("Opcja została usunięta", "success",alerts,setAlerts)
    }
    
    setDeleteDialog({ open: false, type: 'product' })
  }, [deleteDialog, products, showAlert,cookieUser])

  /* 🗑️ REMOVE SUB OPTION */
  const confirmRemoveSubOption = useCallback(
    (productId: string, subOptionIndex: number, subOptionName: string) => {
      setDeleteDialog({
        open: true,
        type: 'suboption',
        productId,
        subOptionIndex,
        subOptionName
      })
    },
    []
  )

  const isOnline = useOnlineStatus()
  
  if (!isOnline) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <WifiOff className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Brak połączenia z internetem</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sprawdź swoje połączenie sieciowe i spróbuj ponownie.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="w-full"
              >
                Odśwież stronę
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  if(!cookieUser){
    return <div className="bg-black flex justify-center items-center">
        <div><Loader2 className="w-8 h-8 animate-spin" />Ładowanie danych</div>
    </div>
  }
  return (
    <div className="relative">
      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Potwierdź usunięcie
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === 'product' ? (
                <>
                  Czy na pewno chcesz usunąć produkt{" "}
                  <span className="font-semibold text-foreground">{deleteDialog.productName}</span>? Ta operacja jest
                  nieodwracalna.
                </>
              ) : (
                <>
                  Czy na pewno chcesz usunąć opcję{" "}
                  <span className="font-semibold text-foreground">{deleteDialog.subOptionName}</span>? Ta operacja jest
                  nieodwracalna.
                </>
              )}
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

      {/* ALERTS */}
      <Alerts alerts={alerts}/ >
      {/* BACK */}
      <Button className="absolute z-50 top-4 right-4">
        <Link href="/dashboard/add_user" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Powrót
        </Link>
      </Button>
  
      <Card className="max-w-4xl w-full mx-auto">
        <CardHeader>
          <CardTitle>Lista Produktów</CardTitle>
        </CardHeader>
  
        <CardContent className="space-y-6">
  
          {/* ADD PRODUCT */}
          <div className="space-y-4 p-4 border-2 rounded-lg">
            <h3 className="font-semibold">Dodaj produkt</h3>
            <div className="flex gap-2">
              <Input
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Nazwa produktu"
                onKeyPress={(e) => e.key === 'Enter' && addProduct()}
              />
              <Button onClick={addProduct}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* PRODUCTS LIST WITH EDIT/DELETE */}
          {products.length > 0 && (
            <div className="space-y-4 p-4 border-2 rounded-lg">
              <h3 className="font-semibold">Zarządzaj produktami</h3>
              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-2 p-2 border rounded">
                    {editingProduct === product.id ? (
                      <>
                        <Input
                          value={editingProductName}
                          onChange={(e) => setEditingProductName(e.target.value)}
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && saveProductEdit()}
                        />
                        <Button size="sm" variant="ghost" onClick={saveProductEdit}>
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelProductEdit}>
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium">{product.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({product.subOptions.length} opcji)
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => startEditingProduct(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => confirmRemoveProduct(product.id, product.name)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* ADD SUB OPTION FORM */}
          {products.length > 0 && (
            <div className="space-y-4 p-4 border-2 rounded-lg">
              <h3 className="font-semibold">Dodaj opcję do produktu</h3>
  
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz produkt" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
  
              <Input
                value={newSubOption.name}
                onChange={(e) =>
                  setNewSubOption({ ...newSubOption, name: e.target.value })
                }
                placeholder="Nazwa opcji"
              />
  
              <Button onClick={addSubOption} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Dodaj opcję
              </Button>
            </div>
          )}
  
          {/* ENHANCED TABLE WITH EDIT/DELETE */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="border px-3 py-2 text-left">Produkt</th>
                  <th className="border px-3 py-2 text-left">Zużycie miesięczne(kg)</th>
                  <th className="border px-3 py-2 text-left">Konkurencja</th>
                  <th className="border px-3 py-2 text-center w-24">Akcje</th>
                </tr>
              </thead>
  
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="border px-3 py-6 text-center text-muted-foreground"
                    >
                      Brak produktów
                    </td>
                  </tr>
                )}
  
                {products.map((product) =>
                  product.subOptions.length === 0 ? (
                    <tr key={product.id}>
                      <td className="border px-3 py-2 font-medium">
                        {product.name}
                      </td>
                      <td
                        colSpan={3}
                        className="border px-3 py-2 italic text-muted-foreground"
                      >
                        Brak opcji
                      </td>
                    </tr>
                  ) : (
                    product.subOptions.map((sub, index) => {
                      const isEditing = editingSubOption?.productId === product.id && 
                                       editingSubOption?.subOptionId === sub.id
                      
                      return (
                        <tr key={sub.id}>
                          {isEditing ? (
                            <>
                              <td className="border px-3 py-2">
                                <Input
                                  value={editingSubOptionData.name}
                                  onChange={(e) =>
                                    setEditingSubOptionData({
                                      ...editingSubOptionData,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="Nazwa"
                                  className="h-8"
                                />
                              </td>
                              <td className="border px-3 py-2">
                                <Input
                                  value={editingSubOptionData.zuzycie}
                                  onChange={(e) =>
                                    setEditingSubOptionData({
                                      ...editingSubOptionData,
                                      zuzycie: e.target.value,
                                    })
                                  }
                                  placeholder="Zużycie"
                                  className="h-8"
                                />
                              </td>
                              <td className="border px-3 py-2">
                                <Input
                                  value={editingSubOptionData.konkurencja}
                                  onChange={(e) =>
                                    setEditingSubOptionData({
                                      ...editingSubOptionData,
                                      konkurencja: e.target.value,
                                    })
                                  }
                                  placeholder="Konkurencja"
                                  className="h-8"
                                />
                              </td>
                              <td className="border px-3 py-2">
                                <div className="flex justify-center gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={saveSubOptionEdit}
                                  >
                                    <Check className="w-4 h-4 text-green-600" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={cancelSubOptionEdit}
                                  >
                                    <X className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="border px-3 py-2">
                                {product.name} {sub.name}
                              </td>
                              <td className="border px-3 py-2">{sub.zuzycie}</td>
                              <td className="border px-3 py-2">{sub.konkurencja}</td>
                              <td className="border px-3 py-2">
                                <div className="flex justify-center gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => startEditingSubOption(product.id, sub)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => confirmRemoveSubOption(product.id, index, sub.name)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      )
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
  
          {/* SAVE */}
          <Button onClick={fetchToDB} className="w-full" disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : "Zapisz przedmioty"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}