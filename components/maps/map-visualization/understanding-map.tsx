"use client"

import type React from "react"
import { useMemo, useState } from "react"
import type { Signal } from "@/lib/maps/types"
import {
  UNDERSTANDING_COLORS,
  getScopeRingRadius,
  calculatePositionWithColorGroupingEvenly,
  calculateTextPosition,
} from "@/lib/maps/utils"

interface PositionedSignal extends Signal {
  circlePos: { x: number; y: number }
  textPos: { x: number; y: number; textAnchor: string }
  color: string
}

interface UnderstandingMapProps {
  signals: Signal[]
  onSignalClick?: (signal: Signal) => void
  zoom: number
  pan?: { x: number; y: number }
  mobile?: boolean
}

export function UnderstandingMap({ signals, onSignalClick, zoom, pan = { x: 0, y: 0 }, mobile = false }: UnderstandingMapProps) {

  const { positionedSignals, ringRadii } = useMemo(() => {
    const positioned: PositionedSignal[] = []
    const themeOrder = ["ur_aggregation", "ur_processing", "ur_analysis", "qol_physical", "qol_mental", "qol_societal"]
    const rings = ["immediate", "extended", "distributed"]
    const calculatedRadii: Record<string, number> = {}

    // Use larger center coordinates for expanded render area
    const centerX = 650
    const centerY = 650

    for (const ring of rings) {
      const ringSignals = signals.filter((s) => (s.scope_impact || "extended") === ring)
      const radius = getScopeRingRadius(ring, ringSignals.length)
      calculatedRadii[ring] = radius

      // Use improved spacing function with new center
      const ringPositioned = calculatePositionWithColorGroupingEvenly(
        ringSignals,
        radius,
        themeOrder,
        (s) => s.theme_type || "qol_physical",
        centerX,
        centerY,
      )

      ringPositioned.forEach((signal) => {
        const textPos = calculateTextPosition(signal.position.x, signal.position.y, centerX, centerY)

        positioned.push({
          ...signal,
          circlePos: signal.position,
          textPos,
          color: UNDERSTANDING_COLORS[signal.theme_type as keyof typeof UNDERSTANDING_COLORS] || "#666",
        })
      })
    }

    return { positionedSignals: positioned, ringRadii: calculatedRadii }
  }, [signals])


  // Text gets smaller on zoom to reduce overlap
  const textSize = Math.max(8, Math.min(14, 12 / zoom))

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
            r={ringRadii.immediate}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="2 2"
            className="transition-all duration-300 hover:opacity-40 hover:stroke-2"
          />
          <circle
            cx="650"
            cy="650"
            r={ringRadii.extended}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="transition-all duration-300 hover:opacity-40 hover:stroke-2"
          />
          <circle
            cx="650"
            cy="650"
            r={ringRadii.distributed}
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
            y={650 - ringRadii.immediate + 25}
            textAnchor="middle"
            className="font-medium cursor-pointer hover:opacity-80"
            fill="#ffffff"
            style={{
              fontSize: "12px",
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}
          >
            Immediate
          </text>
          <text
            x="650"
            y={650 - ringRadii.extended + 25}
            textAnchor="middle"
            className="font-medium cursor-pointer hover:opacity-80"
            fill="#ffffff"
            style={{
              fontSize: "12px",
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}
          >
            Extended
          </text>
          <text
            x="650"
            y={650 - ringRadii.distributed + 25}
            textAnchor="middle"
            className="font-medium cursor-pointer hover:opacity-80"
            fill="#ffffff"
            style={{
              fontSize: "12px",
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}
          >
            Distributed
          </text>
        </g>

        {/* Signal nodes with enhanced hover effects */}
        {positionedSignals.map((signal) => {
          // Round coordinates to prevent hydration mismatches
          const cx = Math.round(signal.circlePos.x * 100) / 100
          const cy = Math.round(signal.circlePos.y * 100) / 100
          const textX = Math.round(signal.textPos.x * 100) / 100
          const textY = Math.round(signal.textPos.y * 100) / 100

          return (
            <g key={signal._id} className="group">
            {/* Hover glow effect */}
            <circle
              cx={cx}
              cy={cy}
              r="8"
              fill={signal.color}
              className="opacity-0 group-hover:opacity-20 transition-all duration-300 ease-out"
              style={{ filter: "blur(4px)" }}
            />
            {/* Main signal node */}
            <circle
              cx={cx}
              cy={cy}
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
                transformOrigin: `${cx}px ${cy}px`,
                touchAction: 'manipulation'
              }}
            />
            {/* Pulse ring effect */}
            <circle
              cx={cx}
              cy={cy}
              r="6"
              fill="none"
              stroke={signal.color}
              strokeWidth="1"
              className="opacity-0 group-hover:opacity-60 transition-all duration-500 ease-out group-hover:scale-150"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
            {/* Text with wrapping support */}
            {(() => {
              const text = signal.signal_name
              const words = text.split(' ')

              // Use single lines for labels on sides (with horizontal space) even for longer text
              // Only use two lines when vertically constrained (near top/bottom)
              const isVerticallyConstrained = textY < 350 || textY > 750
              const shouldUseSingleLine = words.length <= 1 || !isVerticallyConstrained

              if (shouldUseSingleLine) {
                return (
                  <text
                    x={textX}
                    y={textY}
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
                      transformOrigin: `${textX}px ${textY}px`,
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

              const firstLineOffset = textSize * 0.5
              const secondLineOffset = textSize * 0.9

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
                    transformOrigin: `${textX}px ${textY}px`,
                    touchAction: 'manipulation'
                  }}
                >
                  <text
                    x={textX}
                    y={textY - firstLineOffset}
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
                    x={textX}
                    y={textY + secondLineOffset}
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
          )
        })}
      </svg>

    </div>
  )
}