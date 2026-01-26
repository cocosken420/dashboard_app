"use client"
import { useEffect, useRef, useMemo } from "react"
import { MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { User, LeafletMap, LeafletMarker } from "@/lib/types"
import { RotateCw } from "lucide-react"
import { useState } from "react"
interface InteractiveMapProps {
  users: User[]
}

const InteractiveMap = ({ users }: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarker[]>([])
const [refreshKey, setRefreshKey] = useState(0)

const handleRefresh = () => {
  const map = mapInstanceRef.current
  if (!map) return

  // Force Leaflet to recalculate layout
  map.invalidateSize()

  // Trigger marker re-render
  setRefreshKey(prev => prev + 1)
}
  // Filter valid users with proper lat/lng
  const validUsers = useMemo(
    () =>
      users.filter(
        u =>
          u.lat !== undefined &&
          u.lng !== undefined &&
          !isNaN(+u.lat) &&
          !isNaN(+u.lng) &&
          +u.lat >= -90 &&
          +u.lat <= 90 &&
          +u.lng >= -180 &&
          +u.lng <= 180
      ),
    [users]
  )

  // Update markers whenever validUsers change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const L = window.L

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add new markers
    validUsers.forEach(user => {
      const lat = Number(user.lat)
      const lng = Number(user.lng)
      if (isNaN(lat) || isNaN(lng)) return

      const marker = L.marker([lat, lng]).addTo(map)
      marker.bindTooltip(
        `<div class="user-label">${user.nazwa}</div>`,
        {
          permanent: true,
          direction: "top",
          offset: [0, -14],
          opacity: 1,
          interactive: true,
          className: "user-tooltip",
        }
      )
      marker.on("click", () => {
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
          "_blank"
        )
      })
      markersRef.current.push(marker)
    })

    // Adjust map view
    if (markersRef.current.length === 0) return
    
    // Helper function to extract lat/lng from getLatLng result
    // Leaflet's getLatLng can return either [lat, lng] array or {lat, lng} object
    const getLatLngArray = (latLng: [number, number] | { lat: number; lng: number }): [number, number] => {
      if (Array.isArray(latLng)) {
        return latLng
      }
      // Handle Leaflet LatLng object
      if (latLng && typeof latLng === 'object' && 'lat' in latLng && 'lng' in latLng) {
        return [latLng.lat, latLng.lng]
      }
      // Fallback (shouldn't happen, but TypeScript needs it)
      throw new Error('Invalid lat/lng format')
    }
    
    if (markersRef.current.length === 1) {
      // For single user, show wider view (lower zoom) instead of focusing closely
      const latLng = markersRef.current[0].getLatLng()
      const [lat, lng] = getLatLngArray(latLng as [number, number] | { lat: number; lng: number })
      map.setView([lat, lng], 8) // Lower zoom for wider view
    } else {
      // Check if markers have different locations
      const locations = markersRef.current.map(m => {
        const latLng = m.getLatLng()
        return getLatLngArray(latLng as [number, number] | { lat: number; lng: number })
      })
      const uniqueLocations = new Set(locations.map(([lat, lng]) => `${lat},${lng}`))
      
      // If all markers are at the same location, show wider view
      if (uniqueLocations.size === 1) {
        const [lat, lng] = locations[0]
        map.setView([lat, lng], 8) // Lower zoom for wider view
        return
      }
      
      // Try to fit bounds with multiple markers
      try {
        const group = L.featureGroup(markersRef.current)
        const bounds = group.getBounds()
        
        // Validate bounds by checking if they have valid coordinates
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()
        
        if (
          bounds.isValid &&
          bounds.isValid() &&
          sw &&
          ne &&
          typeof sw.lat === 'number' &&
          typeof sw.lng === 'number' &&
          typeof ne.lat === 'number' &&
          typeof ne.lng === 'number' &&
          !isNaN(sw.lat) &&
          !isNaN(sw.lng) &&
          !isNaN(ne.lat) &&
          !isNaN(ne.lng) &&
          sw.lat !== ne.lat &&
          sw.lng !== ne.lng
        ) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
        } else {
          // Fallback: show first marker with wider view
          const [lat, lng] = locations[0]
          map.setView([lat, lng], 8) // Lower zoom for wider view
        }
      } catch {
        // Fallback: show first marker if fitBounds fails with wider view
        const [lat, lng] = locations[0]
        map.setView([lat, lng], 8) // Lower zoom for wider view
      }
    }
  }, [validUsers,refreshKey])

  // Load Leaflet CSS and JS dynamically and initialize map
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return
      const L = window.L

      const map = L.map(mapRef.current, {
        zoomControl: true,
      }).setView([52.2297, 21.0122], 6)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 15,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      mapInstanceRef.current = map
    }
    const css = document.createElement("link")
    css.rel = "stylesheet"
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(css)

    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.onload = initMap
    document.body.appendChild(script)

    return () => {
      mapInstanceRef.current?.remove()
    }
  }, [])

  return (
    <div className="lg:w-full">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lokalizacja</h1>
          <p className="text-muted-foreground mt-2">
            Mapa klientów ({validUsers.length})
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted transition"
          title="Odśwież mapę"
        >
          <RotateCw className="w-4 h-4" />
          Odśwież
        </button>
      </div>
      <Card className="mt-6">
        <CardContent className="p-0">
          {validUsers.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              Brak klientów z lokalizacją
            </div>
          )}

          <div
            ref={mapRef}
            className="w-full h-[600px] rounded-lg"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default InteractiveMap
