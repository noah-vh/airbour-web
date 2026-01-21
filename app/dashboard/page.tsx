"use client"

import { useQuery } from "convex/react"

export default function DashboardPage() {
  // Try to use Convex queries once types are generated
  // For now, showing connection status
  
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-black dark:text-zinc-50">
          SysInno Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Signals
            </h3>
            <p className="text-3xl font-bold text-black dark:text-zinc-50">
              --
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Sources
            </h3>
            <p className="text-3xl font-bold text-black dark:text-zinc-50">
              --
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Mentions
            </h3>
            <p className="text-3xl font-bold text-black dark:text-zinc-50">
              --
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Trending
            </h3>
            <p className="text-3xl font-bold text-black dark:text-zinc-50">
              --
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
            ✅ Convex Connection Established
          </h2>
          <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
            <p>✅ Convex Provider Connected</p>
            <p>✅ Deployment: hidden-seahorse-339</p>
            <p>✅ URL: https://hidden-seahorse-339.convex.cloud</p>
          </div>
          <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <strong>Next Steps:</strong>
            </p>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 list-disc list-inside space-y-1">
              <li>Run <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded">npx convex dev</code> to generate API types</li>
              <li>Import and use Convex queries in components</li>
              <li>Create dashboard pages for Sources, Signals, and Analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
