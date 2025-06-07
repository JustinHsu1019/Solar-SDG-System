"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Star } from "lucide-react"
import { Save } from "lucide-react"

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
    installationCost: number
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
  type: string
  capacity_kw: number
  efficiency_percent: number
  efficiency_level: string
  fit_rate_total: number
  daily_kwh_per_kw: number
  investment_projection_20yr: { value: number; year: number }[]
}

interface SmartRecommendationProps {
  recommendation?: RecommendationResult[]
  onRecommendationSelect?: (recommendation: RecommendationResult) => void
  onSavePlan?: (planName: string, planData: RecommendationResult) => void
}

export default function SmartRecommendation({ onRecommendationSelect, onSavePlan }: SmartRecommendationProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [planName, setPlanName] = useState("")
  const [converted, setConverted] = useState<RecommendationResult[]>([])
  const [aiResult, setAiResult] = useState<{
    [id: string]: {
      final_recommendation: string
      score: number
      explanation_text: string
    }
  }>({})

  useEffect(() => {
    const rawData = localStorage.getItem("data")
    const data = rawData ? JSON.parse(rawData) : {}

    const formData = {
      location_city: data?.formData?.location_city || "未輸入",
      roofArea: data?.formData?.roofArea || 0,
      electricityUsage: data?.formData?.electricityUsage || 0,
      roofType: data?.formData?.roofType || "未輸入",
      direction: data?.formData?.direction || "未輸入",
    }

    const recommendations = data?.recommendations || []
    const transformed = recommendations.map((item: any, index: number): RecommendationResult => ({
      id: `rec-${index}`,
      name: item.brand,
      description: `容量 ${item.capacity_kw}kW，每年約可發電 ${item.annual_generation_kwh} 度`,
      formData,
      module_name: item.module_name,
      payback_years: item.payback_years,
      type: item.type,
      capacity_kw: item.capacity_kw,
      efficiency_percent: item.efficiency_percent,
      efficiency_level: item.efficiency_level,
      fit_rate_total: item.fit_rate_total,
      daily_kwh_per_kw: item.daily_kwh_per_kw,
      investment_projection_20yr: item.investment_projection_20yr,
      results: {
        suitable: true,
        annualGeneration: item.annual_generation_kwh,
        annualSavings: item.annual_revenue_ntd,
        totalProfit: item.annual_revenue_ntd * 20,
        carbonReduction: parseFloat((item.annual_generation_kwh * 0.5).toFixed(1)),
        installationCost: item.install_cost_ntd,
      },
      matchScore: calculateCompatibility(item.efficiency_percent, data.formData?.risk_tolerance || 50),
      pros: [`效率 ${item.efficiency_percent}%`, item.environmental_benefit],
      cons:
        typeof item.final_recommendation === "string" &&
        item.final_recommendation.includes("觀望")
          ? ["效率偏低", "建議保守評估"]
          : [],
      recommendation: item.explanation_text || "根據您的條件，我們建議採用此方案以獲得穩定報酬。",
    }))

    transformed.sort((a: RecommendationResult, b: RecommendationResult) => b.matchScore - a.matchScore)
    setConverted(transformed)
  }, [])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount)

  function calculateCompatibility(efficiencyPercent: number, riskTolerance: number): number {
    const minEff = 16.5
    const maxEff = 23.6
    let normalizedEff = (efficiencyPercent - minEff) / (maxEff - minEff)
    normalizedEff = Math.max(0, Math.min(1, normalizedEff))
    const riskToleranceNormalized = riskTolerance / 100
    const compatibilityScore = 1 - Math.abs(normalizedEff - riskToleranceNormalized)
    return Math.round(compatibilityScore * 100 * 100) / 100
  }

  if (!Array.isArray(converted) || converted.length === 0) {
    return (
      <div className="p-6 text-gray-600 text-center">
        <p>尚無推薦資料，請先完成投資計算。</p>
      </div>
    )
  }

  const localDescription = converted[0]?.description || "尚無描述"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-1">
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 mb-3" />
            <span>為您推薦的方案</span>
          </CardTitle>
          <CardDescription>在此條件安裝太陽能板，{localDescription}</CardDescription>
          <CardDescription>基於您的條件，我們為您精選了以下方案，按匹配度排序</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {converted.map((rec, index) => (
          <Card key={rec.id} className={index === 0 ? "ring-2 ring-orange-500" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {index === 0 && <Star className="h-5 w-5 text-orange-500" />}
                  <span>{rec.name}</span>
                  <span className="text-sm text-gray-500 flex flex-col justify-end items-start space-y-0.5">{rec.module_name}</span>
                </CardTitle>
                <Badge variant={rec.matchScore >= 80 ? "default" : rec.matchScore >= 60 ? "secondary" : "outline"}>
                  匹配度 {rec.matchScore}%
                </Badge>
              </div>
              {index === 0 && <Badge className="w-fit bg-orange-500">🏆 最佳推薦</Badge>}
            </CardHeader>

            <CardContent className="space-y-4">
              <Progress value={rec.matchScore} className="h-2" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">模組種類</p>
                  <p className="font-semibold break-words whitespace-pre-wrap">{rec.type}</p>
                </div>
                <div>
                  <p className="text-gray-600">模組效率</p>
                  <p className="font-semibold">{rec.efficiency_percent} %</p>
                </div>
                <div>
                  <p className="text-gray-600">效率等級</p>
                  <p className="font-semibold">{rec.efficiency_level}</p>
                </div>
                <div>
                  <p className="text-gray-600">年收益</p>
                  <p className="font-semibold">{formatCurrency(rec.results.annualSavings)}</p>
                </div>
                <div>
                  <p className="text-gray-600">20年預估獲益</p>
                  <p className="font-semibold">{formatCurrency(rec.results.totalProfit)}</p>
                </div>
                <div>
                  <p className="text-gray-600">安裝成本</p>
                  <p className="font-semibold">{formatCurrency(rec.results.installationCost)}</p>
                </div>
                <div>
                  <p className="text-gray-600">回本年限</p>
                  <p className="font-semibold">{rec.payback_years} 年</p>
                </div>
                <div>
                  <p className="text-gray-600">減碳效益</p>
                  <p className="font-semibold">{rec.pros.find(p => p.includes("減碳"))}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-green-600">優勢</h4>
                <ul className="text-sm space-y-1">
                  {rec.pros.map((pro, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {rec.cons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-600">注意事項</h4>
                  <ul className="text-sm space-y-1">
                    {rec.cons.map((con, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {onRecommendationSelect && (
                <Button
                  onClick={() => onRecommendationSelect(rec)}
                  className="w-full"
                  variant={index === 0 ? "default" : "outline"}
                >
                  查看詳細分析
                </Button>
              )}

              <Button
                onClick={async () => {
                  const response = await fetch("http://localhost:5001/api/llm_decision", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      module_name: rec.module_name,
                      efficiency_percent: rec.efficiency_percent,
                      efficiency_level: rec.efficiency_level,
                      capacity_kw: rec.capacity_kw,
                      address: rec.formData.location_city,
                      annual_generation_kwh: rec.results.annualGeneration,
                      install_cost_ntd: rec.results.installationCost,
                      annual_revenue_ntd: rec.results.annualSavings,
                      payback_years: rec.payback_years,
                    }),
                  })
                  const data = await response.json()
                  setAiResult((prev) => ({ ...prev, [rec.id]: data }))
                }}
                className="w-full"
                variant="secondary"
              >
                🔍 AI 評估此方案
              </Button>

              {aiResult[rec.id] && (
                <div className="text-sm mt-2 bg-yellow-50 border border-yellow-300 p-2 rounded">
                  <p><strong>📢 AI 回應</strong></p>
                  <p>建議：{aiResult[rec.id].final_recommendation}</p>
                  <p>分數：{aiResult[rec.id].score}</p>
                  <p>說明：{aiResult[rec.id].explanation_text}</p>
                </div>
              )}
              <div className="flex gap-2">
              {onRecommendationSelect && (
                <Button
                  onClick={() => onRecommendationSelect(rec)}
                  className="w-full"
                  variant={index === 0 ? "default" : "outline"}
                >
                  查看詳細分析
                </Button>
              )}
              {onSavePlan && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>保存方案</span>
                </Button>
              )}
            </div>

            </CardContent>
          </Card>
        ))}
      </div>
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>保存投資方案</CardTitle>
              <CardDescription>為這個方案命名，以便日後比較</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="planName">方案名稱</Label>
                <Input
                  id="planName"
                  placeholder="例：我家屋頂方案"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    if (planName.trim() && onSavePlan) {
                      onSavePlan(planName.trim(), converted[0])
                      setPlanName("")
                      setShowSaveDialog(false)
                    }
                  }}
                  disabled={!planName.trim()}
                  className="flex-1"
                >
                  保存
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveDialog(false)
                    setPlanName("")
                  }}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
