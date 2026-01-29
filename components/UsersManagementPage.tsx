"use client"

import React, { useState, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Edit2, Trash2, UserCircle, X, Filter, ChevronDown, WifiOff, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { removeUserById } from "@/lib/dbActions"
import { User } from "@/lib/types"

// Mock types for demonstration

const branzaOptions = ["X", "cukiernicza", "piekarnia", "lodziarnia", "fabryka czekolady"]
const segmentOptions = ["Y", "A", "B", "C"]
const regionOptions = ["Z", "podkarpackie", "małopolskie", "świętokrzyskie"]

function UsersManagementPage({ users, showAlert }: {showAlert:(message: string, type: "error" | "success" | "warning")=>void, users: User[] }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBranza, setSelectedBranza] = useState("X")
  const [selectedSegment, setSelectedSegment] = useState("Y")
  const [selectedRegion, setSelectedRegion] = useState("Z")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Check online status


  // Filter users based on ALL criteria (AND logic)
  const filteredUsers = users.filter((user) => {
   

    const matchesName = searchQuery === "" || 
      user.nazwa.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesBranza = selectedBranza === "X" || 
      user.branza.includes(selectedBranza)
    
    const matchesSegment = selectedSegment === "Y" || 
      user.segment === selectedSegment
    
    const matchesRegion = selectedRegion === "Z" || 
      user.region === selectedRegion
    
    return matchesName && matchesBranza && matchesSegment && matchesRegion
  })

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      await removeUserById(userToDelete.id)
      showAlert("Klient został pomyślnie usunięty!", "success")
      setShowDeleteDialog(false)
      setUserToDelete(null)
    } catch (error) {
      showAlert("Błąd podczas usuwania klienta!", "error")
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setUserToDelete(null)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedBranza("X")
    setSelectedSegment("Y")
    setSelectedRegion("Z")
  }

  const hasActiveFilters = searchQuery !== "" || 
    selectedBranza !== "X" || 
    selectedSegment !== "Y" || 
    selectedRegion !== "Z"

  const activeFiltersCount = [
    searchQuery !== "",
    selectedBranza !== "X",
    selectedSegment !== "Y",
    selectedRegion !== "Z"
  ].filter(Boolean).length

  const setEditingUser = (id: string) => {
    router.push(`/dashboard/add_user?editing=true&userID=${id}`)
  }

  useEffect(() => {
    if (!selectedUser) return
    router.push(`/dashboard/users/${selectedUser.id}`)
  }, [selectedUser, router])

  // Offline view


  if (!users) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 lg:mb-3 czcionka sm:space-y-6 g2 p-3 sm:p-0">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Zarządzanie Użytkownikami</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Przeglądaj, edytuj i zarządzaj wszystkimi użytkownikami w systemie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {/* Mobile Filter Toggle & Search */}
              <div className="space-y-2">
                {/* Search Bar - Always Visible */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Szukaj po nazwie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 sm:h-11"
                  />
                </div>

                {/* Mobile: Filter Toggle Button */}
                <div className="flex gap-2 sm:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex-1 h-9"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filtry
                    {activeFiltersCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="h-9 px-3"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Desktop: Filter Header */}
                <div className="hidden sm:flex items-center justify-between">
                  <h3 className="text-sm font-medium">Filtry wyszukiwania</h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="h-8 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Wyczyść filtry
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter Selects - Responsive Layout */}
              <div className={`space-y-2 sm:space-y-0 ${showFilters || 'hidden sm:block'}`}>
                <div className="flex gap-5">
                  {/* Branża Select */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground sm:hidden">
                      Branża
                    </label>
                    <Select
                      value={selectedBranza}
                      onValueChange={setSelectedBranza}
                    >
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Wybierz branżę" />
                      </SelectTrigger>
                      <SelectContent>
                        {branzaOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === "X" ? "Wszystkie branże" : option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Segment Select */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground sm:hidden">
                      Segment
                    </label>
                    <Select
                      value={selectedSegment}
                      onValueChange={setSelectedSegment}
                    >
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Wybierz segment" />
                      </SelectTrigger>
                      <SelectContent>
                        {segmentOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === "Y" ? "Wszystkie segmenty" : option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Region Select */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground sm:hidden">
                      Region
                    </label>
                    <Select
                      value={selectedRegion}
                      onValueChange={setSelectedRegion}
                    >
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Wybierz region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regionOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === "Z" ? "Wszystkie regiony" : option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs font-medium text-muted-foreground">
                    Aktywne:
                  </span>
                  {searchQuery && (
                    <span className="text-xs px-2 py-0.5 sm:py-1 bg-background rounded-md border">
                      {searchQuery}
                    </span>
                  )}
                  {selectedBranza !== "X" && (
                    <span className="text-xs px-2 py-0.5 sm:py-1 bg-background rounded-md border">
                      {selectedBranza}
                    </span>
                  )}
                  {selectedSegment !== "Y" && (
                    <span className="text-xs px-2 py-0.5 sm:py-1 bg-background rounded-md border">
                      {selectedSegment}
                    </span>
                  )}
                  {selectedRegion !== "Z" && (
                    <span className="text-xs px-2 py-0.5 sm:py-1 bg-background rounded-md border">
                      {selectedRegion}
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-md font-medium ml-auto">
                    {filteredUsers.length}
                  </span>
                </div>
              )}

              {/* Results Section */}
              {filteredUsers.length === 0 ? (
                <div className="py-8 sm:py-12 text-center">
                  <UserCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
                    Nie znaleziono użytkowników
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 px-4">
                    {hasActiveFilters 
                      ? "Spróbuj dostosować kryteria wyszukiwania lub wyczyść filtry" 
                      : "Zacznij od dodania nowego użytkownika"}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Wyczyść filtry
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <div className="max-h-[480px] overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 z-10 bg-background">
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 text-sm font-medium">Nazwa</th>
                          <th className="text-left p-3 text-sm font-medium ">Segment</th>
                          <th className="text-left p-3 text-sm font-medium">Adres</th>
                          <th className="text-left p-3 text-sm font-medium ">Województwo</th>
                          <th className="text-right p-3 text-sm font-medium ">Akcje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr 
                            key={user.id} 
                            className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => setSelectedUser(user)}
                          >
                            <td className="p-3 text-sm max-w-[200px] break-words">
                              {user.nazwa}
                            </td>
                            <td className="p-3 text-sm">
                              <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                {user.segment}
                              </span>
                            </td>
                            <td className="p-3 text-sm max-w-[250px] break-words text-muted-foreground">
                              {user.adres}
                            </td>
                            <td className="p-3 text-sm">
                              {user.region}
                            </td>
                            <td className="p-3 text-sm" onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingUser(user.id)}
                                  className="h-8 w-8 p-0"
                                  title="Edytuj"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(user)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  title="Usuń"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Potwierdź usunięcie
            </AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć użytkownika{" "}
              <span className="font-semibold text-foreground">
                {userToDelete?.nazwa}
              </span>
              ? Ta operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default memo(UsersManagementPage)