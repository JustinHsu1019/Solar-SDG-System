"use client"

import { useEffect, useRef, useState } from "react"


interface GoogleMapsIntegrationProps {
  location: string
  onLocationSelect?: (coordinates: [number, number]) => void
}

// 實際的 Google Maps 整合組件
export default function GoogleMapsIntegration({ location, onLocationSelect }: GoogleMapsIntegrationProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // 台灣各縣市座標
  const locationCoordinates: Record<string, [number, number]> = {
    台北市: [25.033, 121.5654],
    新北市: [25.0118, 121.4654],
    桃園市: [24.9937, 121.3009],
    台中市: [24.1477, 120.6736],
    台南市: [22.9999, 120.2269],
    高雄市: [22.6273, 120.3014],
    // ... 其他縣市
  }

  useEffect(() => {
    // 載入 Google Maps API
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap()
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initializeMap
      document.head.appendChild(script)
    }

    const initializeMap = () => {
      if (!mapRef.current) return

      const coordinates = locationCoordinates[location] || [23.8, 121.0] // 台灣中心點

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: coordinates[0], lng: coordinates[1] },
        zoom: location ? 12 : 7,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        styles: [
          {
            featureType: "all",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
      })

      // 添加太陽能潛力熱力圖
      if (location) {
        addSolarPotentialOverlay(mapInstance, coordinates)
      }

      // 添加標記
      if (location && coordinates) {
        new google.maps.Marker({
          position: { lat: coordinates[0], lng: coordinates[1] },
          map: mapInstance,
          title: location,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#f59e0b"/>
                <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
          },
        })
      }

      setMap(mapInstance)
      setIsLoaded(true)
    }

    loadGoogleMaps()
  }, [location])

  const addSolarPotentialOverlay = (map: google.maps.Map, center: [number, number]) => {
    // 創建太陽能潛力熱力圖
    const heatmapData = generateSolarHeatmapData(center)

    const heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map,
    })

    heatmap.set("gradient", [
      "rgba(0, 255, 255, 0)",
      "rgba(0, 255, 255, 1)",
      "rgba(0, 191, 255, 1)",
      "rgba(0, 127, 255, 1)",
      "rgba(0, 63, 255, 1)",
      "rgba(0, 0, 255, 1)",
      "rgba(0, 0, 223, 1)",
      "rgba(0, 0, 191, 1)",
      "rgba(0, 0, 159, 1)",
      "rgba(0, 0, 127, 1)",
      "rgba(63, 0, 91, 1)",
      "rgba(127, 0, 63, 1)",
      "rgba(191, 0, 31, 1)",
      "rgba(255, 0, 0, 1)",
    ])
  }

  const generateSolarHeatmapData = (center: [number, number]) => {
    const points = []
    const [lat, lng] = center

    // 生成周圍的太陽能潛力數據點
    for (let i = 0; i < 100; i++) {
      const latOffset = (Math.random() - 0.5) * 0.02
      const lngOffset = (Math.random() - 0.5) * 0.02
      const intensity = Math.random() * 100

      points.push({
        location: new google.maps.LatLng(lat + latOffset, lng + lngOffset),
        weight: intensity,
      })
    }

    return points
  }

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">載入地圖中...</p>
          </div>
        </div>
      )}
    </div>
  )
}
