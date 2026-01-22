"use client"

import type React from "react"
import { useMemo } from "react"
import type { Signal } from "@/lib/maps/types"
import {
  STEEP_COLORS,
  getLifecycleRingRadius,
  calculatePositionWithColorGroupingEvenly,
  calculateTextPosition,
} from "@/lib/maps/utils"

// Helper function to detect collision between two labels
function labelsCollide(
  label1: { x: number; y: number; width: number; height: number },
  label2: { x: number; y: number; width: number; height: number }
): boolean {
  const padding = 4 // Add some padding between labels
  return !(
    label1.x + label1.width + padding < label2.x ||
    label2.x + label2.width + padding < label1.x ||
    label1.y + label1.height + padding < label2.y ||
    label2.y + label2.height + padding < label1.y
  )
}

// Helper function to estimate text dimensions
function estimateTextDimensions(text: string, fontSize: number, isMultiLine: boolean = false): { width: number; height: number } {
  const avgCharWidth = fontSize * 0.6 // Approximate character width
  if (isMultiLine) {
    const words = text.split(' ')
    const midPoint = Math.ceil(words.length / 2)
    const firstLine = words.slice(0, midPoint).join(' ')
    const secondLine = words.slice(midPoint).join(' ')
    const maxLineWidth = Math.max(firstLine.length, secondLine.length) * avgCharWidth
    return {
      width: maxLineWidth,
      height: fontSize * 2.4 // Height for two lines with increased spacing
    }
  }
  return {
    width: text.length * avgCharWidth,
    height: fontSize * 1.2
  }
}

// Helper function to adjust label positions to avoid collisions
function adjustLabelPositions(positionedSignals: PositionedSignal[], textSize: number): PositionedSignal[] {
  const adjusted = [...positionedSignals]
  const centerY = 550

  // First pass: adjust for smart vertical positioning near top/bottom
  adjusted.forEach(signal => {
    const isNearTop = signal.textPos.y < 350
    const isNearBottom = signal.textPos.y > 750

    if (isNearTop || isNearBottom) {
      // Increase line spacing for labels near top/bottom edges
      signal.smartSpacing = true
    }
  })

  // Second pass: minimal collision detection with small adjustments
  // Priority is maintaining circular layout over perfect collision avoidance
  for (let i = 0; i < adjusted.length; i++) {
    const currentSignal = adjusted[i]
    const currentDimensions = estimateTextDimensions(
      currentSignal.signal_name,
      textSize,
      currentSignal.signal_name.split(' ').length > 1 && currentSignal.signal_name.length > 8
    )

    const currentLabel = {
      x: currentSignal.textPos.x - currentDimensions.width / 2,
      y: currentSignal.textPos.y - currentDimensions.height / 2,
      width: currentDimensions.width,
      height: currentDimensions.height
    }

    for (let j = i + 1; j < adjusted.length; j++) {
      const otherSignal = adjusted[j]
      const otherDimensions = estimateTextDimensions(
        otherSignal.signal_name,
        textSize,
        otherSignal.signal_name.split(' ').length > 1 && otherSignal.signal_name.length > 8
      )

      const otherLabel = {
        x: otherSignal.textPos.x - otherDimensions.width / 2,
        y: otherSignal.textPos.y - otherDimensions.height / 2,
        width: otherDimensions.width,
        height: otherDimensions.height
      }

      if (labelsCollide(currentLabel, otherLabel)) {
        // Use minimal nudge distance to preserve circular layout
        // Max 8px adjustment to keep labels close to their datapoints
        const nudgeDistance = Math.min(8, textSize * 0.4)
        const direction = otherSignal.textPos.y < centerY ? -1 : 1
        otherSignal.textPos.y += direction * nudgeDistance
      }
    }
  }

  return adjusted
}

interface PositionedSignal extends Signal {
  circlePos: { x: number; y: number }
  textPos: { x: number; y: number; textAnchor: string }
  color: string
  smartSpacing?: boolean
}

interface MarketMapProps {
  signals: Signal[]
  onSignalClick?: (signal: Signal) => void
  zoom: number
  pan?: { x: number; y: number }
  mobile?: boolean
}

