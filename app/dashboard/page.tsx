"use client"

import { useEffect } from "react"

export default function DashboardPage() {
  useEffect(()=>{
    window.location.href="/dashboard/add_user"
  }, [])

  return (
    <div></div>
  )
}
