// SolarCalculatorPage.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Sun, Home, MapPin, LogOut, User } from "lucide-react"
import dynamic from "next/dynamic"

const GoogleMap = dynamic(() => import("@/components/google-map"), { ssr: false })

interface SimulationData {
  location_city: string
  location_dist: string
  roofArea: number
  electricityUsage: number
  roofType: string
  houseType: string
  direction: string
  riskTolerance: number
}

export default function SolarCalculatorPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("calculator")
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [formData, setFormData] = useState<SimulationData>({
    location_city: "",
    location_dist: "",
    roofArea: 0,
    electricityUsage: 0,
    roofType: "",
    houseType: "",
    direction: "",
    riskTolerance: 50,
  })
  const [isCalculating, setIsCalculating] = useState(false)

  const taiwanCities = [
    "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
    "基隆市", "新竹市", "嘉義市", "新竹縣", "苗栗縣", "彰化縣",
    "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
    "台東縣", "澎湖縣", "金門縣", "連江縣"
  ]

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const storedUser = localStorage.getItem("user")
    if (!isLoggedIn) router.push("/")
    else if (storedUser) setUser(JSON.parse(storedUser))
  }, [router])

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleInputChange = (field: keyof SimulationData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 解析 Google Maps 地址並自動填入縣市與區里
  const handleMapLocationSelect = (lat: number, lng: number, address?: string) => {
    if (address) {
      const cityMatch = address.match(/(台北市|新北市|桃園市|台中市|台南市|高雄市|基隆市|新竹市|嘉義市|新竹縣|苗栗縣|彰化縣|南投縣|雲林縣|嘉義縣|屏東縣|宜蘭縣|花蓮縣|台東縣|澎湖縣|金門縣|連江縣)/)
      let city = cityMatch ? cityMatch[0] : ""
      let dist = ""
      if (city) {
        const afterCity = address.split(city)[1] || ""
        dist = afterCity.replace(/^[\s,，]+/, "")
      }
      setFormData(prev => ({
        ...prev,
        location_city: city || prev.location_city,
        location_dist: dist || prev.location_dist,
      }))
    }
  }

  // 新增: 處理圈選多邊形後自動呼叫 Gemini 預估面積
  const handleRoofAreaDetect = async (area: number, polygon?: { lat: number; lng: number }[]) => {
    if (!polygon || polygon.length < 3) return
    try {
      // 呼叫後端 Gemini API
      const resp = await fetch("http://localhost:8080/api/roof-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ polygon }),
      })
      if (resp.ok) {
        const data = await resp.json()
        if (data.area) {
          setFormData(prev => ({
            ...prev,
            roofArea: Number(data.area),
          }))
          // 你也可以在這裡顯示 Gemini 回傳的多邊形或其他資訊
        }
      }
    } catch (err) {
      // 可加上錯誤提示
      // console.error("Gemini 預估面積失敗", err)
    }
  }

  const isFormValid = formData.location_city && formData.location_dist && formData.roofArea > 0 && formData.electricityUsage > 0 && formData.roofType && formData.direction

  return (
    <div className="min-h-screen bg-[#fffcf6]">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-[#ffb875] p-2 rounded-lg">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">太陽能投資計算器</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && <div className="flex items-center text-sm text-gray-600 space-x-2"><User className="w-4 h-4" /><span>{user.email}</span></div>}
            <Button onClick={handleLogout} variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600">
              <LogOut className="w-4 h-4 mr-1" />登出
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-1 bg-[#fffcf6] p-4 rounded-xl">
            <TabsTrigger value="calculator" className="tab">輸入資訊</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左側：表單 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Home className="h-5 w-5" />
                    <span>基本資訊</span>
                  </CardTitle>
                  <CardDescription>請填入您的基本資訊，我們將為您計算太陽能板投資回報</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location_city" className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>所在縣/市</span>
                      </Label>
                      <Select
                        onValueChange={(value) => handleInputChange("location_city", value)}
                        value={formData.location_city}
                      >
                        <SelectTrigger data-select-city>
                          <SelectValue placeholder="選擇您的所在縣市" />
                        </SelectTrigger>
                        <SelectContent>
                          {taiwanCities.map((city) => (
                            <SelectItem key={city} value={city} data-select-city-item>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location_dist" className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>所在區/里</span>
                      </Label>
                      <Input
                        id="location_dist"
                        type="string"
                        placeholder="例：中正區"
                        value={formData.location_dist || ""}
                        onChange={(e) => handleInputChange("location_dist", String(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="roofArea">屋頂面積 (平方米)</Label>
                      <Input
                        id="roofArea"
                        type="number"
                        placeholder="例：50"
                        value={formData.roofArea || ""}
                        onChange={(e) => handleInputChange("roofArea", Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="roofType">屋頂類型</Label>
                      <Select onValueChange={(value) => handleInputChange("roofType", value)} value={formData.roofType}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇屋頂類型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">平屋頂</SelectItem>
                          <SelectItem value="sloped">斜屋頂</SelectItem>
                          <SelectItem value="metal">鐵皮屋頂</SelectItem>
                          <SelectItem value="concrete">混凝土屋頂</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="direction">屋頂主要朝向</Label>
                      <Select onValueChange={(value) => handleInputChange("direction", value)} value={formData.direction}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇屋頂朝向" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="south">正南 (最佳)</SelectItem>
                          <SelectItem value="southeast">東南</SelectItem>
                          <SelectItem value="southwest">西南</SelectItem>
                          <SelectItem value="east">正東</SelectItem>
                          <SelectItem value="west">正西</SelectItem>
                          <SelectItem value="north">正北</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="electricityUsage">月平均用電量 (度)</Label>
                      <Input
                        id="electricityUsage"
                        type="number"
                        placeholder="例：300"
                        value={formData.electricityUsage || ""}
                        onChange={(e) => handleInputChange("electricityUsage", Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>風險承受度</Label>
                      <div className="space-y-2">
                        <Slider
                          id="riskTolerance"
                          value={typeof formData.riskTolerance === "number" ? [formData.riskTolerance] : [50]}
                          onValueChange={(value) => handleInputChange("riskTolerance", value[0])}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>保守 (低風險)</span>
                          <span className="font-medium">{formData.riskTolerance}%</span>
                          <span>積極 (高風險)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 右側：Google Map */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Sun className="h-5 w-5" />
                      <span>位置與太陽能潛力</span>
                    </CardTitle>
                    <CardDescription>
                      在地圖上選擇您的屋頂位置，並查看該地區的太陽能潛力
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ width: "100%", height: 400 }}>
                      <GoogleMap
                        onLocationSelect={handleMapLocationSelect}
                        onRoofAreaDetect={handleRoofAreaDetect}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
