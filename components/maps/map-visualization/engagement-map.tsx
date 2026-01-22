"use client"

import type React from "react"
import { useMemo, useState } from "react"
import type { Signal } from "@/lib/maps/types"
import {
  TSN_COLORS,
  BEHAVIOR_COLORS,
  getTsnRingRadius,
  getBehaviorRingRadius,
  calculateTextPosition,
} from "@/lib/maps/utils"

interface PositionedSignal extends Signal {
  circlePos: { x: number; y: number }
  textPos: { x: number; y: number; textAnchor: string }
  color: string
  hemisphere: string
}

interface EngagementMapProps {
  signals: Signal[]
  onSignalClick?: (signal: Signal) => void
  zoom: number
  pan?: { x: number; y: number }
  mobile?: boolean
}

export function EngagementMap({ signals, onSignalClick, zoom, pan = { x: 0, y: 0 }, mobile = false }: EngagementMapProps) {

  const { positionedSignals, ringRadii } = useMemo(() => {
    const positioned: PositionedSignal[] = []
    const calculatedRadii: Record<string, number> = {}

    // Use larger center coordinates for expanded render area
    const centerX = 650
    const centerY = 650

    // TSN signals (left hemisphere) - evenly spaced with dynamic sizing
    const tsnSignals = signals.filter((s) => s.tsn_layer)
    const tsnRings = ["tool", "shell", "network"] // "settlement" temporarily commented out

    for (const ring of tsnRings) {
      const ringSignals = tsnSignals.filter((s) => (s.tsn_layer || "shell") === ring)
      const radius = getTsnRingRadius(ring, ringSignals.length)
      calculatedRadii[`tsn_${ring}`] = radius

      ringSignals.forEach((signal, index) => {
        // Left hemisphere: angles from π to 2π
        const angle = Math.PI + (index / Math.max(1, ringSignals.length)) * Math.PI
        const circlePos = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        }
        const textPos = calculateTextPosition(circlePos.x, circlePos.y, centerX, centerY)

        positioned.push({
          ...signal,
          circlePos,
          textPos,
          color: TSN_COLORS[signal.tsn_layer as keyof typeof TSN_COLORS] || "#666",
          hemisphere: "tsn",
        })
      })
    }

    // Behavior signals (right hemisphere) - evenly spaced with dynamic sizing
    const behaviorSignals = signals.filter((s) => s.behavior_layer)
    const behaviorRings = ["core", "individual", "community"] // "societal" temporarily commented out

    for (const ring of behaviorRings) {
      const ringSignals = behaviorSignals.filter((s) => (s.behavior_layer || "individual") === ring)
      const radius = getBehaviorRingRadius(ring, ringSignals.length)
      calculatedRadii[`behavior_${ring}`] = radius

      ringSignals.forEach((signal, index) => {
        // Right hemisphere: angles from 0 to π
        const angle = (index / Math.max(1, ringSignals.length)) * Math.PI
        const circlePos = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        }
        const textPos = calculateTextPosition(circlePos.x, circlePos.y, centerX, centerY)

        positioned.push({
          ...signal,
          circlePos,
          textPos,
          color: BEHAVIOR_COLORS[signal.behavior_layer as keyof typeof BEHAVIOR_COLORS] || "#666",
          hemisphere: "behavior",
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
            r={ringRadii.tsn_tool}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="2 2"
            className="transition-all duration-300 hover:opacity-40 hover:stroke-2"
          />
          <circle
            cx="650"
            cy="650"
            r={ringRadii.tsn_shell}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="transition-all duration-300 hover:opacity-40 hover:stroke-2"
          />
          <circle
            cx="650"
            cy="650"
            r={ringRadii.tsn_network}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeDasharray="8 4"
            className="transition-all duration-300 hover:opacity-40 hover:stroke-2"
          />
          {/* Settlement ring temporarily removed */}
        </g>

        {/* Ring labels for better visual distinction - positioned inside rings with padding */}
        <g className="opacity-60">
          <text
            x="650"
            y={650 - ringRadii.tsn_tool + 25}
            textAnchor="middle"
            className="font-medium fill-current cursor-pointer hover:opacity-80"
            style={{
              fontSize: "12px",
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}
          >
            Tools
          </text>
          <text
            x="650"
            y={650 - ringRadii.tsn_shell + 25}
            textAnchor="middle"
            className="font-medium fill-current cursor-pointer hover:opacity-80"
            style={{
              fontSize: "12px",
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}
          >
            Shells
          </text>
          <text
            x="650"
            y={650 - ringRadii.tsn_network + 25}
            textAnchor="middle"
            className="font-medium fill-current cursor-pointer hover:opacity-80"
            style={{
              fontSize: "12px",
              fontFamily: "system-ui, -apple-system, sans-serif"
            }}
          >
            Networks
          </text>
        </g>

        {/* Signal nodes with enhanced hover effects */}
        {positionedSignals.map((signal, index) => (
          <g key={`${signal._id}-${index}`} className="group">
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