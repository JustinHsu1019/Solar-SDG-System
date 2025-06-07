"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Trash2, Eye, MapPin, Home } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

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


interface PlanComparisonProps {
  savedPlans: SavedPlan[]
  onDeletePlan: (planId: string) => void
  onSelectPlan: (plan: SavedPlan) => void
}

export default function PlanComparison({ savedPlans, onDeletePlan, onSelectPlan }: PlanComparisonProps) {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("zh-TW").format(num)
  }

  const togglePlanSelection = (planId: string) => {
    setSelectedPlans((prev) => (prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]))
  }

  const getSelectedPlansData = () => {
    return savedPlans.filter((plan) => selectedPlans.includes(plan.id))
  }

  const generateComparisonChartData = () => {
    const selectedPlansData = getSelectedPlansData()
    const years = Array.from({ length: 21 }, (_, i) => i)

    return years.map((year) => {
      const dataPoint: any = { year }

      selectedPlansData.forEach((plan) => {
        const cumulativeSavings = year * plan.results.annualSavings
        const netProfit = cumulativeSavings - plan.results.installationCost
        dataPoint[`${plan.name}_profit`] = netProfit
      })

      return dataPoint
    })
  }

  if (savedPlans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">尚無保存的方案</h3>
          <p className="text-gray-600 text-center mb-4">請先在「投資計算」頁面計算結果，然後保存方案以進行比較</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>方案比較</span>
          </CardTitle>
          <CardDescription>選擇要比較的方案，最多可同時比較 4 個方案</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">方案總覽</TabsTrigger>
          <TabsTrigger value="comparison">詳細比較</TabsTrigger>
          <TabsTrigger value="charts">圖表分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlans.includes(plan.id) ? "ring-2 ring-orange-500 bg-orange-50" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => onSelectPlan(plan)} className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeletePlan(plan.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {plan.formData && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{plan.formData.location_city}</span>
                      <span>•</span>
                      <Home className="h-3 w-3" />
                      <span>{plan.formData.roofArea}m²</span>
                    </div>
                  )}

                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                  {plan.results && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">安裝成本</p>
                        <p className="font-semibold">{formatCurrency(plan.results.installationCost)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">回本年限</p>
                        <p className="font-semibold">{plan.results.paybackPeriod} 年</p>
                      </div>
                    </div>
                  )}

                    <div>
                      <p className="text-gray-600">年節省</p>
                      <p className="font-semibold">{formatCurrency(plan.results.annualSavings)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">20年獲益</p>
                      <p className="font-semibold text-green-600">{formatCurrency(plan.results.totalProfit)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={plan.results.suitable ? "default" : "secondary"}>
                      適合度: {plan.results.suitabilityScore}%
                    </Badge>
                    <Button
                      variant={selectedPlans.includes(plan.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePlanSelection(plan.id)}
                      disabled={!selectedPlans.includes(plan.id) && selectedPlans.length >= 4}
                    >
                      {selectedPlans.includes(plan.id) ? "已選擇" : "選擇比較"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          {selectedPlans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-600">請先選擇要比較的方案</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* 比較表格 */}
              <Card>
                <CardHeader>
                  <CardTitle>方案對比表</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">項目</th>
                          {getSelectedPlansData().map((plan) => (
                            <th key={plan.id} className="text-center py-3 px-4 min-w-32">
                              {plan.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b">
                          <td className="py-3 px-4 font-medium">地區</td>
                          {getSelectedPlansData().map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">
                              {plan.formData.location_city}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-medium">屋頂面積</td>
                          {getSelectedPlansData().map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">
                              {plan.formData.roofArea} m²
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-medium">安裝成本</td>
                          {getSelectedPlansData().map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">
                              {formatCurrency(plan.results.installationCost)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-medium">年發電量</td>
                          {getSelectedPlansData().map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">
                              {formatNumber(plan.results.annualGeneration)} kWh
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-medium">年節省電費</td>
                          {getSelectedPlansData().map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">
                              {formatCurrency(plan.results.annualSavings)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-medium">回本年限</td>
                          {getSelectedPlansData().map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">
                              {plan.results.paybackPeriod} 年
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-medium">20年總獲益</td>
                          {getSelectedPlansData().map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4 text-green-600 font-semibold">
                              {formatCurrency(plan.results.totalProfit)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-medium">年減碳量</td>
                          {getSelectedPlansData().map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">
                              {formatNumber(plan.results.carbonReduction)} kg CO₂
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-medium">適合度評分</td>
                          {getSelectedPlansData().map((plan) => (
                            <td key={plan.id} className="text-center py-3 px-4">
                              <Badge variant={plan.results.suitable ? "default" : "secondary"}>
                                {plan.results.suitabilityScore}%
                              </Badge>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="charts">
          {selectedPlans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-600">請先選擇要比較的方案</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* 投資回報比較圖 */}
              <Card>
                <CardHeader>
                  <CardTitle>20年投資回報比較</CardTitle>
                  <CardDescription>各方案累積淨收益對比</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateComparisonChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" label={{ value: "年份", position: "insideBottom", offset: -5 }} />
                        <YAxis
                          tickFormatter={formatCurrency}
                          label={{ value: "淨收益", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            name.replace("_profit", ""),
                          ]}
                          labelFormatter={(year) => `第 ${year} 年`}
                        />
                        <Legend />
                        {getSelectedPlansData().map((plan, index) => {
                          const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"]
                          return (
                            <Line
                              key={plan.id}
                              type="monotone"
                              dataKey={`${plan.name}_profit`}
                              stroke={colors[index % colors.length]}
                              strokeWidth={2}
                              name={plan.name}
                            />
                          )
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* 關鍵指標比較 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>回本年限比較</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getSelectedPlansData()
                        .sort((a, b) => a.results.paybackPeriod - b.results.paybackPeriod)
                        .map((plan, index) => (
                          <div key={plan.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  index === 0 ? "bg-green-500" : index === 1 ? "bg-yellow-500" : "bg-gray-400"
                                }`}
                              />
                              <span className="font-medium">{plan.name}</span>
                            </div>
                            <span className="text-lg font-bold">{plan.results.paybackPeriod} 年</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>總獲益比較</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getSelectedPlansData()
                        .sort((a, b) => b.results.totalProfit - a.results.totalProfit)
                        .map((plan, index) => (
                          <div key={plan.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  index === 0 ? "bg-green-500" : index === 1 ? "bg-yellow-500" : "bg-gray-400"
                                }`}
                              />
                              <span className="font-medium">{plan.name}</span>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(plan.results.totalProfit)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
