"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"
import { EXPLANATIONS } from "@/lib/maps/utils"

interface LegendItem {
  label: string
  color?: string
  key?: string
}

interface LegendSection {
  title: string
  items: LegendItem[]
}

type MapType = "market" | "understanding" | "engagement"

interface FloatingLegendProps {
  activeMap?: MapType
  legendSections?: LegendSection[]
  mobile?: boolean
  infoPanelCollapsed?: boolean
  infoCardHeight?: number
}

export function FloatingLegend({ activeMap, legendSections, mobile = false, infoPanelCollapsed = false, infoCardHeight = 0 }: FloatingLegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is typical tablet breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!legendSections) return null

  // Legend helper functions
  const handleMouseEnter = (item: LegendItem, event: React.MouseEvent) => {
    if (item.key && EXPLANATIONS[item.key as keyof typeof EXPLANATIONS]) {
      const explanation = EXPLANATIONS[item.key as keyof typeof EXPLANATIONS]
      setHoveredItem(explanation)
      setMousePos({ x: event.clientX, y: event.clientY })
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePos({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredItem(null)
  }

  // Define dash patterns for different ring levels
  const getDashPattern = (key: string) => {
    const dashPatterns: Record<string, string> = {
      // Understanding Map patterns
      'immediate': '2,2',
      'extended': '4,4',
      'distributed': '6,3',
      // Market Map patterns
      'established': '2,2',
      'disruptor': '4,4',
      'emerging': '6,3',
      // Engagement Map patterns (3 rings)
      'core': '2,2',
      'individual': '4,4',
      'community': '6,3',
      'tool': '2,2',
      'shell': '4,4',
      'network': '6,3'
    }
    return dashPatterns[key] || null
  }

  const renderLegendItem = (item: LegendItem, index: number) => {
    const dashPattern = item.key ? getDashPattern(item.key) : null

    return (
      <div
        key={index}
        className={`flex items-center ${isMobile ? 'gap-0.5' : 'gap-1.5'} cursor-pointer hover:bg-white/10 dark:hover:bg-black/10 px-1 ${isMobile ? 'py-0' : 'py-0.5'} rounded transition-all duration-200`}
        onMouseEnter={(e) => handleMouseEnter(item, e)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {item.color ? (
          <div className={`${isMobile ? 'w-1 h-1' : 'w-2 h-2'} rounded-full shadow-sm flex-shrink-0`} style={{ backgroundColor: item.color }} />
        ) : dashPattern ? (
          <svg width={isMobile ? "8" : "12"} height={isMobile ? "8" : "12"} className="flex-shrink-0" viewBox="0 0 12 12">
            <circle
              cx="6"
              cy="6"
              r="5"
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="1"
              strokeDasharray={dashPattern}
              opacity="0.8"
            />
          </svg>
        ) : (
          <div className={`${isMobile ? 'w-1 h-1' : 'w-2 h-2'} rounded-full border border-[var(--foreground)] opacity-40 flex-shrink-0`} />
        )}
        <span className={`${isMobile ? 'text-[8px]' : 'text-xs'} font-normal text-[var(--foreground)]`}>
          {item.label}
        </span>
      </div>
    )
  }

  return (
    <>
      <div
        className={`absolute z-40 ${mobile ? 'left-1/2 -translate-x-1/2 w-[calc(100%-1rem)]' : 'bottom-6 left-6'}`}
        style={mobile ? { top: `${infoCardHeight + 4}px` } : {}}
      >
        <div className={`backdrop-blur-[12px] bg-white/60 dark:bg-black/10 border border-black/10 dark:border-white/5 text-card-foreground rounded-md transition-all duration-500 shadow-sm ${isMobile ? 'mx-2' : 'min-w-64 max-w-sm'} ${isMobile ? 'touch-manipulation' : ''}`}>
          {/* Header with collapse button */}
          <div
            className={`${isMobile ? 'px-2 py-1.5' : 'px-4 py-3'} border-b border-[var(--border)] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 tap-highlight-transparent`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand legend" : "Collapse legend"}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[var(--muted-foreground)] uppercase tracking-wide font-medium ${isMobile ? 'text-[9px]' : 'text-xs'}`}>Legend</span>
              <div className={`${isMobile ? 'h-3 w-3' : 'h-5 w-5'} flex items-center justify-center text-[var(--muted-foreground)]`}>
                {isCollapsed ? <ChevronUp className={isMobile ? "h-2 w-2" : "h-3 w-3"} /> : <ChevronDown className={isMobile ? "h-2 w-2" : "h-3 w-3"} />}
              </div>
            </div>
          </div>

          {/* Collapsible content */}
          <div
            className="transition-all duration-300 ease-in-out overflow-hidden"
            style={{
              maxHeight: isCollapsed ? '0px' : isMobile ? '240px' : '400px',
              opacity: isCollapsed ? 0 : 1
            }}
          >
            <div className={`${isMobile ? 'px-2 pb-2 pt-1.5' : 'px-4 pb-4 pt-3'}`}>
              {/* Special layout for Experience map - two columns */}
              {activeMap === 'engagement' ? (
                <div className={`grid grid-cols-2 ${isMobile ? 'gap-x-2' : 'gap-x-4'}`}>
                  {legendSections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h5 className={`text-[var(--foreground)] ${isMobile ? 'text-[9px]' : 'text-xs'} font-semibold opacity-90 mb-1 tracking-wide`}>
                        {section.title}
                      </h5>
                      <div className="space-y-0.5">
                        {section.items.map((item, itemIndex) => renderLegendItem(item, itemIndex))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Standard layout for other maps */
                <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                  {legendSections.map((section, sectionIndex) => {
                    // Check if this section contains ring/lifecycle items (no color)
                    const isRingSection = section.items.every(item => !item.color);

                    // Check if this is STEEP Drivers section
                    const isSteepSection = section.title === 'STEEP Drivers';

                    return (
                      <div key={sectionIndex}>
                        <h5 className={`text-[var(--foreground)] ${isMobile ? 'text-[9px]' : 'text-xs'} font-semibold opacity-90 mb-1 tracking-wide`}>
                          {section.title}
                        </h5>
                        {isRingSection ? (
                          // Horizontal layout for ring items
                          <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'}`}>
                            {section.items.map((item, itemIndex) => renderLegendItem(item, itemIndex))}
                          </div>
                        ) : isSteepSection ? (
                          // Two column layout for STEEP drivers (3 items max per column)
                          <div className={`grid grid-cols-2 ${isMobile ? 'gap-x-2' : 'gap-x-3'} gap-y-0.5`}>
                            {section.items.map((item, itemIndex) => renderLegendItem(item, itemIndex))}
                          </div>
                        ) : (
                          // Special handling for Understanding map mixed colors
                          activeMap === 'understanding' && section.title === 'Data Intelligence' ? (
                            <div className={`grid grid-cols-2 ${isMobile ? 'gap-x-2' : 'gap-x-4'}`}>
                              <div>
                                <h6 className="text-[var(--muted-foreground)] text-[10px] font-medium mb-0.5 tracking-wide">Data Processing</h6>
                                <div className="space-y-0.5">
                                  {section.items
                                    .filter(item => item.key?.startsWith('ur_'))
                                    .map((item, itemIndex) => renderLegendItem(item, itemIndex))}
                                </div>
                              </div>
                              <div>
                                <h6 className="text-[var(--muted-foreground)] text-[10px] font-medium mb-0.5 tracking-wide">Quality of Life</h6>
                                <div className="space-y-0.5">
                                  {section.items
                                    .filter(item => item.key?.startsWith('qol_'))
                                    .map((item, itemIndex) => renderLegendItem(item, itemIndex))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Default vertical layout for other colored items
                            <div className="space-y-0.5">
                              {section.items.map((item, itemIndex) => renderLegendItem(item, itemIndex))}
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hover tooltip for legend items */}
      {hoveredItem && !isMobile && (
        <div
          className="fixed max-w-56 z-50 pointer-events-none backdrop-blur-[12px] bg-white/90 dark:bg-black/90 border border-[var(--border)] rounded-lg shadow-elevated px-3 py-2"
          style={{
            left: mousePos.x + 10,
            top: mousePos.y - 10,
          }}
        >
          <p className="font-light leading-snug text-xs text-[var(--foreground)]">{hoveredItem}</p>
        </div>
      )}
    </>
  )
}