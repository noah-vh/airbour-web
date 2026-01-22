// Updated color palettes from your specifications
export const STEEP_COLORS = {
  social: "#FFDC2E", // Social
  technological: "#4FB3FF", // Technological
  economic: "#FF8B24", // Economic
  environmental: "#34D164", // Environmental
  political: "#C259FF", // Political
}

// Data as Material colors
export const TSN_COLORS = {
  tool: "#FFD600", // Tools
  shell: "#FF9F1C", // Shells
  network: "#FF6324", // Networks
  settlement: "#BF360C", // Settlements
}

// Behavior Economy colors
export const BEHAVIOR_COLORS = {
  core: "#4DBBFF", // Core Behaviors
  individual: "#2B9CFF", // Individual
  community: "#007BFF", // Community
  societal: "#0051A7", // Societal
}

// Understanding Reality colors
export const UNDERSTANDING_COLORS = {
  ur_aggregation: "#5DA7FF", // Data Aggregation
  ur_processing: "#34D164", // Data Processing
  ur_analysis: "#C52CFF", // Data Analyzation
  qol_physical: "#FFD600", // Quality of Life - Physical Health
  qol_mental: "#E02020", // Mental Health
  qol_societal: "#FF7A2E", // Societal Health
}

// Dynamic ring sizing based on signal density with improved spacing
export function calculateOptimalRingRadius(signalCount: number, baseRadius: number): number {
  if (signalCount === 0) return baseRadius

  // More aggressive spacing calculation to prevent overlap
  const minSpacing = 45 // Increased spacing between datapoints
  const labelSpace = 25 // Increased label space
  const totalSpacingNeeded = minSpacing + labelSpace

  const circumference = 2 * Math.PI * baseRadius
  const requiredCircumference = signalCount * totalSpacingNeeded

  if (requiredCircumference > circumference) {
    // Calculate the needed radius with more padding to prevent overlap
    const expandedRadius = (requiredCircumference / (2 * Math.PI)) * 1.15 // 15% padding

    // Allow more expansion to prevent datapoint overlap
    const maxExpansion = baseRadius * 1.8 // Maximum 80% expansion
    return Math.min(expandedRadius, maxExpansion)
  }

  return baseRadius
}

// Ring positioning with improved spacing for better visual separation
export function getLifecycleRingRadius(lifecycle: string, signalCount = 0): number {
  const baseRadii = {
    established: 240,    // Inner ring - increased spacing
    disruptor: 480,      // Middle ring - 240px gap
    emerging: 720,       // Outer ring - 240px gap
  }

  const baseRadius = baseRadii[lifecycle as keyof typeof baseRadii] || 200
  return calculateOptimalRingRadius(signalCount, baseRadius)
}

export function getTsnRingRadius(tsn_layer: string, signalCount = 0): number {
  const baseRadii = {
    tool: 180,          // Inner ring - increased spacing
    shell: 360,         // Second ring - 180px gap
    network: 540,       // Third ring - 180px gap
    settlement: 720,    // Outer ring - 180px gap
  }

  const baseRadius = baseRadii[tsn_layer as keyof typeof baseRadii] || 180
  return calculateOptimalRingRadius(signalCount, baseRadius)
}

export function getBehaviorRingRadius(behavior_layer: string, signalCount = 0): number {
  const baseRadii = {
    core: 180,          // Inner ring - increased spacing
    individual: 360,    // Second ring - 180px gap
    community: 540,     // Third ring - 180px gap
    societal: 720,      // Outer ring - 180px gap
  }

  const baseRadius = baseRadii[behavior_layer as keyof typeof baseRadii] || 180
  return calculateOptimalRingRadius(signalCount, baseRadius)
}

export function getScopeRingRadius(scope_impact: string, signalCount = 0): number {
  const baseRadii = {
    immediate: 180,     // Inner ring - larger spacing
    extended: 320,      // Middle ring - 140px gap
    distributed: 460,   // Outer ring - 140px gap
  }

  const baseRadius = baseRadii[scope_impact as keyof typeof baseRadii] || 200
  return calculateOptimalRingRadius(signalCount, baseRadius)
}

