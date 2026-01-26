"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, ArrowLeft, Search, AlertCircle } from "lucide-react"

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br   flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            {/* 404 Icon */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-primary/10 rounded-full animate-pulse" />
              </div>
              <div className="relative flex items-center justify-center">
                <AlertCircle className="h-24 w-24 text-primary" />
              </div>
            </div>

            {/* Error Code */}
            <div>
              <h1 className="text-8xl font-bold text-primary mb-2">404</h1>
              <h2 className="text-3xl font-semibold tracking-tight mb-3">
                Strona nie znaleziona
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona.
              </p>
            </div>

            {/* Suggestions */}
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Możliwe przyczyny:
              </p>
              <div className="grid gap-3 text-left max-w-md mx-auto">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">
                    Nieprawidłowy adres URL został wpisany w przeglądarce
                  </p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">
                    Link, który kliknąłeś jest uszkodzony lub nieaktualny
                  </p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">
                    Strona została usunięta lub przeniesiona
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="h-11 px-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Wróć
              </Button>
              <Button
                onClick={() => router.push("/dashboard/add_user")}
                className="h-11 px-6"
              >
                <Home className="h-4 w-4 mr-2" />
                Strona główna
              </Button>
             
            </div>

            {/* Help Text */}
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Potrzebujesz pomocy?{" "}
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-primary hover:underline font-medium"
                >
                  Skontaktuj się z administratorem
                </button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}