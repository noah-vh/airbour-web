"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import type { Signal } from "@/lib/maps/types"

type MapType = "market" | "understanding" | "engagement"

interface SignalDetailPanelProps {
  selectedSignal: Signal | null
  mapTitle: string
  onClose?: () => void
  activeMap?: MapType
  onMapChange?: (map: MapType) => void
  mobile?: boolean
}

const getMapDescription = (mapTitle: string): string => {
  switch (mapTitle) {
    case "Market Map":
      return "Visualizes market signals across lifecycle stages and STEEP drivers to identify opportunities."
    case "Understanding Map":
      return "Maps data intelligence capabilities and quality of life impacts across different scopes."
    case "Experience Map":
      return "Explores how data functions as material across different behavioral economies."
    default:
      return "Interactive visualization of innovation signals and their relationships."
  }
}

export function SignalDetailPanel({
  selectedSignal,
  mapTitle,
  onClose,
  activeMap,
  onMapChange,
  mobile = false,
}: SignalDetailPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const mapDescription = getMapDescription(mapTitle)

  const mapOptions: { key: MapType; label: string }[] = [
    { key: "market", label: "Market Map" },
    { key: "understanding", label: "Understanding Map" },
    { key: "engagement", label: "Experience Map" },
  ]

  return (
    <div
      className={`absolute backdrop-blur-[16px] bg-black/40 border border-white/10 rounded-lg shadow-2xl z-20 transition-all duration-300 ${mobile
          ? 'left-2 right-2 top-16'
          : 'top-4 left-4 w-80'
        }`}
    >
      <div className="p-4">
        {/* Header with Map Selector */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <select
              value={activeMap}
              onChange={(e) => onMapChange?.(e.target.value as MapType)}
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {mapOptions.map((option) => (
                <option key={option.key} value={option.key} className="bg-black text-white">
                  {option.label}
                </option>
              ))}
            </select>
            {mobile && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 h-auto text-white/60 hover:text-white"
              >
                {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Map Description */}
        <div className={`transition-all duration-300 ${isCollapsed && mobile ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'}`}>
          <p className="text-white/80 text-sm leading-relaxed mb-4">
            {mapDescription}
          </p>

          {/* Selected Signal Details */}
          {selectedSignal ? (
            <div className="space-y-3 border-t border-white/10 pt-3">
              <div className="flex items-start justify-between">
                <h3 className="text-white font-medium text-base leading-tight">
                  {selectedSignal.signal_name}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="p-1 h-auto text-white/60 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {selectedSignal.summary && (
                <div>
                  <h4 className="text-white/60 text-sm font-medium mb-1">Summary</h4>
                  <p className="text-white/80 text-sm leading-relaxed">{selectedSignal.summary}</p>
                </div>
              )}

              {selectedSignal.strategic_notes && (
                <div>
                  <h4 className="text-white/60 text-sm font-medium mb-1">Strategic Notes</h4>
                  <p className="text-white/80 text-sm leading-relaxed">{selectedSignal.strategic_notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedSignal.lifecycle && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {selectedSignal.lifecycle}
                  </span>
                )}
                {selectedSignal.steep_driver && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30">
                    {selectedSignal.steep_driver}
                  </span>
                )}
              </div>

              {selectedSignal.confidence_level && (
                <div>
                  <h4 className="text-white/60 text-sm font-medium mb-1">Confidence Level</h4>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${selectedSignal.confidence_level * 100}%` }}
                    />
                  </div>
                  <span className="text-white/60 text-xs">
                    {Math.round(selectedSignal.confidence_level * 100)}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/60 text-sm">
                Click on any signal to view detailed information
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}