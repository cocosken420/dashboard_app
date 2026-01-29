"use client"

import type React from "react"
import { useState, useCallback   } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {   ArrowDown, ArrowUp, Check, Trash2, WifiOff } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/app/components/dashboard/global/dashboard-layout"
import InteractiveMap from "@/app/components/dashboard/global/InteractiveMap"
import { addNewUserkerToDb, getProductsFromDB, updateUserInDb } from "@/lib/dbActions"
import { useSearchParams } from "next/navigation"
import { useUsers } from "@/lib/useUsers"
import { useEffect } from "react"
import type { ContactPerson, Coordinates, ProductOption, subOptionsInterface, Task, User } from "@/lib/types"
import UsersManagementPage from "@/components/UsersManagementPage"
import {  getCurrentUser, storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import useOnlineStatus from "@/lib/useOnlineStatus"
import ContactPersonList from "@/app/components/dashboard/add_user/ContactPersonList"
import TaskList from "@/app/components/dashboard/add_user/TaskList"
import ProductList from "@/app/components/dashboard/add_user/ProductList"
import { getUserCookie } from "@/lib/userCookies"
import Alerts, { showAlert } from "@/app/components/dashboard/global/alerts"
import { useUserListener } from "@/lib/useUserListener"

interface Alert {
  id: string
  message: string
  type: "error" | "success" | "warning"
}
type ProductOption2 = {
  id: string
  name: string
  subOptions: subOptionsInterface[]
}


const branzaOptions = ["X", "cukiernicza", "piekarnia", "lodziarnia", "fabryka czekolady"]
const segmentOptions = ["Y", "A", "B", "C"]
const regionOptions = ["Z", "podkarpackie", "małopolskie", "świętokrzyskie"]

export default function ExpandedAddUserForm() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const searchParams = useSearchParams()
  const editing = searchParams.get("editing") === "true"
  const [expanded, setExpanded] = useState<boolean>(false)
  const [usersList,setUsersList]=useState<User[]>([])
  const userID = searchParams.get("userID")
  useUserListener();
  const {  users } = useUsers()
  const [newSubOption, setNewSubOption] = useState<subOptionsInterface>({
    id: "",
    name: "",
    zuzycie: "",
    konkurencja: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  useEffect(()=>{
    if(users) setUsersList(users)
  },[users])
  // Basic form data
  const [formData, setFormData] = useState({
    nazwa: "",
    NIP: "",
    adres: "",
    phone: "",
    email: "",
    www: "",
    segment: "",
    region: "",
    opis: "",
    dodatkoweInformacje: "",
    sprzedaz: "",
  })
  const [branza,setBranza]=useState<string[]>([])
  // Contact persons
  const [savedContactPersons, setSavedContactPersons] = useState<ContactPerson[]>([])
  const [currentContactPerson, setCurrentContactPerson] = useState({
    imieNazwisko: "",
    stanowisko: "",
    tel1: "",
    tel2: "",
    email: "",
  })

  // Tasks
  const [savedTasks, setSavedTasks] = useState<Task[]>([])
  const [currentTask, setCurrentTask] = useState({
    data: "",
    zadanie: "",
    opis: "",
  })

  // Products
  const [photos, setPhotos] = useState<string[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])

  const [availableProducts, setAvailableProducts] = useState<ProductOption2[]>([])
  const [newProductName, setNewProductName] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [checkedSubOptions, setCheckedSubOptions] = useState<
  Record<string, Set<string>>
>({})
  // Image
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  
  useEffect(()=>{
    async function load() {
      const user = await getUserCookie()
      if(!user) {window.location.href="/auth/login";return;}
      const data = await getProductsFromDB(user.id)
      const chexkboxes=data.map((next)=>{
        return {
          id:next.id,
          name:next.name,
          subOptions:next.subOptions
        }
      })
      setAvailableProducts(chexkboxes)
    }
    load()
  },[])
 
  async function uploadImage(file: File) {
    try {
      const storageRef = ref(storage, `products/${crypto.randomUUID()}.webp`)
      await uploadBytes(storageRef, file)
      const imageUrl = await getDownloadURL(storageRef)
      setPhotos([...photos, imageUrl])
    } catch (error) {
      showAlert("Błąd podczas dodawania zdjęcia!", "error",alerts,setAlerts)
    }
  }
  useEffect(() => {
    if (!editing || !userID) return
    const user = users.find((u) => u.id === userID)
    if (user) {
      setFormData({
        nazwa: user.nazwa,
        NIP: user.NIP,
        adres: user.adres,
        phone: user.phone,
        email: user.email,
        www: user.www,
        segment: user.segment,
        region: user.region,
        opis: user.opis,
        dodatkoweInformacje: user.dodatkoweInformacje,
        sprzedaz: user.sprzedaz,
      })
      setBranza([...user.branza])
      setPhotos([...user.zdjecie])
      setSavedContactPersons([...user.listaOsobKontaktowych])
      setSavedTasks([...user.tasks])
      setProducts([...user.produkty])
    }
  }, [users, editing, userID])

 

  const handleChange : React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =useCallback((e)=> {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }, [])

  const deleteImage = (id: number) => {
    setPhotos(photos.filter((img, idx) => idx !== id))
  }
  const geocodeAddress = async (address: string) => {
    const idToken = await getCurrentUser();
    try {
      const res = await fetch(`/api?address=${encodeURIComponent(address)}`,{
        headers: { "Content-Type": "application/json","Authorization": `Bearer ${idToken}` },
      })
      const data = await res.json()
      return data
    } catch (error) {
      showAlert("Nie udało sie pobrać adresu użytkownika","error",alerts,setAlerts)
    }
  }
  const handleFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return
      uploadImage(file)
      setSelectedImage(file)
    })
  }
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
  
      const images: File[] = []
  
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) images.push(file)
        }
      }
      if (images.length > 0) {
        handleFiles(images)
      }
    }
  
    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [])
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }
  function showAlertFkc(title:string,danger:"success"|"warning"|"error"){
    showAlert(title,danger,alerts,setAlerts)
  }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }
  const handleSubmit = useCallback(async () => {
    setIsLoading(true)
    try {
      const coordinates = formData.adres
        ? ((await geocodeAddress(formData.adres + "," + formData.region + ",Poland")) as Coordinates)
        : null
        const userFromCookies = await getUserCookie()
        if(!userFromCookies){
          showAlert("Sesja wygasła zaloguj sie ponownie","warning",alerts,setAlerts);
          setTimeout(() => {
            window.location.href="/auth/login"
          }, 2000);
          return;
        }
      const userToSave: Omit<User,"employeeID"> = {
        id: editing ? userID! : crypto.randomUUID(),
        nazwa: formData.nazwa,
        NIP: formData.NIP,
        adres: formData.adres,
        phone: formData.phone,
        email: formData.email,
        www: formData.www,
        branza: branza,
        segment: formData.segment,
        region: formData.region,
        iv: undefined,
        tag: undefined,
        tasks: savedTasks,
        opis: formData.opis,
        listaOsobKontaktowych: savedContactPersons,
        dodatkoweInformacje: formData.dodatkoweInformacje,
        produkty: products,
        sprzedaz: formData.sprzedaz,
        lat: coordinates ? coordinates?.lat : undefined,
        lng: coordinates ? coordinates.lng : undefined,
        zdjecie: photos, // Image upload handling can be added here
      }
      if (editing) {
        await updateUserInDb(userToSave)
        showAlert("Klient został pomyślnie zaktualizowany!", "success",alerts,setAlerts)
        return
      } else {
        await addNewUserkerToDb(userToSave)
        showAlert("Klient został pomyślnie dodany!", "success",alerts,setAlerts)
      }

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          nazwa: "",
          NIP: "",
          adres: "",
          phone: "",
          email: "",
          www: "",
          segment: "",
          region: "",
          opis: "",
          dodatkoweInformacje: "",
          sprzedaz: "",
        })
        setBranza([])
        setSavedContactPersons([])
        setSavedTasks([])
        setProducts([])
        setSelectedImage(null)
      }, 1000)
    } catch (error) {
      showAlert("Błąd podczas dodawania klienta!", "error",alerts,setAlerts)
    } finally {
      setIsLoading(false)
    }
  }, [editing, userID, formData, savedTasks, savedContactPersons, products, photos, showAlert,branza,getUserCookie])
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
  return (
    <DashboardLayout>
        <Alerts alerts={alerts}/ >
        {editing&&<Button onClick={handleSubmit} disabled={isLoading} className="flex-1 fixed left-[2rem] bottom-[2rem]">
                {isLoading ? "Zapisywanie..." : editing ? "Aktualizuj Klienta" : "Zapisz dane"}
          </Button>}
      <div className="min-h-screen czcionka overflow-x-hidden bg-gradient-to-br w-fit lg:grid lg:grid-cols-3 p-3  sm:p-4 md:p-6
">
        <UsersManagementPage showAlert={showAlertFkc} users={usersList} />

        <div className="lg:col-span-1 space-y-4">
          {/* Header - More compact on mobile */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight break-words [overflow-wrap:anywhere]">Dodaj Klienta</h1>
            <p className="text-muted-foreground mt-2 break-words [overflow-wrap:anywhere]">
              Wypełnij poniższe pola, aby dodać nowego klienta
            </p>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="break-words [overflow-wrap:anywhere]">Podstawowe Informacje</CardTitle>
                <CardDescription className="break-words [overflow-wrap:anywhere]">Dane klienta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">
                    Nazwa <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="nazwa"
                    value={formData.nazwa}
                    onChange={handleChange}
                    placeholder="Imię i nazwisko"
                    required
                    className="break-words [overflow-wrap:anywhere]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">
                      NIP <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="NIP"
                      value={formData.NIP}
                      onChange={handleChange}
                      placeholder="1234567890"
                      required
                      className="break-words [overflow-wrap:anywhere]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">
                      Adres <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="adres"
                      value={formData.adres}
                      onChange={handleChange}
                      placeholder="Miasto"
                      required
                      className="break-words [overflow-wrap:anywhere]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">
                    Telefon <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+48 123 456 789"
                    required
                    className="break-words [overflow-wrap:anywhere]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                    className="break-words [overflow-wrap:anywhere]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">WWW</label>
                  <Input
                    name="www"
                    type="url"
                    value={formData.www}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="break-words [overflow-wrap:anywhere]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words [overflow-wrap:anywhere] flex gap-10 flex-row">
                      Branża   {open?<ArrowUp onClick={()=>setOpen(!open)} className="w-4 h-4" /> :<ArrowDown onClick={()=>setOpen(!open)} className="w-4 h-4" />}
                    </label>

                    <div className="flex flex-col text-sm w-fit gap-2">
                    <span
                         onClick={()=>setOpen(!open)}
                          className={`cursor-pointer px-1 py-1 border  `}
                        >
                          Wybier branże 
                        </span>
                    {open?branzaOptions.map(option => (
                      option !== "X" && (
                        <span
                          key={option}
                          onClick={() => {
                            if (!branza.includes(option)) setBranza([...branza, option])
                            else setBranza(branza.filter(e => e !== option))
                          }}
                          className={`cursor-pointer px-1 py-1 border ${
                            branza.includes(option)
                              ? " text-white border-blue-500"
                              : " text-white border-gray-300"
                          }`}
                        >
                          {option}
                        </span>
                      )
                    )):""}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">
                      Region <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => handleSelectChange("region", value === "Z" ? "" : value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regionOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === "Z" ? "Wybierz region" : option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium break-words [overflow-wrap:anywhere]">
                      Segment <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.segment}
                      onValueChange={(value) => handleSelectChange("segment", value === "Y" ? "" : value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz segment" />
                      </SelectTrigger>
                      <SelectContent>
                        {segmentOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === "Y" ? "Wybierz segment" : option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
                  {!expanded ? "Rozwiń formularz" : "Zwiń formularz"}
                </Button>
              </CardContent>
            </Card>

            {/* Opis */}
            {expanded ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="break-words [overflow-wrap:anywhere]">Opis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      name="opis"
                      value={formData.opis}
                      onChange={handleChange}
                      placeholder="Wprowadź opis klienta..."
                      rows={4}
                      className="resize-none break-words [overflow-wrap:anywhere]"
                    />
                  </CardContent>
                </Card>

                {/* Lista Osób Kontaktowych */}
                <ContactPersonList 
                savedContactPersons={savedContactPersons} 
                setSavedContactPersons={ setSavedContactPersons} 
                showAlert={showAlertFkc} />

                {/* Lista Zadań */}
                <TaskList 
                currentTask={currentTask} 
                setCurrentTask={setCurrentTask } 
                setSavedTasks={setSavedTasks} 
                savedTasks={savedTasks} 
                showAlert={showAlertFkc} />

                {/* Lista Produktów */}
                 <ProductList
                 setSelectedProduct={setSelectedProduct}
                 setCheckedSubOptions={setCheckedSubOptions}
                 setNewProductName={setNewProductName}
                 products={products}
                 selectedProduct={selectedProduct}
                 newSubOption={newSubOption}
                 setNewSubOption={setNewSubOption}
                 availableProducts={availableProducts}
                 checkedSubOptions={checkedSubOptions}
                 newProductName={newProductName}
                 setProducts={setProducts}
                 showAlert={showAlertFkc}
                 />
                {/* Sprzedaż */}
                {/* Zdjęcia */}
                <Card>
                <CardHeader>
                    <CardTitle className="break-words [overflow-wrap:anywhere]">Sprzedaż</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      name="sprzedaz"
                      value={formData.sprzedaz}
                      onChange={handleChange}
                      placeholder="Wprowadź informacje o sprzedaży..."
                      rows={3}
                      className="resize-none break-words [overflow-wrap:anywhere]"
                    />
                  </CardContent>
                  <CardHeader>
                    <CardTitle className="break-words [overflow-wrap:anywhere]">Zdjęcia</CardTitle>
                    <CardDescription className="break-words [overflow-wrap:anywhere]">
                      Dodaj zdjęcia związane z klientem
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                  <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="space-y-4 rounded-lg border-2 border-dashed border-gray-300 p-4"
                      >
                    <p className="text-sm text-gray-500">
                      Możesz wybrać plik lub wkleić zdjęcie (CTRL + V)
                    </p>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}

                        className="cursor-pointer break-words [overflow-wrap:anywhere]"
                      />
                      {selectedImage && (
                        <div className="flex items-center gap-2 text-sm text-green-600 break-words [overflow-wrap:anywhere]">
                          <Check className="w-4 h-4" />
                          <span className="break-words [overflow-wrap:anywhere]">{selectedImage.name}</span>
                        </div>
                      )}
                    </div>
                    {photos.length > 0 && (
                      <div className="border-2 border-gray-300 rounded-lg p-4 text-center">
                        
                        {photos.map((photo, idx) => (
                          <div key={idx} className="flex flex-row justify-between">
                            <img src={photo} alt="photo" className="w-20 h-20 object-cover" />
                            <Trash2 onClick={() => deleteImage(idx)} className="cursor-pointer" />
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <></>
            )}

            {/* Submit Buttons */}
            <div className="flex    flex-col sm:flex-row gap-4">
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                {isLoading ? "Zapisywanie..." : editing ? "Aktualizuj Klienta" : "Dodaj Klienta"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if(editing)window.location.href="/dashboard/add_user"
                  setFormData({
                    nazwa: "",
                    NIP: "",
                    adres: "",
                    phone: "",
                    email: "",
                    www: "",
                    segment: "",
                    region: "",
                    opis: "",
                    dodatkoweInformacje: "",
                    sprzedaz: "",
                  })
                  setBranza([])
                  setSavedContactPersons([])
                  setSavedTasks([])
                  setPhotos([])
                  setProducts([])
                  setSelectedImage(null)
                }}
                className="flex-1"
              >
                Wyczyść Formularz
              </Button>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 lg:ml-10 space-y-6">
          {usersList &&<InteractiveMap users={usersList} />}
        </div>
      </div>
      
    </DashboardLayout>
  )
}
