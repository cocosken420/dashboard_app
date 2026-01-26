"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Alert, getAlertStyles } from "@/lib/types"
import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react"
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useTheme } from "@/app/components/dashboard/global/theme-provider"
import Alerts, { showAlert } from "@/app/components/dashboard/global/alerts"

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

const initialFormData: ResetPasswordFormData = {
  password: "",
  confirmPassword: "",
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setConfirmShowPassword] = useState(false)
  const [formData, setFormData] = useState<ResetPasswordFormData>(initialFormData)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [oobCode, setOobCode] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")

 

  // Verify the oobCode when component mounts
  useEffect(() => {
    const code = searchParams.get('oobCode')
    
    if (!code) {
      showAlert("Brak kodu resetowania hasła", "error",alerts,setAlerts)
      setTimeout(() => {
        router.push("/auth/forgot-password")
      }, 2000)
      return
    }

    setOobCode(code)
    verifyCode(code)
  }, [searchParams, router])

  const verifyCode = async (code: string) => {
    setIsVerifying(true)
    try {
      // Verify the password reset code
      const userEmail = await verifyPasswordResetCode(auth, code)
      setEmail(userEmail)
      setIsVerifying(false)
    } catch (error) {
      setIsVerifying(false)
        showAlert("Nieprawidłowy lub użyty link resetowania", "error",alerts,setAlerts)
      setTimeout(() => {
        router.push("/auth/forgot_password")
      }, 2000)
    }
  }

  const checkFormData = () => {
    if (!formData?.password || !formData?.confirmPassword) {
      showAlert("Wypełnij wszystkie pola!", "error",alerts,setAlerts)
      return false
    }

    if (formData.password.length < 8) {
      showAlert("Hasło musi mieć co najmniej 8 znaków", "error",alerts,setAlerts)
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert("Hasła nie są zgodne!", "error",alerts,setAlerts)
      return false
    }

    return true
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!checkFormData() || !oobCode) return

    setIsLoading(true)
    try {
      // Confirm the password reset
      await confirmPasswordReset(
        auth,
        oobCode,
        formData.password.trim()
      )
      
      showAlert("Hasło zostało pomyślnie zresetowane!", "success",alerts,setAlerts)
      
      setTimeout(() => {
        router.push("/auth/login")
      }, 1500)
    } catch (error ) {
        showAlert("Nieprawidłowy lub użyty link resetowania", "error",alerts,setAlerts)
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Weryfikacja linku resetowania...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center relative justify-center bg-muted/30 p-4">
              <Alerts alerts={alerts}/ >
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Resetowanie hasła</CardTitle>
          <CardDescription className="text-base">
            {email && `Resetowanie hasła dla: ${email}`}
          </CardDescription>
          <CardDescription className="text-sm">
            Wprowadź nowe hasło dla swojego konta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Nowe hasło
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Wpisz nowe hasło"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value.trim().slice(0, 30) })}
                  required
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 right-3 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className={`${theme === "light" ? "text-black" : "text-white"} w-5 h-5`} />
                  ) : (
                    <Eye className={`${theme === "light" ? "text-black" : "text-white"} w-5 h-5`} />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Hasło musi mieć co najmniej 6 znaków
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                Potwierdź nowe hasło
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Potwierdź nowe hasło"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value.trim().slice(0, 30) })}
                  required
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setConfirmShowPassword(!showConfirmPassword)}
                  className="absolute top-1/2 -translate-y-1/2 right-3 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className={`${theme === "light" ? "text-black" : "text-white"} w-5 h-5`} />
                  ) : (
                    <Eye className={`${theme === "light" ? "text-black" : "text-white"} w-5 h-5`} />
                  )}
                </button>
              </div>
            </div>

            <Button 
              onClick={handleResetPassword} 
              className="w-full h-11" 
              disabled={isLoading}
            >
              {isLoading ? "Resetowanie hasła..." : "Zresetuj hasło"}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Pamiętasz hasło?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Zaloguj się
              </Link>
            </p>
            <p>
              Nie otrzymałeś linku?{" "}
              <Link href="/auth/forgot-password" className="text-primary hover:underline font-medium">
                Wyślij ponownie
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}