"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { AnimatePresence, motion } from "framer-motion"
import { Alert, getAlertStyles } from "@/lib/types"
import Alerts, { showAlert } from "@/app/components/dashboard/global/alerts"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate password reset email - in production, this would send an email
   try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/reset-password`,
        handleCodeInApp: true,
      })
      showAlert("Email Wysłany!", "success",alerts,setAlerts)
      setEmail("")
    } catch (error) {
      showAlert("Błąd podczas wysyłania emaila", "error",alerts,setAlerts)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center relative justify-center bg-muted/30 p-4">
        <Alerts alerts={alerts}/ >
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {!isSubmitted ? (
            <>
              <CardTitle className="text-3xl font-bold tracking-tight">Resetowanie hasła</CardTitle>
              <CardDescription className="text-base">
                Podaj swój adres email a wyślemy ci link do zmiany hasła
              </CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Sprawdź swojego emaila (jeżeli nic nie widzisz sprawdź folder spam)</CardTitle>
              <CardDescription className="text-base">Wysłaliśmy link do zmiany hasła na adres: {email}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSubmitted ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Wysyłanie..." : "Wyślij link"}
                </Button>
              </form>

              <Link
                href="/auth/login"
                className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Powrót do logowania
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Nie otrzymałeś kodu? Sprawdź folder spam
                <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline font-medium">
                  Spróbuj ponownie
                </button>
              </p>

              <Link href="/auth/login">
                <Button variant="outline" className="w-full h-11 bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Powrót do logowania
                  </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
