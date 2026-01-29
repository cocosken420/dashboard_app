"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Edit2, Phone, Mail, Calendar, Package, Briefcase, Users, WifiOff, Home } from "lucide-react"
import { Alert, mockUser, User } from "@/lib/types"
import { useUsers } from "@/lib/useUsers"
import useOnlineStatus from "@/lib/useOnlineStatus"
import Link from "next/link"
import Alerts, { showAlert } from "@/app/components/dashboard/global/alerts"
import { getUserCookie } from "@/lib/userCookies"
import { useUserListener } from "@/lib/useUserListener"

// Mock types for demonstration


export default function EnhancedUserProfile() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User>(mockUser)
  useUserListener();
  const { isLoaded, users } = useUsers()
  const [alerts,setAlerts]=useState<Alert[]>([])
 
  
  console.log(users.length)
  useEffect(() => {
    const user = users.find(u => u.id === params.id)
    if(user) setUser(user)
  }, [users])
  const handleEditToggle = () => {
    router.push(`/dashboard/add_user?editing=true&userID=${user.id}`)
  }

  const handleGenerateReport = () => {
    router.push(`/dashboard/users/${user.id}/report`)
  }
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
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
<div className="min-h-screen czcionka bg-gradient-to-br p-3 sm:p-4 md:p-6 overflow-x-hidden">
<Alerts alerts={alerts}/ >
  <div className=" mx-auto space-y-4 sm:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-0 sm:flex items-center sm:items-start sm:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <div className="flex-1 min-w-0 ">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-all [overflow-wrap:anywhere]">
              {user.nazwa}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 break-all [overflow-wrap:anywhere]">
              {user.email}
            </p>
          </div>
          <Link href="/dashboard/add_user" className="mt-2" ><Home className="w-8 h-8"/></Link>
          <Button
            onClick={handleGenerateReport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 sm:h-11 text-sm sm:text-base"
          >
            <FileText className="h-4 w-4" />
            <span className="sm:inline">Generuj Raport</span>
          </Button>
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
          {/* Basic Information */}
          <Card className="shadow-md">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl">Podstawowe Informacje</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Szczegóły klienta
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditToggle}
                  className="h-8 w-8 shrink-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase">Nazwa</label>
                <p className="text-sm sm:text-base font-medium mt-1 break-all [overflow-wrap:anywhere]">{user.nazwa}</p>
              </div>
              
                <div className="min-w-0">
                  <label className="text-xs font-medium text-muted-foreground uppercase">NIP</label>
                  <p className="text-sm sm:text-base font-medium mt-1 break-all [overflow-wrap:anywhere]">{user.NIP}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Adres</label>
                  <p className="text-sm sm:text-base font-medium mt-1 break-all [overflow-wrap:anywhere]">{user.adres}</p>
                </div>
              
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm sm:text-base font-medium break-all [overflow-wrap:anywhere]">{user.phone}</p>
              </div>
              
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm sm:text-base font-medium break-all [overflow-wrap:anywhere] overflow-wrap-anywhere">{user.email}</p>
              </div>
              
              {user.www && (
                <div className="min-w-0">
                  <label className="text-xs font-medium text-muted-foreground uppercase">WWW</label>
                  <a 
                    href={user.www} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm sm:text-base font-medium text-blue-600 hover:underline block mt-1 break-all [overflow-wrap:anywhere] overflow-wrap-anywhere"
                  >
                    {user.www}
                  </a>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 ">
                <div className="min-w-0">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Branża</label>
                  <p className="text-sm sm:text-base font-medium mt-1 break-all [overflow-wrap:anywhere]">{user.branza.toString().replace(/,/g,", ")}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Segment</label>
                  <p className="text-sm sm:text-base font-medium mt-1 break-all [overflow-wrap:anywhere]">{user.segment}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Region</label>
                  <p className="text-sm sm:text-base font-medium mt-1 break-all [overflow-wrap:anywhere]">{user.region}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Persons List */}
          <Card className="shadow-md  grid-full overflow-y-auto">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5" />
                Lista Osób Kontaktowych
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {user.listaOsobKontaktowych && (
                  <>{user.listaOsobKontaktowych.length} {user.listaOsobKontaktowych.length === 1 ? 'osoba' : 'osób'} kontaktowych</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.listaOsobKontaktowych && user.listaOsobKontaktowych.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">Brak osób kontaktowych</p>
              ) : (
                <table>
                  <thead>
                      <tr className="">
                      <th className="text-left  px-2 font-semibold" >Imię</th>
                      <th className="text-left  px-2 font-semibold" >Nazwisko</th>
                      <th className="text-left  px-2 font-semibold" >Stanowisko</th>
                      <th className="text-left  px-2 font-semibold" >Telefon</th>
                      <th className="text-left  px-2 font-semibold" >Telefon 2</th>
                      <th className="text-left  px-2 font-semibold" >Email</th>
                    </tr>
                  </thead>
                  <tbody>

                {user.listaOsobKontaktowych && user.listaOsobKontaktowych.map((person) => {
                  const [firstName, ...lastNameParts] = person.imieNazwisko.split(' ')
                  const lastName = lastNameParts.join(' ')
                  return (
                    <tr key={person.id} className="border-b  border-gray-300">
                      <td className="px-2 text-sm py-2  break-words">{firstName}</td>
                      <td className="px-2 text-sm py-2  break-words">{lastName}</td>
                      <td className="px-2 text-sm py-2  break-words">{person.stanowisko}</td>
                      <td className="px-2 text-sm py-2  break-words">{person.tel1 }</td>
                      <td className="px-2 text-sm py-2  break-words">{person.tel2}</td>
                      <td className="px-2 text-sm py-2  break-words ">{person.email}</td>
                    </tr>
                  )
                })}
                </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="lg:col-span-2 grid-full-2 shadow-md">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Opis</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs  sm:text-sm leading-relaxed whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
                {user.opis || "Brak opisu"}
              </pre>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="lg:col-span-2 shadow-md grid-full-2">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Package className="h-5 w-5" />
                Produkty
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {user.produkty.length} {user.produkty.length === 1 ? 'produkt' : 'produktów'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.produkty.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">Brak produktów</p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {user.produkty.map((product) => (
                    <div key={product.id} className="p-3 sm:p-4 border rounded-lg bg-card">
                      <h4 className="font-semibold text-base sm:text-lg mb-3 break-all [overflow-wrap:anywhere]">{product.name}</h4>
                      {product.subOptions.length > 0 && (
                        <div className="overflow-x-auto -mx-3 sm:mx-0">
                          <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                            <table className="min-w-full text-xs sm:text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left pb-2 pr-4 font-medium text-muted-foreground">Nazwa</th>
                                  <th className="text-left pb-2 px-4 font-medium text-muted-foreground">Zużycie miesięczne(kg)</th>
                                  <th className="text-left pb-2 pl-4 font-medium text-muted-foreground">Konkurencja/Opis</th>
                                </tr>
                              </thead>
                              <tbody>
                                {product.subOptions.map((option, idx) => (
                                  option.name.length>0?<tr key={idx} className="border-b last:border-0">
                                    <td className="py-2 pr-4 break-all [overflow-wrap:anywhere]">{product.name}{option.name}</td>
                                    <td className="py-2 px-4 break-all [overflow-wrap:anywhere]">{option.zuzycie}</td>
                                    <td className="py-2 pl-4 break-all [overflow-wrap:anywhere]">{option.konkurencja}</td>
                                  </tr>:""
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          

          {/* Tasks */}
          <Card className="lg:col-span-2 shadow-md grid-full-2">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="h-5 w-5" />
                Zadania
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.tasks.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">Brak zadań</p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {user.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 sm:p-4 border rounded-lg cursor-pointer transition-all hover:bg-accent active:scale-98"
                    >
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded bg-muted w-fit">
                              {task.data || "Brak daty"}
                            </span>
                            <h4 className="font-semibold text-sm sm:text-base break-all [overflow-wrap:anywhere]">{task.zadanie}</h4>
                          </div>
                          <pre className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
                            {task.opis || "Brak opisu"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales & Photos */}
          <Card className="lg:col-span-2 shadow-md grid-full-2">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Briefcase className="h-5 w-5" />
                Sprzedaż
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <pre className="text-xs sm:text-sm whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
                {user.sprzedaz || "Brak danych"}
              </pre>
              
              {/* Photos Section */}
              <div className="pt-4 border-t">
                <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Zdjęcia
                </h3>
                {user.zdjecie.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground">Brak Zdjęć</p>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Przesłane zdjęcia ({user.zdjecie.length})
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                      {Array.isArray(user.zdjecie)&&user.zdjecie.map((image, idx) => (
                        <div 
                          key={idx} 
                          className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 hover:shadow-lg cursor-pointer"
                        >
                          <img 
                            src={image} 
                            alt={`Zdjęcie ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <p className="text-white text-xs truncate">Zdjęcie {idx + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}