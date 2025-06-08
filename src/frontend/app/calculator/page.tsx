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
import { Sun, Home, MapPin, LogOut, User, Calculator, Lightbulb, BarChart3 } from "lucide-react"
import dynamic from "next/dynamic"
import SmartRecommendation from "@/components/smart-recommendation"
import PlanComparison from "@/components/plan-comparison"

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
  coverage_rate: number
}

interface Results {
  suitable: boolean
  installationCost: number
  annualGeneration: number
  annualSavings: number
  paybackPeriod: number
  totalProfit: number
  carbonReduction: number
  suitabilityScore: number
}

interface SavedPlan {
  id: string
  name: string
  formData: SimulationData
  results: Results
  createdAt: Date
}


interface RecommendationResult {
  id: string
  name: string
  description: string
  formData: {
    location_city: string
    roofArea: number
    electricityUsage: number
    roofType: string
    direction: string
  }
  results: {
    suitable: boolean
    annualGeneration: number
    annualSavings: number
    totalProfit: number
    carbonReduction: number
  }
  matchScore: number
  pros: string[]
  cons: string[]
  recommendation: string
  module_name: string
  payback_years: number
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
    coverage_rate: 50,
  })
  const [results, setResults] = useState<Results | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])

  const taiwanCities = [
    "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市", 
    "基隆市", "新竹市", "嘉義市", "新竹縣", "苗栗縣", "彰化縣", 
    "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", 
    "台東縣", "澎湖縣", "金門縣", "連江縣"
  ]

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const storedUser = localStorage.getItem("user")
    
    if (!isLoggedIn) {
      router.push("/")
      return
    }
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse user data:", error)
        localStorage.removeItem("user")
        router.push("/")
        return
      }
    }

    // Load saved plans
    try {
      const stored = JSON.parse(localStorage.getItem("savedPlans") || "[]") as SavedPlan[]
      const parsed = stored.map(p => ({ 
        ...p, 
        createdAt: new Date(p.createdAt) 
      }))
      setSavedPlans(parsed)
    } catch (error) {
      console.error("Failed to load saved plans:", error)
      setSavedPlans([])
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleInputChange = (field: keyof SimulationData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMapLocationSelect = (lat: number, lng: number, address?: string) => {
    if (address) {
      const cityMatch = address.match(/(台北市|新北市|桃園市|台中市|台南市|高雄市|基隆市|新竹市|嘉義市|新竹縣|苗栗縣|彰化縣|南投縣|雲林縣|嘉義縣|屏東縣|宜蘭縣|花蓮縣|台東縣|澎湖縣|金門縣|連江縣)/)
      const city = cityMatch?.[0] ?? ""
      const dist = city ? (address.split(city)[1] || "").replace(/^[\s,，]+/, "") : ""
      
      setFormData(prev => ({
        ...prev,
        location_city: city || prev.location_city,
        location_dist: dist || prev.location_dist,
      }))
    }
  }

  const handleRoofAreaDetect = async (area: number, polygon?: { lat: number; lng: number }[]) => {
    if (!polygon || polygon.length < 3) return
    
    try {
      const response = await fetch("http://34.81.110.126:8080/api/roof-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ polygon }),
      })
      
      if (!response.ok) {
        throw new Error(`Roof detection failed: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.area) {
        setFormData(prev => ({ ...prev, roofArea: Number(data.area) }))
      }
    } catch (err) {
      console.error("Gemini 預估失敗", err)
      setErrorMessage("屋頂面積檢測失敗，請手動輸入")
    }
  }

  const handleInput = async () => {
    if (!isFormValid) {
      setErrorMessage("請完整填寫所有欄位")
      return
    }

    setIsCalculating(true)
    setErrorMessage("")
  
    try {
      console.log("📊 開始計算投資回報", formData)
  
      const response = await fetch(`http://34.81.110.126:5001/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roof_area_m2: formData.roofArea,
          coverage_rate: formData.coverage_rate,
          orientation: formData.direction,
          house_type: formData.houseType,
          roof_type: formData.roofType,
          address: formData.location_city,
          electricity_usage_kwh: formData.electricityUsage,
          risk_tolerance: formData.riskTolerance,
        }),
      })
  
      if (!response.ok) {
        throw new Error(`API 回傳失敗：${response.status}`)
      }
  
      const data = await response.json()
      if (!Array.isArray(data.recommendations)) {
        throw new Error("API 回傳格式錯誤")
      }
  
      localStorage.setItem("formData", JSON.stringify(formData))
      localStorage.setItem("data", JSON.stringify(data))
      setActiveTab("recommend")
    } catch (err: any) {
      console.error("❌ 推薦錯誤", err)
      setErrorMessage(err.message || "推薦系統錯誤，請稍後再試")
    } finally {
      setIsCalculating(false)
    }
  }  

  const savePlan = (planName: string) => {
    if (!results || !formData || !planName.trim()) {
      setErrorMessage("無法儲存方案：缺少必要資料")
      return
    }

    try {
      const newPlan: SavedPlan = {
        id: Date.now().toString(),
        name: planName.trim(),
        formData: { ...formData },
        results: { ...results },
        createdAt: new Date(),
      }

      const stored = JSON.parse(localStorage.getItem("savedPlans") || "[]") as SavedPlan[]
      const updated = [...stored, newPlan]
      
      localStorage.setItem("savedPlans", JSON.stringify(updated))
      setSavedPlans(updated.map(p => ({ 
        ...p, 
        createdAt: new Date(p.createdAt) 
      })))
      
      setErrorMessage("")
    } catch (error) {
      console.error("Failed to save plan:", error)
      setErrorMessage("儲存方案失敗，請稍後再試")
    }
  }

  const handleDeletePlan = (planId: string) => {
    try {
      const updated = savedPlans.filter(plan => plan.id !== planId)
      localStorage.setItem("savedPlans", JSON.stringify(updated))
      setSavedPlans(updated)
    } catch (error) {
      console.error("Failed to delete plan:", error)
      setErrorMessage("刪除方案失敗，請稍後再試")
    }
  }

  const handleSelectPlan = (plan: SavedPlan) => {
    // You can implement plan selection logic here
    // For example, load the plan data into the form
    if (plan.formData) {
      setFormData(plan.formData)
      setResults(plan.results || null)
      setActiveTab("calculator")
    }
  }

  const isFormValid = Boolean(
    formData.location_city &&
    formData.roofArea > 0 &&
    formData.electricityUsage > 0 &&
    formData.roofType &&
    formData.direction
  )

  return (
    <div className="min-h-screen bg-[#fffcf6]">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="太陽圖示" className="h-12 w-12" />

            <h1 className="text-2xl font-bold text-gray-900">陽光下的智慧決策</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center text-sm text-gray-600 space-x-2">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            )}
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm" 
              className="hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-1" />
              登出
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap justify-between gap-3 bg-[#fffcf6] p-4 rounded-xl h-20">
            <TabsTrigger
              value="calculator"
              className="flex-1 min-w-[160px] flex flex-col items-center justify-center border rounded-lg px-4 py-3 transition-all duration-200 hover:bg-white hover:shadow-sm data-[state=active]:bg-white data-[state=active]:border-orange-500 data-[state=active]:shadow-lg data-[state=active]:text-orange-600"
            >
              <Calculator className="h-5 w-5 mb-1" />
              <span className="font-semibold">輸入資訊</span>
            </TabsTrigger>

            <TabsTrigger
              value="recommend"
              className="flex-1 min-w-[160px] flex flex-col items-center justify-center border rounded-lg px-4 py-3 transition-all duration-200 hover:bg-white hover:shadow-sm data-[state=active]:bg-white data-[state=active]:border-orange-500 data-[state=active]:shadow-lg data-[state=active]:text-orange-600"
            >
              <Lightbulb className="h-5 w-5 mb-1" />
              <span className="font-semibold">智能推薦</span>
            </TabsTrigger>

            <TabsTrigger
              value="compare"
              className="flex-1 min-w-[160px] flex flex-col items-center justify-center border rounded-lg px-4 py-3 transition-all duration-200 hover:bg-white hover:shadow-sm data-[state=active]:bg-white data-[state=active]:border-orange-500 data-[state=active]:shadow-lg data-[state=active]:text-orange-600"
            >
              <BarChart3 className="h-5 w-5 mb-1" />
              <span className="font-semibold">方案比較</span>
            </TabsTrigger>
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
                        type="text"
                        placeholder="例：中正區"
                        value={formData.location_dist || ""}
                        onChange={(e) => handleInputChange("location_dist", e.target.value)}
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
                    
                    <div className="space-y-3">
                      <Label>屋頂覆蓋率</Label>
                      <div className="space-y-2">
                        <Slider
                          id="coverage_rate"
                          value={typeof formData.coverage_rate === "number" ? [formData.coverage_rate] : [50]}
                          onValueChange={(value) => handleInputChange("coverage_rate", value[0])}
                          max={100}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>低</span>
                          <span className="font-medium">{formData.coverage_rate}%</span>
                          <span>高</span>
                        </div>
                      </div>
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
                  
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{errorMessage}</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleInput}
                    disabled={!isFormValid || isCalculating}
                    className="w-full bg-[#ff9a6b] hover:bg-[#df7e51] disabled:opacity-50"
                    size="lg"
                  >
                    {isCalculating ? "計算中..." : "開始計算投資回報"}
                  </Button>
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

          <TabsContent value="recommend">
            <SmartRecommendation onSavePlan={savePlan} />
          </TabsContent>

          <TabsContent value="compare">
            <PlanComparison 
              // savedPlans={ } 
              // onDeletePlan={ }
              // onSelectPlan={ }
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}