// FIXED: Better color grouping with even spacing
export function calculatePositionWithColorGroupingEvenly(
  signals: any[],
  radius: number,
  colorOrder: string[],
  getColorKey: (signal: any) => string,
  centerX = 450,
  centerY = 450,
): any[] {
  // Group signals by color
  const colorGroups = colorOrder.map((color) => signals.filter((s) => getColorKey(s) === color))

  const positioned: any[] = []
  let globalIndex = 0

  // Calculate total signals for even distribution
  const totalSignals = signals.length

  colorGroups.forEach((colorGroup) => {
    colorGroup.forEach((signal) => {
      // Even spacing around the entire circle
      const angle = (globalIndex / totalSignals) * 2 * Math.PI - Math.PI / 2

      const position = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }

      positioned.push({
        ...signal,
        position,
      })

      globalIndex++
    })
  })

  return positioned
}

// Improved text positioning with better spacing and alignment
export function calculateTextPosition(
  circleX: number,
  circleY: number,
  centerX: number,
  centerY: number,
  offset = 28, // Further increased default offset for better separation
): {
  x: number
  y: number
  textAnchor: string
} {
  const deltaX = circleX - centerX
  const deltaY = circleY - centerY
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  // Normalize the direction vector
  const normalizedX = deltaX / distance
  const normalizedY = deltaY / distance

  // Position text away from center with improved offset calculation
  // Use a larger offset for outer rings to prevent overlap
  const ringAdjustedOffset = distance > 400 ? offset * 1.5 : offset
  const textX = circleX + normalizedX * ringAdjustedOffset
  const textY = circleY + normalizedY * ringAdjustedOffset

  // Improved text anchor logic for better readability
  let textAnchor = "middle"
  if (Math.abs(normalizedX) > 0.4) { // Slightly more sensitive threshold
    textAnchor = normalizedX > 0 ? "start" : "end"
  }

  return { x: textX, y: textY, textAnchor }
}

// Explanations for hover tooltips
export const EXPLANATIONS = {
  // Ring explanations
  immediate: "Effects felt directly by users in the moment of interaction",
  extended: "Effects on users' close environment, daily context, and regular routines",
  distributed: "Ripple effects reaching societal, cultural, or systemic levels",
  established: "Technologies with proven market presence and stable user adoption",
  disruptor: "Active challengers to established players, reshaping markets",
  emerging: "Nascent developments with high potential but uncertain outcomes",

  // Theme explanations
  ur_aggregation: "Collection and initial organization of information from multiple sources",
  ur_processing: "Transformation of raw information into more useful forms and patterns",
  ur_analysis: "Examination and modeling of processed information to discover insights",
  qol_physical: "Innovations affecting bodily systems, physical capabilities, and biological functioning",
  qol_mental: "Individual psychological wellbeing and ability to cope with everyday stresses",
  qol_societal: "Community wellbeing determined by social system quality and economic conditions",

  // TSN explanations
  tool: "Objects or devices used to perform specific tasks or functions",
  shell: "Systems that contain human activity performed with or on tools",
  network: "Physical layouts and communication systems that enable connection",
  settlement: "Comprehensive environments where human life can evolve in communal groups",

  // Behavior explanations
  core: "Basic human needs and motivations that drive fundamental decision-making",
  individual: "Specific behaviors exhibited by individuals in various contexts",
  community: "Patterns of behavior that emerge from collective actions within groups",
  societal: "Large-scale behavioral patterns that influence institutional and cultural norms",

  // Group explanations
  understanding_reality: "How humans intellectually engage with information and transform it into actionable knowledge",
  quality_of_life: "How innovations affect human flourishing across physical, mental, and societal dimensions",
  data_as_material: "The technological infrastructure and embodiment layers that enable human-computer interaction",
  behavior_economy: "The scale and scope of human behavioral patterns from individual to societal levels",
  steep_drivers: "External macro-environmental forces that create opportunities and drive innovation timing",
}