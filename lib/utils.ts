import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistanceToNow(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

/**
 * Get display name for a mention's source
 * Returns format like "Reddit (r/technology)" or "HackerNews (new)"
 * Falls back to source name if no sub-source info is available
 */
export function getSourceDisplayName(
  source: { name: string; type: string; config?: any },
  mention: { sourceMetadata?: { customFields?: any } }
): string {
  const baseName = source.name;
  const customFields = mention.sourceMetadata?.customFields;

  if (!customFields) {
    return baseName;
  }

  // Reddit: show subreddit
  if (source.type === "reddit" && customFields.subreddit) {
    const subreddit = customFields.subreddit.startsWith("r/")
      ? customFields.subreddit
      : `r/${customFields.subreddit}`;

    // Optionally include sort if it's not the default "hot"
    if (customFields.sort && customFields.sort !== "hot") {
      return `${baseName} (${subreddit}, ${customFields.sort})`;
    }

    return `${baseName} (${subreddit})`;
  }

  // HackerNews: show category
  if (source.type === "hackernews" && customFields.category) {
    return `${baseName} (${customFields.category})`;
  }

  // GitHub: show query or repo
  if (source.type === "github") {
    if (customFields.query) {
      return `${baseName} (${customFields.query})`;
    }
    if (customFields.repo) {
      return `${baseName} (${customFields.repo})`;
    }
    if (customFields.repoOwner && customFields.repoName) {
      return `${baseName} (${customFields.repoOwner}/${customFields.repoName})`;
    }
  }

  // Universal: show section
  if (source.type === "universal" && customFields.section) {
    return `${baseName} (${customFields.section})`;
  }

  return baseName;
}