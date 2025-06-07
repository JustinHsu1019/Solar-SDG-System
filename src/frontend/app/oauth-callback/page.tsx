"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const email = searchParams.get("email")
    if (email) {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("user", JSON.stringify({ email }))
      router.push("/calculator")
    } else {
      alert("登入失敗")
      router.push("/")
    }
  }, [router, searchParams])

  return <p>登入成功，跳轉中...</p>
}
