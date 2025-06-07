//首頁！
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sun, Loader2, CheckCircle } from "lucide-react"
import { FcGoogle } from "react-icons/fc"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)

    // 模擬登入過程
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSuccess(true)
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("user", JSON.stringify({ email: "user@example.com" }))

    // 成功動畫後跳轉
    setTimeout(() => {
      router.push("/calculator")
    }, 2000)
  }

  const handleGoogleLogin = () => {
    window.location.href = "http://127.0.0.1:8080/login/google"
  }

  return (
    <div className="min-h-screen flex">
      {/* 左側 - Logo 和登入區域 */}
      <div className="basis-2/5 flex-1 flex flex-col justify-center items-center bg-gradient-to-br p-8 relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="relative z-10 max-w-md w-full space-y-8">
          {/* Logo 區域 */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4 rounded-2xl shadow-lg">
                <Sun className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">太陽能板平台</h1>
              <p className="text-lg text-gray-600">SDG 7 - 可負擔與潔淨能源</p>
              <p className="text-sm text-gray-500 mt-2">智能評估您的太陽能投資回報</p>
            </div>
          </div>

          {/* 登入區域 */}
          <div className="space-y-6">
            {!isSuccess ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">開始計算您的太陽能投資效益</p>
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>登入中...</span>
                    </div>
                  ) : (
                    "開始使用"
                  )}
                </Button>
                <div className="flex items-center justify-center my-2">
                  <span className="text-gray-400 text-xs">或</span>
                </div>
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full flex items-center justify-center border-gray-300"
                >
                  <FcGoogle className="mr-2 h-5 w-5" />
                  使用 Google 登入
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">登入成功！</h3>
                  <p className="text-sm text-gray-600 mt-1">正在為您準備太陽能計算器...</p>
                </div>
                <div className="flex justify-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 底部資訊 */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>© 2025 太陽能板平台</p>
            <p>專業的太陽能投資評估工具</p>
          </div>
        </div>
      </div>

      {/* 右側 - 背景照片 */}
      <div className="basis-3/5 flex-1 relative overflow-hidden">
        <Image
          src="/main_solar.png"
          alt="太陽能板安裝"
          fill
          className="object-cover"
          priority
        />

        {/* 照片上的漸層遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/10 to-black/30"></div>

        {/* 照片上的文字 */}
        <div className="absolute bottom-8 left-8 text-white space-y-2">
          <h2 className="text-2xl font-bold">綠色能源，智慧投資</h2>
          <p className="text-lg opacity-90">讓太陽為您創造持續收益</p>
        </div>

        {/* 浮動的太陽能數據卡片 */}
        <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-600">平均年節省</p>
            <p className="text-lg font-bold text-green-600">$45,000</p>
          </div>
        </div>

        <div className="absolute top-32 right-16 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-600">回本年限</p>
            <p className="text-lg font-bold text-orange-600">7-10年</p>
          </div>
        </div>

        <div className="absolute bottom-32 right-8 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-600">年減碳量</p>
            <p className="text-lg font-bold text-blue-600">4.5噸 CO₂</p>
          </div>
        </div>
      </div>

      {/* 全屏載入動畫 */}
      {isSuccess && (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center z-50">
          <div className="text-center text-white space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-white/30 rounded-full"></div>
              <div className="absolute inset-0 w-24 h-24 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <Sun className="absolute inset-0 m-auto h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">準備就緒</h2>
              <p className="text-lg opacity-90">正在啟動太陽能計算器...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
