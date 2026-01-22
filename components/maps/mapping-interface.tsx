"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { MarketMap } from "./map-visualization/market-map"
import { EngagementMap } from "./map-visualization/engagement-map"
import { UnderstandingMap } from "./map-visualization/understanding-map"
import { DatapointInfoPanel } from "./datapoint-info-panel"
import { FloatingLegend } from "./floating-legend"
import { ChatWindow } from "./chat-window"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Signal } from "@/lib/maps/types"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSidebar } from "@/components/dashboard/sidebar-context"

type MapType = "market" | "understanding" | "engagement"

export function MappingInterface() {
  const { isCollapsed } = useSidebar()
  const [activeMap, setActiveMap] = useState<MapType>("understanding")
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasMouseMoved, setHasMouseMoved] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [initialMobileZoomSet, setInitialMobileZoomSet] = useState(false)

  // State for managing component interactions
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  const [isInfoCardMinimized, setIsInfoCardMinimized] = useState(false)
  const [hasChatStarted, setHasChatStarted] = useState(false)
  const [isInfoCardCollapsed, setIsInfoCardCollapsed] = useState(false)
  const [infoCardHeight, setInfoCardHeight] = useState(0)
  const [forceExpandInfoCard, setForceExpandInfoCard] = useState(false)

  // Touch-specific state
  const [touchState, setTouchState] = useState({
    touches: 0,
    lastTouchDistance: 0,
    lastTouchCenter: { x: 0, y: 0 }
  })
  const [isMobile, setIsMobile] = useState(false)

  // Use consistent zoom factors and levels to prevent drift
  const ZOOM_FACTOR = 1.05 // Further reduced sensitivity for very smooth zooming
  const MIN_ZOOM = 0.25
  const MAX_ZOOM = 4.0
  const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0] // Discrete zoom levels

  // Fetch signals from Convex
  const signals = useQuery(api.signals.listSignalsWithUpdates, {})

  // Transform signals to match expected format
  const transformedSignals: Signal[] = (signals || []).map(signal => ({
    _id: signal._id,
    id: signal._id, // Add id field for compatibility
    signal_name: signal.name || "Untitled Signal",
    summary: signal.description || null,
    strategic_notes: null,
    confidence_level: signal.confidence || null,
    lifecycle: (signal.lifecycle as Signal['lifecycle']) || null,
    steep_driver: (signal.steep?.[0] as Signal['steep_driver']) || null,
    tsn_layer: null,
    behavior_layer: null,
    scope_impact: null,
    theme_type: null,
    sources: [],
    tags: signal.keywords || [],
    date_added: null,
    last_updated: null,
  }))

  // Filter signals based on active map
  const getFilteredSignals = () => {
    switch (activeMap) {
      case "market":
        return transformedSignals.filter(s => s.lifecycle && s.steep_driver)
      case "engagement":
        // Stable assignment based on signal ID hash
        return transformedSignals.slice(0, 10).map((s, index) => {
          const hash = s._id.charCodeAt(s._id.length - 1) + index
          return {
            ...s,
            tsn_layer: ["tool", "shell", "network"][hash % 3] as Signal['tsn_layer'],
            behavior_layer: ["core", "individual", "community"][(hash + 1) % 3] as Signal['behavior_layer'],
          }
        })
      case "understanding":
        // Stable assignment based on signal ID hash
        return transformedSignals.slice(0, 15).map((s, index) => {
          const hash = s._id.charCodeAt(s._id.length - 1) + index
          return {
            ...s,
            scope_impact: ["immediate", "extended", "distributed"][hash % 3] as Signal['scope_impact'],
            theme_type: ["ur_aggregation", "ur_processing", "ur_analysis", "qol_physical", "qol_mental", "qol_societal"][hash % 6] as Signal['theme_type'],
          }
        })
      default:
        return transformedSignals
    }
  }

  const marketSignals = getFilteredSignals().filter(s => activeMap === "market")
  const engagementSignals = getFilteredSignals().filter(s => activeMap === "engagement")
  const understandingSignals = getFilteredSignals().filter(s => activeMap === "understanding")

  // Combine all signals for chat context
  const allSignals = [...marketSignals, ...engagementSignals, ...understandingSignals]

  // Detect mobile device and set initial mobile zoom
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768
      setIsMobile(isMobileDevice)

      // Set initial zoom for mobile if not already set
      if (isMobileDevice && !initialMobileZoomSet) {
        setZoom(0.75) // Use a more reasonable initial zoom for mobile
        setInitialMobileZoomSet(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Prevent page zoom on mobile
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchstart', preventZoom, { passive: false })
    document.addEventListener('touchmove', preventZoom, { passive: false })

    return () => {
      window.removeEventListener('resize', checkMobile)
      document.removeEventListener('touchstart', preventZoom)
      document.removeEventListener('touchmove', preventZoom)
    }
  }, [initialMobileZoomSet])

  // Helper function to find the closest zoom level to prevent drift
  const snapToZoomLevel = (targetZoom: number): number => {
    return ZOOM_LEVELS.reduce((prev, curr) =>
      Math.abs(curr - targetZoom) < Math.abs(prev - targetZoom) ? curr : prev
    )
  }

  // Helper function to calculate zoom-relative pan adjustment
  const adjustPanForZoom = (currentPan: { x: number; y: number }, oldZoom: number, newZoom: number, centerPoint?: { x: number; y: number }): { x: number; y: number } => {
    if (!centerPoint || !containerRef.current) return currentPan

    const rect = containerRef.current.getBoundingClientRect()
    const containerCenterX = rect.width / 2
    const containerCenterY = rect.height / 2

    // Calculate the world point that the mouse is currently pointing at
    const worldX = (centerPoint.x - containerCenterX - currentPan.x) / oldZoom
    const worldY = (centerPoint.y - containerCenterY - currentPan.y) / oldZoom

    // Calculate what the new pan should be to keep the world point under the mouse
    const newPanX = centerPoint.x - containerCenterX - worldX * newZoom
    const newPanY = centerPoint.y - containerCenterY - worldY * newZoom

    return { x: newPanX, y: newPanY }
  }

  // Helper function to calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Helper function to get center point between two touches
  const getTouchCenter = (touches: React.TouchList): { x: number; y: number } => {
    if (touches.length < 2) {
      return { x: touches[0].clientX, y: touches[0].clientY }
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    }
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      setHasMouseMoved(false)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    },
    [pan],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return

      setHasMouseMoved(true)

      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }

      // Apply reasonable bounds to prevent excessive panning
      const maxPan = 2000 // Maximum pan distance in pixels
      const boundedPan = {
        x: Math.max(-maxPan, Math.min(maxPan, newPan.x)),
        y: Math.max(-maxPan, Math.min(maxPan, newPan.y)),
      }

      setPan(boundedPan)
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const wasClick = isDragging && !hasMouseMoved
    setIsDragging(false)
    setHasMouseMoved(false)

    // Check if clicked on empty space (not on datapoint elements)
    const target = e.target as Element
    const isDatapointElement = target.closest('g.group') || target.closest('circle[onClick]') || target.closest('text[onClick]')

    console.log('MouseUp - wasClick:', wasClick, 'selectedSignal:', !!selectedSignal, 'isDatapointElement:', !!isDatapointElement, 'target:', e.target)

    // If this was a click on empty space, wait to see if it's a double-click before deselecting
    if (wasClick && selectedSignal && !isDatapointElement) {
      // Clear any existing timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
        clickTimeoutRef.current = null
      }

      // Wait 250ms to see if a double-click follows
      clickTimeoutRef.current = setTimeout(() => {
        console.log('Single-click confirmed - deselecting datapoint!')
        setSelectedSignal(null)
        clickTimeoutRef.current = null
      }, 250)
    }
  }, [isDragging, hasMouseMoved, selectedSignal])

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touches = e.touches

    if (touches.length === 1) {
      // Single touch - start pan
      setIsDragging(true)
      setDragStart({ x: touches[0].clientX - pan.x, y: touches[0].clientY - pan.y })
    } else if (touches.length === 2) {
      // Two touches - prepare for pinch zoom
      const distance = getTouchDistance(touches)
      const center = getTouchCenter(touches)
      setTouchState({
        touches: touches.length,
        lastTouchDistance: distance,
        lastTouchCenter: center
      })
      setIsDragging(false)
    }
  }, [pan])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touches = e.touches

    if (touches.length === 1 && isDragging) {
      // Single touch - pan
      const newPan = {
        x: touches[0].clientX - dragStart.x,
        y: touches[0].clientY - dragStart.y,
      }

      // Apply reasonable bounds to prevent excessive panning
      const maxPan = 2000
      const boundedPan = {
        x: Math.max(-maxPan, Math.min(maxPan, newPan.x)),
        y: Math.max(-maxPan, Math.min(maxPan, newPan.y)),
      }

      setPan(boundedPan)
    } else if (touches.length === 2) {
      // Two touches - pinch zoom
      const distance = getTouchDistance(touches)
      const center = getTouchCenter(touches)

      if (touchState.lastTouchDistance > 0) {
        const scale = distance / touchState.lastTouchDistance
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        const centerPoint = {
          x: center.x - rect.left,
          y: center.y - rect.top
        }

        setZoom(prevZoom => {
          const targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom * scale))
          const newZoom = Math.round(targetZoom * 100) / 100

          // Adjust pan to zoom towards pinch center
          setPan(prevPan => adjustPanForZoom(prevPan, prevZoom, newZoom, centerPoint))

          return newZoom
        })
      }

      setTouchState({
        touches: touches.length,
        lastTouchDistance: distance,
        lastTouchCenter: center
      })
    }
  }, [isDragging, dragStart, touchState.lastTouchDistance, adjustPanForZoom])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touches = e.touches

    if (touches.length === 0) {
      // All touches ended
      setIsDragging(false)
      setTouchState({
        touches: 0,
        lastTouchDistance: 0,
        lastTouchCenter: { x: 0, y: 0 }
      })

      // Snap zoom to level after pinch
      setTimeout(() => {
        setZoom(prevZoom => snapToZoomLevel(prevZoom))
      }, 150)
    } else if (touches.length === 1) {
      // Still one touch - switch to pan mode
      setIsDragging(true)
      setDragStart({ x: touches[0].clientX - pan.x, y: touches[0].clientY - pan.y })
      setTouchState({
        touches: 1,
        lastTouchDistance: 0,
        lastTouchCenter: { x: touches[0].clientX, y: touches[0].clientY }
      })
    }
  }, [pan, snapToZoomLevel])

  // Handle datapoint selection with chat minimization
  const handleSignalClick = useCallback((signal: Signal) => {
    setSelectedSignal(signal)
    // When a datapoint is selected, expand info card if it's collapsed (mobile)
    if (isInfoCardCollapsed) {
      setForceExpandInfoCard(true)
      // Reset the force expand flag after a brief moment
      setTimeout(() => setForceExpandInfoCard(false), 100)
    }
    // When a datapoint is selected, expand info card if it's minimized (desktop)
    if (isInfoCardMinimized) {
      setIsInfoCardMinimized(false)
    }
    // When a datapoint is selected, minimize chat if it has started
    if (hasChatStarted) {
      setIsChatMinimized(true)
    }
  }, [hasChatStarted, isInfoCardCollapsed, isInfoCardMinimized])


  // Handle chat start with info card minimization
  const handleChatStart = useCallback(() => {
    setHasChatStarted(true)
    // When chat starts, minimize info card if a signal is selected
    if (selectedSignal) {
      setIsInfoCardMinimized(true)
    }
  }, [selectedSignal])

  // Reset minimization states when selections change
  useEffect(() => {
    if (!selectedSignal) {
      setIsInfoCardMinimized(false)
    }
  }, [selectedSignal])

  useEffect(() => {
    if (!hasChatStarted) {
      setIsChatMinimized(false)
    }
  }, [hasChatStarted])

  const getMapData = () => {
    switch (activeMap) {
      case "market":
        return {
          component: <MarketMap signals={marketSignals} onSignalClick={handleSignalClick} zoom={zoom} pan={pan} mobile={isMobile} />,
          title: "Market Map",
          legendSections: [
            {
              title: "Market Lifecycle",
              items: [
                { label: "Established", key: "established" },
                { label: "Disruptor", key: "disruptor" },
                { label: "Emerging", key: "emerging" },
              ]
            },
            {
              title: "STEEP Drivers",
              items: [
                { label: "Social", color: "#FFDC2E", key: "social" },
                { label: "Technological", color: "#4FB3FF", key: "technological" },
                { label: "Economic", color: "#FF8B24", key: "economic" },
                { label: "Environmental", color: "#34D164", key: "environmental" },
                { label: "Political", color: "#C259FF", key: "political" },
              ]
            }
          ],
        }
      case "understanding":
        return {
          component: <UnderstandingMap signals={understandingSignals} onSignalClick={handleSignalClick} zoom={zoom} pan={pan} mobile={isMobile} />,
          title: "Understanding Map",
          legendSections: [
            {
              title: "Impact Scope",
              items: [
                { label: "Immediate", key: "immediate" },
                { label: "Extended", key: "extended" },
                { label: "Distributed", key: "distributed" },
              ]
            },
            {
              title: "Data Intelligence",
              items: [
                { label: "Aggregation", color: "#5DA7FF", key: "ur_aggregation" },
                { label: "Processing", color: "#34D164", key: "ur_processing" },
                { label: "Analysis", color: "#C52CFF", key: "ur_analysis" },
                { label: "Physical Health", color: "#FFD600", key: "qol_physical" },
                { label: "Mental Health", color: "#E02020", key: "qol_mental" },
                { label: "Social Health", color: "#FF7A2E", key: "qol_societal" },
              ]
            }
          ],
        }
      case "engagement":
        return {
          component: <EngagementMap signals={engagementSignals} onSignalClick={handleSignalClick} zoom={zoom} pan={pan} mobile={isMobile} />,
          title: "Experience Map",
          legendSections: [
            {
              title: "Data as Material",
              items: [
                { label: "Tools", color: "#FFD600", key: "tool" },
                { label: "Shells", color: "#FF9F1C", key: "shell" },
                { label: "Networks", color: "#FF6324", key: "network" },
                // { label: "Settlements", color: "#BF360C", key: "settlement" },
              ]
            },
            {
              title: "Behavior Economy",
              items: [
                { label: "Core", color: "#4DBBFF", key: "core" },
                { label: "Individual", color: "#2B9CFF", key: "individual" },
                { label: "Community", color: "#007BFF", key: "community" },
                // { label: "Societal", color: "#0051A7", key: "societal" },
              ]
            }
          ],
        }
      default:
        return null
    }
  }

  const mapData = getMapData()
  if (!mapData) return null

  // Improved zoom handlers with precise level snapping
  const handleZoomIn = useCallback(() => {
    setZoom(prevZoom => {
      const currentIndex = ZOOM_LEVELS.findIndex(level => level >= prevZoom)
      const nextIndex = currentIndex === -1 ? ZOOM_LEVELS.length - 1 : Math.min(currentIndex + 1, ZOOM_LEVELS.length - 1)
      const newZoom = ZOOM_LEVELS[nextIndex]

      // Only update if zoom actually changes to prevent unnecessary re-renders
      return newZoom !== prevZoom ? newZoom : prevZoom
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prevZoom => {
      const currentIndex = ZOOM_LEVELS.findIndex(level => level >= prevZoom)
      const prevIndex = currentIndex <= 0 ? 0 : currentIndex - 1
      const newZoom = ZOOM_LEVELS[prevIndex]

      // Only update if zoom actually changes to prevent unnecessary re-renders
      return newZoom !== prevZoom ? newZoom : prevZoom
    })
  }, [])

  const handleReset = useCallback(() => {
    setZoom(isMobile ? 0.75 : 1) // Use mobile-appropriate zoom when resetting
    setPan({ x: 0, y: 0 })
  }, [isMobile])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // Prevent any potential conflicts with drag operations
    e.preventDefault()
    e.stopPropagation()

    // Clear any pending single-click timeout to prevent deselection
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }

    // Only zoom if we're not in the middle of a drag operation
    if (!isDragging) {
      handleZoomIn()
    }
  }, [isDragging, handleZoomIn])

  // Add wheel zoom handler for smooth zooming with debouncing
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()

    // Clear any existing timeout
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current)
    }

    const delta = e.deltaY > 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mousePoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    // Immediate zoom for responsiveness
    setZoom(prevZoom => {
      const targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom * delta))
      const newZoom = Math.round(targetZoom * 100) / 100 // Round to prevent tiny precision errors

      // Adjust pan to zoom towards mouse cursor
      setPan(prevPan => adjustPanForZoom(prevPan, prevZoom, newZoom, mousePoint))

      return newZoom
    })

    // Snap to discrete level after a short delay
    wheelTimeoutRef.current = setTimeout(() => {
      setZoom(prevZoom => snapToZoomLevel(prevZoom))
    }, 150)
  }, [snapToZoomLevel, adjustPanForZoom])

  // Add wheel event listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
      // Clean up any pending timeout
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
        wheelTimeoutRef.current = null
      }
    }
  }, [handleWheel])

  // Prevent scrolling on the entire document when on mobile
  useEffect(() => {
    if (isMobile) {
      // Only prevent overflow, don't change positioning
      document.documentElement.style.overflow = 'hidden'

      return () => {
        document.documentElement.style.overflow = ''
      }
    }
  }, [isMobile])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        height: isMobile ? '100dvh' : '100vh', // Use full viewport height
        touchAction: 'none',
        paddingLeft: isMobile ? '0' : (isCollapsed ? '4rem' : '16rem') // Dynamic padding for sidebar
      }}
    >
      {/* Top Left Datapoint Info Panel */}
      <DatapointInfoPanel
        selectedSignal={selectedSignal}
        mapTitle={mapData.title}
        onClose={() => setSelectedSignal(null)}
        activeMap={activeMap}
        onMapChange={setActiveMap}
        mobile={isMobile}
        isMinimized={isInfoCardMinimized}
        onToggleMinimized={() => setIsInfoCardMinimized(!isInfoCardMinimized)}
        onCollapseChange={setIsInfoCardCollapsed}
        onHeightChange={setInfoCardHeight}
        forceExpand={forceExpandInfoCard}
      />

      {/* Bottom Left Floating Legend */}
      <FloatingLegend
        activeMap={activeMap}
        legendSections={mapData.legendSections}
        mobile={isMobile}
        infoPanelCollapsed={isInfoCardCollapsed}
        infoCardHeight={infoCardHeight}
      />


      {/* Navigation Controls with Zoom Indicator - Bottom Center - Hidden on mobile */}
      {!isMobile && (
        <div
          className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-30"
          style={{ bottom: '1.5rem' }}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={handleZoomIn}
            className="backdrop-blur-[16px] bg-black/60 border border-white/10 hover:bg-black/70 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] p-3 rounded-md shadow-sm transition-all duration-300"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="backdrop-blur-[16px] bg-black/60 border border-white/10 px-4 py-2.5 rounded-md text-white text-sm font-medium tracking-wide shadow-sm">
            {Math.round(zoom * 100)}%
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleZoomOut}
            className="backdrop-blur-[16px] bg-black/60 border border-white/10 hover:bg-black/70 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] p-3 rounded-md shadow-sm transition-all duration-300"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleReset}
            className="backdrop-blur-[16px] bg-black/60 border border-white/10 hover:bg-black/70 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] p-3 rounded-md shadow-sm transition-all duration-300"
            title="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main map area with pan functionality */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)",
            willChange: "transform",
          }}
        >
          {mapData.component}
        </div>
      </div>


      {/* Chat Window - Bottom Right */}
      <ChatWindow
        signals={allSignals}
        mobile={isMobile}
        isMinimized={isChatMinimized}
        onToggleMinimized={() => setIsChatMinimized(!isChatMinimized)}
        onChatStart={handleChatStart}
        onChatStateChange={setHasChatStarted}
      />
    </div>
  )
}