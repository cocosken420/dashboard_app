"use client"

import type React from "react"

import { useState, useEffect, startTransition } from "react"
import Link from "next/link"
import {  useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {  Moon, Sun, LogOutIcon, Plus } from "lucide-react"
import { useTheme } from "./theme-provider"
import { auth } from "@/lib/firebase"
import { clearUserCookie, getUserCookie } from "@/lib/userCookies"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const [email,setEmail]= useState<string|null>(null);
  const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const cookieUser = getUserCookie()
        if(!cookieUser||!cookieUser.email||!cookieUser.id) router.push("/auth/login")
        startTransition(() => {
            setIsMounted(true)
            setEmail(cookieUser!.email)
    })
    }, [])
    const handleLogout = async () => {
      await auth.signOut()
      clearUserCookie();
      router.push("/auth/login")
    }
  
  if(!isMounted){
    return  <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
  }
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">

          <div className="flex-1" />
        <div className="text-sm text-muted-foreground  sm:block"><Link href="/dashboard/add_product" className="flex flex-row gap-2 items-center">Dodaj Produkt <Plus className="h-5 w-5 "/>  </Link></div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <div className="text-sm text-muted-foreground hidden sm:block">{email}</div>
            <LogOutIcon className="w-4 h-4" onClick={handleLogout} />
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
