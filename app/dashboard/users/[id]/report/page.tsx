"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Home, Printer, WifiOff } from "lucide-react"
import { useUsers } from "@/lib/useUsers"
import { Alert, mockUser, User } from "@/lib/types"
import useOnlineStatus from "@/lib/useOnlineStatus"
import Link from "next/link"
import Alerts  from "@/app/components/dashboard/global/alerts"
import { useUserListener } from "@/lib/useUserListener"

export default function ComprehensiveUserReport() {
  const router = useRouter()
  const {id} = useParams()
  const [user, setUser] = useState<User>(mockUser)
  useUserListener();
  const { isLoaded, users } = useUsers()
  const [alerts,setAlerts]=useState<Alert[]>([])
  const [fontSize, setFontSize] = useState<number>(11)
  const increaseFont = () => setFontSize(prev => Math.min(prev + 1, 25))
  const decreaseFont = () => setFontSize(prev => Math.max(prev - 1, 5))
  useEffect(() => {
    const user = users.find(u => u.id === id)
    if(user) setUser(user)
  }, [users, id])
  
  const handlePrint = (): void => {
    window.print()
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
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .print-page-break {
            page-break-after: always;
          }
          
          * {
            box-shadow: none !important;
          }
        }
      `}</style>
      <Alerts alerts={alerts}/ >
      {/* Screen View */}
      <div className="print:hidden min-h-screen bg-linear-to-br">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Raport Klienta</h1>
              <p className="text-muted-foreground mt-1">Pełny raport z wszystkimi informacjami</p>
            </div>
            <div className="flex gap-2">
          <Link href="/dashboard/add_user" className="mt-2" ><Home className="w-6 h-6"/></Link>
          <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={decreaseFont}>-</Button>
                <input
                  type="number"
                  min={8}
                  max={20}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-16 border rounded px-2 py-1 text-center"
                />
                <Button variant="outline" size="icon" onClick={increaseFont}>+</Button>
              </div>

              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Drukuj
              </Button>
            </div>
          </div>

          <Card className="lg:p-8">
            <div id="pdf-content" className="pdf-export">
              <ReportContent user={user}fontSize={fontSize} />
            </div>
          </Card>
        </div>
      </div>

      {/* Print View */}
      <div className="hidden print:block">
        <ReportContent user={user} fontSize={fontSize} />
      </div>
    </>
  )
}

interface ReportContentProps {
  user: User
  fontSize:number
}

function ReportContent({ user,fontSize }: ReportContentProps) {
  return (
    <div className="bg-white text-black p-1" style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#1c1e21'
    }}>
      {/* Header with Company Name */}
      <div className="print-section border-b-2 border-black pb-1 mb-1">
        <h1 className="text-xl font-bold text-center">{user.nazwa}</h1>
      </div>

      {/* Basic Info Grid */}
      <div className="print-section border-b-2 border-black pb-1 mb-1">
        <div className="grid grid-cols-2 gap-x-8 ">
          <div className=" ">
            <p><span className="font-semibold">NIP:</span> {user.NIP}</p>
            <p><span className="font-semibold">Adres:</span> {user.adres}</p>
            <p><span className="font-semibold">Branża:</span> {user.branza.toString().replace(/,/g,", ")}</p>
            <p><span className="font-semibold">Region:</span> {user.region}</p>
          </div>
          <div className=" ">
            <p><span className="font-semibold">Telefon:</span> {user.phone}</p>
            <p><span className="font-semibold">Email:</span> {user.email}</p>
            <p><span className="font-semibold">WWW:</span> {user.www || '-'}</p>
            <p><span className="font-semibold">Segment:</span> {user.segment}</p>
          </div>
        </div>
      </div>

      {/* Opis */}
      <div className="print-section border-b-2 border-black pb-1 mb-1">
        {user.listaOsobKontaktowych.length === 0 ? (
          <p className={`text-[${fontSize}px] italic text-gray-600`}>Brak osób kontaktowych</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ maxWidth: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr className="">
                  <th className="text-left  px-2 font-semibold" style={{ width: '15%' }}>Imię</th>
                  <th className="text-left  px-2 font-semibold" style={{ width: '15%' }}>Nazwisko</th>
                  <th className="text-left  px-2 font-semibold" style={{ width: '20%' }}>Stanowisko</th>
                  <th className="text-left  px-2 font-semibold" style={{ width: '20%' }}>Telefon</th>
                  <th className="text-left  px-2 font-semibold" style={{ width: '20%' }}>Telefon 2</th>
                  <th className="text-left  px-2 font-semibold" style={{ width: '30%' }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {user.listaOsobKontaktowych.map((person) => {
                  const [firstName, ...lastNameParts] = person.imieNazwisko.split(' ')
                  const lastName = lastNameParts.join(' ')
                  return (
                    <tr key={person.id} className="border-b border-gray-300">
                      <td className="px-2 break-words">{firstName}</td>
                      <td className="px-2 break-words">{lastName}</td>
                      <td className="px-2 break-words">{person.stanowisko}</td>
                      <td className="px-2 break-words">{person.tel1 }</td>
                      <td className="px-2 break-words">{person.tel2}</td>
                      <td className="px-2 break-words ">{person.email}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="print-section border-b-2 border-black pb-1 mb-1">
        <p className="font-bold mb-2">Opis:</p>
        <pre className={` leading-relaxed text-[${fontSize}px]`}>{user.opis || 'Brak opisu'}</pre>
      </div>

      {/* Lista osób kontaktowych */}
    

      {/* Dodatkowe informacje */}
      <div className="print-section border-b-2 border-black pb-1 mb-1">
        {user.tasks.map((e,idx)=>{
          return       <div key={idx} className={`print-section ${idx+1==user.tasks.length?"":"border-b-2 border-black pb-1 mb-1"} `}>
            <p className="  mb-2 font-bold">Zadanie {idx+1}: {e.zadanie}</p>
            <pre className={`text-[${fontSize}px] leading-relaxed whitespace-pre-wrap break-all`}>
            {e.opis}
          </pre>

          </div>
        })}
      </div>


      {/* Potencjał */}
     
      {/* Sprzedaż Section */}
      <div className="print-section pb-1">
        <p className="font-semibold mb-1">Sprzedaż:</p>
        <div className="grid grid-cols-1     gap-4">
            <pre className={`text-[${fontSize}px] whitespace-pre-line leading-relaxed`}>{user.sprzedaz || ''}</pre>
          <div className="border-2    min-h-[100px]">
            <div className="">
              {Array.isArray(user.zdjecie) && user.zdjecie.map((image, idx) => (
                
                  <img 
                  key={idx}
                    src={image} 
                    alt={`Zdjęcie ${idx + 1}`}
                    className=" object-cover "
                  />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="print-section border-b-2 border-black  ">
        <p className="font-bold ">Potencjał:</p>
        {user.produkty.length === 0 ? (
          ""
            ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ maxWidth: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr className="">
                  <th className="text-left  px-2 font-semibold" style={{ width: '40%' }}>Produkt</th>
                  <th className="text-left  px-2 font-semibold" style={{ width: '30%' }}>Zużycie miesięczne (kg)</th>
                  <th className="text-left  px-2 font-semibold" style={{ width: '30%' }}>Konkurencja/Opis</th>
                </tr>
              </thead>
              <tbody>
                {user.produkty.map((product) => (
                  product.subOptions.map((option, id) => (
                    option.name.length>0?<tr key={id} className="border-b border-gray-300">
                      <td className=" px-2 break-words">{product.name} {option.name}</td>
                      <td className=" px-2 break-words">{option.zuzycie || '-'}</td>
                      <td className=" px-2 break-words">{option.konkurencja || '-'}</td>
                    </tr>:""
                  ))
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}