export type Signal = {
  _id: string
  signal_name: string
  summary?: string | null
  strategic_notes?: string | null
  confidence_level?: number | null
  lifecycle?: "established" | "disruptor" | "emerging" | null
  steep_driver?: "social" | "technological" | "economic" | "environmental" | "political" | null
  tsn_layer?: "tool" | "shell" | "network" | "settlement" | null
  behavior_layer?: "core" | "individual" | "community" | null
  scope_impact?: "immediate" | "extended" | "distributed" | null
  theme_type?: "ur_aggregation" | "ur_processing" | "ur_analysis" | "qol_physical" | "qol_mental" | "qol_societal" | null
  sources?: any[]
  tags?: string[]
  date_added?: string | null
  last_updated?: string | null
}