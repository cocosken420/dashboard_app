"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (isAuthenticated === "true") {
      router.push("/dashboard")
    } else {
      router.push("/auth/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
