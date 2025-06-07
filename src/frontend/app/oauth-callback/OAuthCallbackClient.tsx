"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OAuthCallbackClientInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get("email");
    if (email) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify({ email }));
      router.push("/calculator");
    } else {
      alert("登入失敗");
      router.push("/");
    }
  }, [router, searchParams]);

  return <p>登入成功，跳轉中...</p>;
}

// This file is now correct: useSearchParams is wrapped in <Suspense>.
// If you still see the error, ensure your page file (page.tsx or page.jsx) for /oauth-callback
// imports and uses <OAuthCallbackClient /> directly inside a <Suspense> boundary, or as the default export.

export default function OAuthCallbackClient() {
  return (
    <Suspense fallback={<p>載入中...</p>}>
      <OAuthCallbackClientInner />
    </Suspense>
  );
}