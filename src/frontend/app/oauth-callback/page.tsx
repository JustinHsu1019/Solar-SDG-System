'use client'

import { Suspense } from "react"
import OAuthCallbackClient from "./OAuthCallbackClient"

export default function OAuthCallbackPage() {
  // 這裡 Suspense 是必要的，因為 OAuthCallbackClient 內部用到 useSearchParams
  return (
    <Suspense fallback={<p>載入中...</p>}>
      <OAuthCallbackClient />
    </Suspense>
  )
}