export function MarketMap({ signals, onSignalClick, zoom, pan = { x: 0, y: 0 }, mobile = false }: MarketMapProps) {

  const { positionedSignals, ringRadii } = useMemo(() => {
    const positioned: PositionedSignal[] = []
    const colorOrder = ["social", "technological", "economic", "environmental", "political"]
    // Ring order: inner to outer (established -> disruptor -> emerging)
    const rings = ["established", "disruptor", "emerging"]
    const calculatedRadii: Record<string, number> = {}

    // Use larger center coordinates for expanded render area
    const centerX = 650
    const centerY = 650

    for (const ring of rings) {
      const ringSignals = signals.filter((s) => (s.lifecycle || "disruptor") === ring)
      const radius = getLifecycleRingRadius(ring, ringSignals.length)
      calculatedRadii[ring] = radius

      // Use improved spacing function with new center
      const ringPositioned = calculatePositionWithColorGroupingEvenly(
        ringSignals,
        radius,
        colorOrder,
        (s) => s.steep_driver || "technological",
        centerX,
        centerY,
      )

      ringPositioned.forEach((signal) => {
        const textPos = calculateTextPosition(signal.position.x, signal.position.y, centerX, centerY)

        positioned.push({
          ...signal,
          circlePos: signal.position,
          textPos,
          color: STEEP_COLORS[signal.steep_driver as keyof typeof STEEP_COLORS] || "#666",
        })
      })
    }

    // Apply collision detection and smart positioning
    const adjustedSignals = adjustLabelPositions(positioned, 12) // Use base text size for calculations

    return { positionedSignals: adjustedSignals, ringRadii: calculatedRadii }
  }, [signals])


  // Text gets smaller on zoom to reduce overlap
  const textSize = Math.max(8, Math.min(14, 12 / zoom))
  const ringLabelSize = Math.max(10, Math.min(14, 10 + zoom * 2)) // Minimal zoom scaling

  return (
    <div className="relative w-full h-full">
      <svg
        width="1300"
        height="1300"
        viewBox="0 0 1300 1300"
        className="w-full h-full"
        style={{ background: 'transparent' }}
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        vectorEffect="non-scaling-stroke"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background rings with hover effects and dash patterns */}
        <g className="opacity-20">
          <circle
            cx="650"
            cy="650"
            r={ringRadii.established}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="2 2"
            className="transition-all duration-300 hover:opacity-40 hover:stroke-2"
          />
          <circle
            cx="650"
            cy="650"
            r={ringRadii.disruptor}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="transition-all duration-300 hover:opacity-40 hover:stroke-2"
          />
          <circle
            cx="650"
            cy="650"
            r={ringRadii.emerging}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="8 4"
            className="transition-all duration-300 hover:opacity-40 hover:stroke-2"
          />
        </g>

        {/* Ring labels for better visual distinction - positioned inside rings with padding */}
        <g className="opacity-60">
          <text
            x="650"
            y={650 - ringRadii.established + 25}
            textAnchor="middle"
            className="font-medium fill-current cursor-pointer hover:opacity-80"
            style={{
              fontSize: `${ringLabelSize}px`,
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}
          >
            Established
          </text>
          <text
            x="650"
            y={650 - ringRadii.disruptor + 25}
            textAnchor="middle"
            className="font-medium fill-current cursor-pointer hover:opacity-80"
            style={{
              fontSize: `${ringLabelSize}px`,
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}
          >
            Disruptor
          </text>
          <text
            x="650"
            y={650 - ringRadii.emerging + 25}
            textAnchor="middle"
            className="font-medium fill-current cursor-pointer hover:opacity-80"
            style={{
              fontSize: `${ringLabelSize}px`,
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}
          >
            Emerging
          </text>
        </g>

        {/* Signal nodes with enhanced hover effects */}
        {positionedSignals.map((signal) => (
          <g key={signal._id} className="group">
            {/* Hover glow effect */}
            <circle
              cx={signal.circlePos.x}
              cy={signal.circlePos.y}
              r="8"
              fill={signal.color}
              className="opacity-0 group-hover:opacity-20 transition-all duration-300 ease-out"
              style={{ filter: "blur(4px)" }}
            />
            {/* Main signal node */}
            <circle
              cx={signal.circlePos.x}
              cy={signal.circlePos.y}
              r="4.5"
              fill={signal.color}
              className="cursor-pointer transition-all duration-300 ease-out group-hover:scale-125 group-hover:brightness-110"
              onClick={() => onSignalClick?.(signal)}
              onTouchEnd={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onSignalClick?.(signal)
              }}
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                transformOrigin: `${signal.circlePos.x}px ${signal.circlePos.y}px`,
                touchAction: 'manipulation'
              }}
            />
            {/* Pulse ring effect */}
            <circle
              cx={signal.circlePos.x}
              cy={signal.circlePos.y}
              r="6"
              fill="none"
              stroke={signal.color}
              strokeWidth="1"
              className="opacity-0 group-hover:opacity-60 transition-all duration-500 ease-out group-hover:scale-150"
              style={{ transformOrigin: `${signal.circlePos.x}px ${signal.circlePos.y}px` }}
            />
            {/* Text with wrapping support */}
            {(() => {
              const text = signal.signal_name
              const words = text.split(' ')

              // Use single lines for labels on sides (with horizontal space) even for longer text
              // Only use two lines when vertically constrained (near top/bottom)
              const isVerticallyConstrained = signal.textPos.y < 350 || signal.textPos.y > 750
              const shouldUseSingleLine = words.length <= 1 || !isVerticallyConstrained

              if (shouldUseSingleLine) {
                return (
                  <text
                    x={signal.textPos.x}
                    y={signal.textPos.y}
                    textAnchor={signal.textPos.textAnchor as "start" | "middle" | "end"}
                    className="font-light cursor-pointer drop-shadow-sm transition-all duration-300 group-hover:font-medium group-hover:brightness-125 group-hover:scale-110"
                    fill="#ffffff"
                    onClick={() => onSignalClick?.(signal)}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onSignalClick?.(signal)
                    }}
                    style={{
                      fontSize: `${textSize}px`,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      letterSpacing: "0.025em",
                      transformOrigin: `${signal.textPos.x}px ${signal.textPos.y}px`,
                      touchAction: 'manipulation',
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                  >
                    {text}
                  </text>
                )
              }

              // Split into two lines for better readability
              const midPoint = Math.ceil(words.length / 2)
              const firstLine = words.slice(0, midPoint).join(' ')
              const secondLine = words.slice(midPoint).join(' ')

              // Use enhanced spacing for two-line labels, with smart spacing for edge cases
              const isSmartSpacing = signal.smartSpacing || false
              const firstLineOffset = isSmartSpacing ? textSize * 0.6 : textSize * 0.5
              const secondLineOffset = isSmartSpacing ? textSize * 1.1 : textSize * 0.9

              return (
                <g
                  className="cursor-pointer transition-all duration-300 group-hover:scale-110"
                  onClick={() => onSignalClick?.(signal)}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onSignalClick?.(signal)
                  }}
                  style={{
                    transformOrigin: `${signal.textPos.x}px ${signal.textPos.y}px`,
                    touchAction: 'manipulation'
                  }}
                >
                  <text
                    x={signal.textPos.x}
                    y={signal.textPos.y - firstLineOffset}
                    textAnchor={signal.textPos.textAnchor as "start" | "middle" | "end"}
                    className="font-light drop-shadow-sm transition-all duration-300 group-hover:font-medium group-hover:brightness-125"
                    fill="#ffffff"
                    style={{
                      fontSize: `${textSize}px`,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      letterSpacing: "0.025em",
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                  >
                    {firstLine}
                  </text>
                  <text
                    x={signal.textPos.x}
                    y={signal.textPos.y + secondLineOffset}
                    textAnchor={signal.textPos.textAnchor as "start" | "middle" | "end"}
                    className="font-light drop-shadow-sm transition-all duration-300 group-hover:font-medium group-hover:brightness-125"
                    fill="#ffffff"
                    style={{
                      fontSize: `${textSize}px`,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      letterSpacing: "0.025em",
                      userSelect: 'none',
                      WebkitUserSelect: 'none'
                    }}
                  >
                    {secondLine}
                  </text>
                </g>
              )
            })()}
          </g>
        ))}
      </svg>

    </div>
  )
}