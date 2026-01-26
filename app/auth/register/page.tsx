"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { addNewWorkerToDb, checkLoginMethod, getUserByCredential, updateEmailVerification, updateUserSignInMethod } from "@/lib/dbActions"
import { Alert, EmployeeInterface } from "@/lib/types"
import {  Eye, EyeClosed } from "lucide-react"
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, User } from "firebase/auth"
import { auth, provider } from "@/lib/firebase"
import { useTheme } from "@/app/components/dashboard/global/theme-provider"
import { clearUserCookie, saveUserCookie } from "@/lib/userCookies"
import Alerts, { showAlert } from "@/app/components/dashboard/global/alerts"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogTitle, AlertDialogContent } from "@radix-ui/react-alert-dialog";
import { AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog"
interface RegisterFormData {
  name:string
  email:string
  phone:string
  password:string
  confirmPassword:string
}
const initialFormData: RegisterFormData = {
    name: "",
    email: "",
    phone: "+48 ",
    password: "",
    confirmPassword: "",
}
export default function RegisterPage() {
  const router = useRouter()
  const {theme }= useTheme()
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData)
  const [showDialog,setShowDialog]=useState<boolean>(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [code,setcode]=useState<string>("")
  const [registeredUser,setRegisteredUser]=useState<User>()
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    clearUserCookie()
  }, [])

  const checkFormData = ()=> {
    if(!formData||!formData?.name || !formData?.email || !formData?.phone || !formData?.password || !formData?.confirmPassword){
        showAlert("Wypełnij wszystkie pola! ","error",alerts,setAlerts)
        return false;
    }
    const emailReplaced =formData.email.replace(/\s+/g, "").trim()
    const passwordReplaced =formData.password.replace(/\s+/g, "").trim()
    if((emailReplaced.length<8||!emailReplaced.includes("@")||!emailReplaced.includes("."))) {showAlert("Nieprawidłowy format adresu email!","error",alerts,setAlerts); return false}
    if((emailReplaced.length<8)) {showAlert("Email jest za krótki (minimum 8 znaków)","error",alerts,setAlerts); return false}
    if(passwordReplaced.length<8) {showAlert("Hasło jest za krótkie (minimum 8 znaków)","error",alerts,setAlerts); return false}
    if (formData.password !== formData.confirmPassword) {showAlert("Hasła nie są zgodne!", "error", alerts, setAlerts);return false}
    if (formData.phone.length < 4) {showAlert("Nieprawidłowy numer telefonu", "error", alerts, setAlerts);return false}
    return true
  }
  const normalize = (value?: string) =>
    value?.replace(/\s+/g, "").trim() || ""
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!checkFormData()) return
    const email = normalize(formData.email.toLowerCase())
  
    // 🔹 Pre-check: user already registered with password
    const alreadyRegistered = await checkLoginMethod(email, "password")
    if (alreadyRegistered) {
      showAlert(
        "Jesteś już zarejestrowany. Zaloguj się",
        "warning",
        alerts,
        setAlerts
      )
  
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
  
      return
    }
    const existingUser = await getUserByCredential("email", email)
  
    if (existingUser?.authMethod === "google") {
      showAlert(
        "To konto jest powiązane z logowaniem poprzez Google. Zaloguj się przez Google",
        "warning",
        alerts,
        setAlerts
      )
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
  
      return
    }
    setIsLoading(true)
  
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        normalize(formData.password)
      )
      setRegisteredUser(userCredential.user)
      setShowDialog(true)
       
      const uid = userCredential.user.uid
      // 🔹 Save user in DB
      try {
        await addNewWorkerToDb({
          id: uid,
          authMethod: "password",
          email,
          name: formData.name.trim(),
          products:[],
          phone: formData.phone.trim(),
          veryfiedEmail:false
        })
      } catch {
        showAlert(
          "Błąd podczas zapisywania użytkownika. Spróbuj ponownie później",
          "error",
          alerts,
          setAlerts
        )
        return
      }
  
    } catch (error) {
      const user = await getUserByCredential("email",email.toLowerCase().trim())
      if(user?.authMethod=="google") showAlert("To konto jest powiązane z logowaniem poprzez google. Zaloguj się przez google","warning",alerts,setAlerts)
      else showAlert("Nie udało się zalogować!","error",alerts,setAlerts)
      return null
    } finally {
      setIsLoading(false)
    }
  }
  const handleGoogleRegister = async() => {
    if (!auth || !provider) return
  
    setIsLoading(true)
  
    try {
      const result = await signInWithPopup(auth, provider)
      const firebaseUser = result.user
  
      
      if (!firebaseUser || !firebaseUser.email) {
        showAlert(
          "Błąd podczas logowania użytkownika. Spróbuj ponownie później",
          "error",
          alerts,
          setAlerts
        )
        return
      }
      const email = normalize(firebaseUser.email)
      const userId = normalize(firebaseUser.uid)
  
      // 🔹 Check if user already exists
      const existingUser = await getUserByCredential("id", userId)
  
      if (existingUser) {
        // 🔹 Always update sign-in method to google
        await updateUserSignInMethod(userId, "google")
  
        const refreshedUser = await getUserByCredential("id", userId)
        if (refreshedUser) {
          saveUserCookie(refreshedUser)
        }
  
        router.push("/dashboard/add_user")
        return
      }
  
      // 🔹 Create new user
      const newUser = {
        id: userId,
        email,
        name: normalize(firebaseUser.displayName!),
        phone: normalize(firebaseUser.phoneNumber!),
        veryfiedEmail:false,
        authMethod:"google",
        products:[],
      } as EmployeeInterface
  
      try {
        await addNewWorkerToDb(newUser)
        saveUserCookie(newUser)
        showAlert("Zapisano użytkownika", "success", alerts, setAlerts)
      } catch {
        showAlert(
          "Błąd podczas zapisywania użytkownika",
          "error",
          alerts,
          setAlerts
        )
      }
  
      router.push("/dashboard/add_user")
    } catch (error) {
      showAlert(
        "Błąd podczas logowania przez Google",
        "error",
        alerts,
        setAlerts
      )
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  async function confirmEmail(){
    if(code.trim()==process.env.NEXT_PUBLIC_verify_token?.trim()){
      showAlert("Pomyślnie zweryfikowano email!","success",alerts,setAlerts)
      await updateEmailVerification(registeredUser!.uid)
      router.push("/auth/login")
      return;
    }
    showAlert("Nieprawidłowy kod.","error",alerts,setAlerts)
  }
  return (
    <div className="min-h-screen flex items-center relative justify-center bg-muted/30 p-4">
        <Alerts alerts={alerts}/ >
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        {showDialog?<div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <AlertDialogContent className="w-[95%] max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-secondary to-secondary/80 p-6 shadow-2xl">
      
      <AlertDialogHeader>
        <AlertDialogTitle className="text-xl font-semibold text-center">
          Potwierdź swój adres email
        </AlertDialogTitle>

        <AlertDialogDescription className="mt-2 text-center text-muted-foreground">
        Podaj kod aby potwierdzić twój adres email.
        Wklej <span className="font-medium text-foreground">długi kod weryfikacyjny</span> aby kontynuować.
        </AlertDialogDescription>
      </AlertDialogHeader>

      {/* CODE INPUT */}
      <div className="mt-6 space-y-2">
        <label className="text-sm text-muted-foreground">
          Kod weryfikacyjny
        </label>

        <input
          type="text"
          placeholder="e.g. 8F2A-91KD-92LS-0XQ9"
          className="
            w-full rounded-xl border border-white/10 bg-background/60
            px-4 py-3 text-sm tracking-widest text-foreground
            outline-none transition
            focus:border-primary focus:ring-2 focus:ring-primary/30
          "
          value={code}
          onChange={(e) => setcode(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <AlertDialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">

        <div className="flex gap-2">

          <AlertDialogAction
            disabled={!code}
            onClick={confirmEmail}
            className="
              rounded-xl bg-primary px-6
              text-primary-foreground
              hover:bg-primary/90
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Potiwerdź
          </AlertDialogAction>
        </div>
      </AlertDialogFooter>

    </AlertDialogContent>
  </div>:""}
</AlertDialog>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Stwórz nowe konto</CardTitle>
          <CardDescription className="text-base">Wypełnij formularz aby sie zarejestrować</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 bg-transparent"
            onClick={handleGoogleRegister}
            disabled={isLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Zarejestruj się przez Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Lub</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                Imię i nazwisko
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Wpisz swoje imie i nazwisko"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Wpisz swój email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.trim().slice(0,50) })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Numer telefonu
              </label>
              <Input
                id="email"
                type="tel"
                placeholder="Wpisz swój numer telefonu"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.slice(0,15) })}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Hasło
              </label>
              <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Wpisz silne hasło"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value.trim().slice(0,30) })}
                required
                className="h-11"
              />
               <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-white  transition-colors"
            >
              {showPassword ? <EyeClosed className={`${theme=="light"?"text-black":"text-white"} w-5 h-5`} /> : <Eye className={`${theme=="light"?"text-black":"text-white"} w-5 h-5`} />}
            </button>
            </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                Potwierdź hasło
              </label>
              <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Potwierdź swoje hasło"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value.trim().slice(0,30) })}
                required
                className="h-11"
              />
              <button
              type="button"
              onClick={() => setConfirmShowPassword(!showConfirmPassword)}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-white  transition-colors"
            >
              {showConfirmPassword ? <EyeClosed className={`${theme=="light"?"text-black":"text-white"} w-5 h-5`} /> : <Eye className={`${theme=="light"?"text-black":"text-white"} w-5 h-5`} />}
            </button>
            </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Rejestrowanie..." : "Zarejestruj się"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Masz już konto?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Zaloguj sie!
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}