// SmartRecommendation.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Lightbulb, Target, Clock, Leaf, Star, TrendingUp
} from "lucide-react"

interface UserPreferences {
  location_city: string
  budget: number
  roofArea: number
  electricityUsage: number
  investmentStyle: "conservative" | "balanced" | "aggressive"
  priority: "payback" | "profit" | "environment" | "balanced"
  riskTolerance: number
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
    installationCost: number
    annualGeneration: number
    annualSavings: number
    paybackPeriod: number
    totalProfit: number
    carbonReduction: number
    suitabilityScore: number
  }
  matchScore: number
  pros: string[]
  cons: string[]
  recommendation: string
}

interface SmartRecommendationProps {
  recommendation?: RecommendationResult[]
  onRecommendationSelect?: (recommendation: RecommendationResult) => void
}

export default function SmartRecommendation({ recommendation = [], onRecommendationSelect }: SmartRecommendationProps) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  if (!Array.isArray(recommendation) || recommendation.length === 0) {
    return (
      <div className="p-6 text-gray-600 text-center">
        <p>尚無推薦資料，請先完成投資計算。</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>為您推薦的方案</span>
          </CardTitle>
          <CardDescription>基於您的條件，我們為您精選了以下方案，按匹配度排序</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendation.map((rec, index) => (
          <Card key={rec.id} className={index === 0 ? "ring-2 ring-orange-500" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {index === 0 && <Star className="h-5 w-5 text-orange-500" />}
                  <span>{rec.name}</span>
                </CardTitle>
                <Badge variant={rec.matchScore >= 80 ? "default" : rec.matchScore >= 60 ? "secondary" : "outline"}>
                  匹配度 {rec.matchScore}%
                </Badge>
              </div>
              <CardDescription>{rec.description}</CardDescription>
              {index === 0 && <Badge className="w-fit bg-orange-500">🏆 最佳推薦</Badge>}
            </CardHeader>

            <CardContent className="space-y-4">
              <Progress value={rec.matchScore} className="h-2" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">安裝成本</p>
                  <p className="font-semibold">{formatCurrency(rec.results.installationCost)}</p>
                </div>
                <div>
                  <p className="text-gray-600">回本年限</p>
                  <p className="font-semibold">{rec.results.paybackPeriod} 年</p>
                </div>
                <div>
                  <p className="text-gray-600">年節省</p>
                  <p className="font-semibold">{formatCurrency(rec.results.annualSavings)}</p>
                </div>
                <div>
                  <p className="text-gray-600">20年獲益</p>
                  <p className="font-semibold text-green-600">{formatCurrency(rec.results.totalProfit)}</p>
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

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700">{rec.recommendation}</p>
              </div>

              {onRecommendationSelect && (
                <Button
                  onClick={() => onRecommendationSelect(rec)}
                  className="w-full"
                  variant={index === 0 ? "default" : "outline"}
                >
                  查看詳細分析
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}