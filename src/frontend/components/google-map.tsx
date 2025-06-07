"use client"
import { useRef, useEffect, useState } from "react"

declare global {
  interface Window {
    google: any
  }
}
interface GoogleMapProps {
  location?: string
  onLocationSelect?: (lat: number, lng: number, address?: string) => void
  onRoofAreaDetect?: (area: number, polygon?: { lat: number; lng: number }[]) => void
}

// 動態載入 Google Maps JS API
function loadGoogleMapsApi(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject("No window")
  if ((window as any).google && (window as any).google.maps) return Promise.resolve()
  if (document.getElementById("google-maps-script")) return new Promise((resolve) => {
    (window as any).initMap = () => resolve()
  })

  return new Promise((resolve, reject) => {
    (window as any).initMap = () => resolve()
    const script = document.createElement("script")
    script.id = "google-maps-script"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=drawing,geometry&callback=initMap`
    script.async = true
    script.defer = true
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function GoogleMap({ location, onLocationSelect, onRoofAreaDetect }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)
  const polygonRef = useRef<any>(null)
  const drawingManagerRef = useRef<any>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setApiError("Google Maps API 金鑰未設定，請檢查 .env 檔案。")
      return
    }
    loadGoogleMapsApi(apiKey)
      .then(() => {
        if (!window.google || !mapRef.current) return

        // 確保已載入 drawing library
        if (!window.google.maps.drawing) {
          setApiError("Google Maps drawing library 尚未載入，請確認 script 有加上 &libraries=drawing,geometry")
          return
        }

        if (!mapInstance) {
          const taiwanCenter = { lat: 23.69781, lng: 120.960515 }
          const map = new window.google.maps.Map(mapRef.current, {
            center: markerPos || taiwanCenter,
            zoom: 8,
            mapTypeId: window.google.maps.MapTypeId.SATELLITE,
          })
          setMapInstance(map)

          // 點擊地圖放置 marker 並取得地址
          map.addListener("click", (e: any) => {
            const lat = e.latLng.lat()
            const lng = e.latLng.lng()
            setMarkerPos({ lat, lng })
            if (markerRef.current) {
              markerRef.current.setPosition({ lat, lng })
            } else {
              markerRef.current = new window.google.maps.Marker({
                position: { lat, lng },
                map,
              })
            }

            // 取得地址（reverse geocoding）
            const geocoder = new window.google.maps.Geocoder()
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              if (status === "OK" && results && results[0]) {
                const address = results[0].formatted_address
                onLocationSelect?.(lat, lng, address)
              } else {
                onLocationSelect?.(lat, lng)
              }
            })
          })

          // 加入 DrawingManager 讓使用者圈選屋頂
          drawingManagerRef.current = new window.google.maps.drawing.DrawingManager({
            drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
              position: window.google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
            },
            polygonOptions: {
              fillColor: "#ff9800",
              fillOpacity: 0.3,
              strokeWeight: 2,
              clickable: false,
              editable: true,
              zIndex: 1,
            },
          })
          drawingManagerRef.current.setMap(map)
          window.google.maps.event.addListener(
            drawingManagerRef.current,
            "overlaycomplete",
            function (event: any) {
              if (polygonRef.current) {
                polygonRef.current.setMap(null)
              }
              polygonRef.current = event.overlay
              // 取得多邊形座標
              const path = polygonRef.current.getPath().getArray().map((latLng: any) => ({
                lat: latLng.lat(),
                lng: latLng.lng(),
              }))
              // 計算面積
              const area = window.google.maps.geometry.spherical.computeArea(polygonRef.current.getPath())
              if (onRoofAreaDetect) onRoofAreaDetect(Number(area.toFixed(2)), path)
            }
          )
        }
      })
      .catch(() => {
        setApiError("Google Maps API 載入失敗，請檢查網路或 API 金鑰。")
      })
    // eslint-disable-next-line
  }, [mapRef, mapInstance, onLocationSelect, onRoofAreaDetect])

  useEffect(() => {
    if (mapInstance && markerPos) {
      if (markerRef.current) {
        markerRef.current.setPosition(markerPos)
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: markerPos,
          map: mapInstance,
        })
      }
      mapInstance.setCenter(markerPos)
      mapInstance.setZoom(18)
    }
  }, [markerPos, mapInstance])

  if (apiError) {
    return <div style={{ color: "red", padding: 16 }}>{apiError}</div>
  }

  return <div ref={mapRef} style={{ width: "100%", height: 400 }} />
}
