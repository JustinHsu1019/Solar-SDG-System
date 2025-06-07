"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Sun, Phone, MapPin, Home, BarChart3, Lightbulb, LogOut, User } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import SimulationResults from "@/components/simulation-results"
import ContactForm from "@/components/contact-form"
import PlanComparison from "@/components/plan-comparison"
import SmartRecommendation from "@/components/smart-recommendation"
import SolarMap from "@/components/solar-map"
const user = JSON.parse(localStorage.getItem("user") || "{}")
console.log(user.email)

interface SimulationData {
  location_city: string
  location_dist: string
  location: string
  roofArea: number
  electricityUsage: number
  roofType: string
  direction: string
  riskTolerance: number
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

export default function SolarCalculator() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("calculator")
  const [user, setUser] = useState<{ email: string } | null>(null)

  const [formData, setFormData] = useState<SimulationData>({
    location_city: "",
    location_dist: "",
    location: "",
    roofArea: 0,
    electricityUsage: 0,
    roofType: "",
    direction: "",
    riskTolerance: 50,
  })
  const [results, setResults] = useState<Results | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [savedPlans, setSavedPlans] = useState<
    Array<{
      id: string
      name: string
      formData: SimulationData
      results: Results
      createdAt: Date
    }>
  >([])

  const taiwanCities = [
    "台北市",
    "新北市",
    "桃園市",
    "台中市",
    "台南市",
    "高雄市",
    "基隆市",
    "新竹市",
    "嘉義市",
    "新竹縣",
    "苗栗縣",
    "彰化縣",
    "南投縣",
    "雲林縣",
    "嘉義縣",
    "屏東縣",
    "宜蘭縣",
    "花蓮縣",
    "台東縣",
    "澎湖縣",
    "金門縣",
    "連江縣",
  ]

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userData = localStorage.getItem("user")
    const storedFormData = sessionStorage.getItem("formData")
    const startTab = sessionStorage.getItem("startTab")
  
    if (!isLoggedIn) {
      router.push("/")
    } else if (userData) {
      setUser(JSON.parse(userData))
    }
  
    if (storedFormData) {
      try {
        const parsedForm = JSON.parse(storedFormData)
        setFormData((prev) => ({
          ...prev,
          ...parsedForm,
        }))
      } catch (error) {
        console.error("❌ 無法解析儲存的 formData", error)
      }
    }
  
