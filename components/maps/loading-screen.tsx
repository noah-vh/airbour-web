"use client"

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
        <p className="text-gray-400">Loading innovation maps...</p>
      </div>
    </div>
  )
}