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

  const mockUserInput = {
    location_city: "台南市",
    location_dist: "東區",
    roofArea: 40,
    electricityUsage: 350,
    roofType: "flat",
    direction: "south",
    riskTolerance: 60,
  }

  const handleLogin = async () => {
    setIsLoading(true)
    localStorage.setItem("isLoggedIn", "true")

    // // ✅ 模擬登入過程
    // await new Promise((resolve) => setTimeout(resolve, 1500))
    // localStorage.setItem("isLoggedIn", "true")
    // localStorage.setItem("user", JSON.stringify({ email: "user@example.com" }))

    // setIsSuccess(true)

    // // ✅ 模擬將資料送出給後端 API（可以換成真正的 fetch）
    // await fakeSendToBackend(mockUserInput)

    // // ✅ 儲存輸入資料到 sessionStorage 以便 calculator 使用
    // sessionStorage.setItem("formData", JSON.stringify(mockUserInput))
    // sessionStorage.setItem("startTab", "recommend")

    // // ✅ 動畫後跳轉
    setTimeout(() => {
      window.location.href = "/calculator"
    }, 2000)
  }

  const handleGoogleLogin = () => {
    window.location.href = "http://34.81.110.126:8080/login/google"
  }

  return (
    <div className="min-h-screen flex ">
      {/* 左側 - Logo 和登入區域 */}
      <div className="basis-2/5 flex-1 flex flex-col justify-center items-center p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              
              <img src="/logo.png" alt="logo" className="h-25 w-25" />


            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">陽光下的智慧決策</h1>
            <p className="text-lg text-gray-600">SDG 7 - 可負擔與潔淨能源</p>
            <p className="text-sm text-gray-500 mt-2">Smarter Solar Starts Here!</p>
          </div>

          {/* 登入區域 */}
          <div className="space-y-6">
            {!isSuccess ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">開始計算您的太陽能投資效益!</p>
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
                <h3 className="text-lg font-medium text-gray-900">登入成功！</h3>
                <p className="text-sm text-gray-600 mt-1">正在為您準備太陽能計算器...</p>
                <div className="flex justify-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#FAC796] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#FAC796] rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-[#FAC796] rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
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
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/10 to-black/30"></div>
        <div className="absolute bottom-8 left-8 text-white space-y-2">
          <h2 className="text-2xl font-bold">Google Cloud/ 第三組</h2>
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