    if (startTab) {
      setActiveTab(startTab)
    }
  }, [router])
  

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleInput = async () => {
    // setIsCalculating(true)

    // // 模擬計算邏輯
    // await new Promise((resolve) => setTimeout(resolve, 2000))

    // // 基於地區的日照時數係數
    // const sunlightCoefficient = {
    //   台南市: 1.2,
    //   高雄市: 1.15,
    //   屏東縣: 1.18,
    //   台東縣: 1.1,
    //   台中市: 1.0,
    //   彰化縣: 1.05,
    //   雲林縣: 1.08,
    //   嘉義市: 1.1,
    //   台北市: 0.85,
    //   新北市: 0.88,
    //   基隆市: 0.8,
    //   宜蘭縣: 0.82,
    // }

    // const coefficient = sunlightCoefficient[formData.location_city as keyof typeof sunlightCoefficient] || 0.95

    // // 屋頂方向係數
    // const directionCoefficient = {
    //   south: 1.0,
    //   southeast: 0.95,
    //   southwest: 0.95,
    //   east: 0.85,
    //   west: 0.85,
    //   north: 0.7,
    // }

    // const dirCoeff = directionCoefficient[formData.direction as keyof typeof directionCoefficient] || 0.9

    // // 計算結果
    // const systemSize = formData.roofArea * 0.15 // 每平方米約0.15kW
    // const annualGeneration = systemSize * 1200 * coefficient * dirCoeff // 年發電量
    // const installationCost = systemSize * 45000 // 每kW約4.5萬元
    // const annualSavings = annualGeneration * 3.2 // 每度電約3.2元
    // const paybackPeriod = installationCost / annualSavings
    // const totalProfit = annualSavings * 20 - installationCost // 20年總獲益
    // const carbonReduction = annualGeneration * 0.554 // 每度電減少0.554kg CO2
    // const suitabilityScore = Math.min(100, coefficient * dirCoeff * 100)

    // const calculatedResults: Results = {
    //   suitable: suitabilityScore > 60,
    //   installationCost: Math.round(installationCost),
    //   annualGeneration: Math.round(annualGeneration),
    //   annualSavings: Math.round(annualSavings),
    //   paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    //   totalProfit: Math.round(totalProfit),
    //   carbonReduction: Math.round(carbonReduction),
    //   suitabilityScore: Math.round(suitabilityScore),
    // }

    // setResults(calculatedResults)
    // setIsCalculating(false)

    // 存資料到sessionStorage
    sessionStorage.setItem("formData", JSON.stringify(formData))
    sessionStorage.setItem("startTab", "recommend")
    setActiveTab("recommend")
  }

  const handleInputChange = (field: keyof SimulationData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  
  const isFormValid =
    formData.location_city &&
    formData.location_dist &&
    formData.roofArea > 0 &&
    formData.electricityUsage > 0 &&
    formData.roofType &&
    formData.direction

  const savePlan = (planName: string) => {
    if (results && formData) {
      const newPlan = {
        id: Date.now().toString(),
        name: planName,
        formData: { ...formData },
        results: { ...results },
        createdAt: new Date(),
      }
      setSavedPlans((prev) => [...prev, newPlan])
    }
  }

  const deletePlan = (planId: string) => {
    setSavedPlans((prev) => prev.filter((plan) => plan.id !== planId))
  }

  return (
    <div className="min-h-screen bg-[#fffcf6] from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-[#ffb875] p-2 rounded-lg">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">太陽能投資計算器</h1>
              </div>
            </div>

            {/* 用戶資訊和登出 */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span>登出</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

           {/* <TabsTrigger value="results" className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <span>模擬結果</span>
            </TabsTrigger> */}
            {/* <TabsTrigger value="contact" className="flex items-center space-x-2">
              <Phone className="h-4 w-5" />
              <span>專員聯繫</span>
            </TabsTrigger> */}

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
                      <Select onValueChange={(value) => handleInputChange("location_city", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇您的所在縣市" />
                        </SelectTrigger>
                        <SelectContent>
                          {taiwanCities.map((city) => (
                            <SelectItem key={city} value={city}>
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
                      <Label htmlFor="electricityUsage">月平均用電量 (度)</Label>
                      <Input
                        id="electricityUsage"
                        type="number"
                        placeholder="例：300"
                        value={formData.electricityUsage || ""}
                        onChange={(e) => handleInputChange("electricityUsage", Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="roofType">屋頂類型</Label>
                      <Select onValueChange={(value) => handleInputChange("roofType", value)}>
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
                      <Select onValueChange={(value) => handleInputChange("direction", value)}>
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

                  <Button
                    onClick={handleInput}
                    disabled={!isFormValid || isCalculating}
                    className="w-full bg-[#ff9a6b] hover:bg-[#df7e51]"
                    size="lg"
                  >
                    {isCalculating ? "計算中..." : "開始計算投資回報"}
                  </Button>
                </CardContent>
              </Card>

              {/* 右側：地圖 */}
              <SolarMap selectedLocation={`${formData.location_city}${formData.location_dist}`} />
            </div>
          </TabsContent>

          <TabsContent value="results">
            {results ? (
              <SimulationResults results={results} formData={formData} onSavePlan={savePlan} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Sun className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">尚未進行計算</h3>
                  <p className="text-gray-600 text-center mb-4">請先在「投資計算」頁面填入資訊並進行計算</p>
                  <Button onClick={() => setActiveTab("calculator")}>前往計算</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommend">
            {/*智能推薦  待修*/}
            <SmartRecommendation
              onRecommendationSelect={(recommendation) => {
                setFormData({
                                  ...recommendation.formData,
                                  location_city: (recommendation.formData as SimulationData).location_city || "",
                                  location_dist: (recommendation.formData as SimulationData).location_dist || "",
                                  location: (recommendation.formData as SimulationData).location || "",
                                  riskTolerance: (recommendation.formData as SimulationData).riskTolerance || 50,
                                })
                setResults(recommendation.results)
                setActiveTab("results")
              }}
            />
          </TabsContent>

          <TabsContent value="compare">
            <PlanComparison
              savedPlans={savedPlans}
              onDeletePlan={deletePlan}
              onPlanSelect={(plan) => {
                setFormData({
                  ...plan.formData,
                  location_city: plan.formData.location_city || "",
                  location_dist: plan.formData.location_dist || "",
                  location: plan.formData.location || "",
                  riskTolerance: plan.formData.riskTolerance || 50,
                });
                setResults(plan.results);
                setActiveTab("results");
              }}
            />
          </TabsContent>

          {/* <TabsContent value="contact">
            <ContactForm />
          </TabsContent> */}
        </Tabs>
      </main>
    </div>
  )
}
