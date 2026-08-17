"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  const router = useRouter();
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    if (splashFinished) {
      const session = getSession();
      if (!session) {
        router.replace("/login");
      } else if (session.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/hospital");
      }
    }
  }, [splashFinished, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <SplashScreen onFinished={() => setSplashFinished(true)} />
    </div>
  );
}

