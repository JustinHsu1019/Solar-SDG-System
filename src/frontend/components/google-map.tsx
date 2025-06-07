"use client"
import { useRef, useEffect } from "react"

interface GoogleMapProps {
  location?: string
  onLocationSelect?: (lat: number, lng: number) => void
}

export default function GoogleMap({ location, onLocationSelect }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!window.google || !mapRef.current) return

    const taiwanCenter = { lat: 23.69781, lng: 120.960515 }
    const map = new window.google.maps.Map(mapRef.current, {
      center: taiwanCenter,
      zoom: 8,
    })

    map.addListener("click", (e: any) => {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      if (markerRef.current) {
        markerRef.current.setPosition({ lat, lng })
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map,
        })
      }
      onLocationSelect?.(lat, lng)
    })
  }, [onLocationSelect])

  return <div ref={mapRef} style={{ width: "100%", height: 400 }} />
}
