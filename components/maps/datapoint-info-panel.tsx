"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Minimize2, Maximize2, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Signal } from "@/lib/maps/types"

type MapType = "market" | "understanding" | "engagement"

interface DatapointInfoPanelProps {
  selectedSignal: Signal | null
  mapTitle: string
  onClose: () => void
  activeMap: MapType
  onMapChange: (map: MapType) => void
  mobile: boolean
  isMinimized?: boolean
  onToggleMinimized?: () => void
  onCollapseChange?: (collapsed: boolean) => void
  onHeightChange?: (height: number) => void
  forceExpand?: boolean
}

export function DatapointInfoPanel({
  selectedSignal,
  mapTitle,
  onClose,
  activeMap,
  onMapChange,
  mobile,
  isMinimized = false,
  onToggleMinimized,
  onCollapseChange,
  onHeightChange,
  forceExpand = false
}: DatapointInfoPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Update parent with collapse state
  useEffect(() => {
    onCollapseChange?.(isCollapsed)
  }, [isCollapsed, onCollapseChange])

  // Force expand when requested
  useEffect(() => {
    if (forceExpand && isCollapsed) {
      setIsCollapsed(false)
    }
  }, [forceExpand, isCollapsed])

  // Update height for legend positioning
  useEffect(() => {
    const height = isCollapsed ? 60 : (selectedSignal ? 300 : 120)
    onHeightChange?.(height)
  }, [isCollapsed, selectedSignal, onHeightChange])

  const handleToggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
  }

  if (!selectedSignal && !mobile) {
    return (
      <div className="absolute top-6 left-6 z-30">
        <div className="backdrop-blur-[16px] bg-white/60 dark:bg-black/60 border border-[var(--border)] rounded-lg p-4 shadow-elevated min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{mapTitle}</h3>
            <div className="flex items-center gap-2">
              <select
                value={activeMap}
                onChange={(e) => onMapChange(e.target.value as MapType)}
                className="bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--foreground)]"
              >
                <option value="understanding">Understanding</option>
                <option value="market">Market</option>
                <option value="engagement">Experience</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Click on a datapoint to view details
          </p>
        </div>
      </div>
    )
  }

  if (!selectedSignal) return null

  return (
    <div className={`absolute ${mobile ? 'bottom-6 left-6 right-6' : 'top-6 left-6'} z-30`}>
      <div className={`backdrop-blur-[16px] bg-white/60 dark:bg-black/60 border border-[var(--border)] rounded-lg shadow-elevated ${mobile ? 'w-full' : 'min-w-[350px] max-w-[400px]'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-[var(--foreground)] truncate">
              {selectedSignal.signal_name}
            </h3>
            {mobile && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggleCollapsed}
                className="p-1 h-auto text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={activeMap}
              onChange={(e) => onMapChange(e.target.value as MapType)}
              className="bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--foreground)]"
            >
              <option value="understanding">Understanding</option>
              <option value="market">Market</option>
              <option value="engagement">Experience</option>
            </select>
            {!mobile && onToggleMinimized && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleMinimized}
                className="p-1 h-auto text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="p-1 h-auto text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isCollapsed && !isMinimized && (
          <div className="p-4 space-y-4">
            {selectedSignal.summary && (
              <div>
                <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">Summary</h4>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {selectedSignal.summary}
                </p>
              </div>
            )}

            {selectedSignal.confidence_level && (
              <div>
                <h4 className="text-sm font-medium text-[var(--foreground)] mb-1">Confidence Level</h4>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {selectedSignal.confidence_level}
                </p>
              </div>
            )}

            {selectedSignal.lifecycle && (
              <div>
                <h4 className="text-sm font-medium text-[var(--foreground)] mb-1">Lifecycle</h4>
                <p className="text-sm text-[var(--muted-foreground)] capitalize">
                  {selectedSignal.lifecycle}
                </p>
              </div>
            )}

            {selectedSignal.steep_driver && (
              <div>
                <h4 className="text-sm font-medium text-[var(--foreground)] mb-1">STEEP Driver</h4>
                <p className="text-sm text-[var(--muted-foreground)] capitalize">
                  {selectedSignal.steep_driver}
                </p>
              </div>
            )}

            {selectedSignal.tags && selectedSignal.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedSignal.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-[var(--accent)] text-[var(--accent-foreground)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}