"use client"

import { Suspense } from "react"
import { MappingInterface } from "@/components/maps/mapping-interface"
import { LoadingScreen } from "@/components/maps/loading-screen"

export default function MapsPage() {
  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <MappingInterface />
      </Suspense>
    </div>
  )
}
