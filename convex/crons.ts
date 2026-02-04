import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for scheduled newsletters every 5 minutes
crons.interval(
  "process-scheduled-newsletters",
  { minutes: 5 },
  internal.scheduler.processScheduledNewsletters,
  {}
);

// Collect signals from all sources every 6 hours
crons.interval(
  "collect-signals",
  { hours: 6 },
  internal.scheduler.collectAllSignals,
  {}
);

// Aggregate email metrics every hour
crons.interval(
  "aggregate-metrics",
  { hours: 1 },
  internal.scheduler.aggregateMetrics,
  {}
);

export default crons;
