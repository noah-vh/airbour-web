export interface PlatformConstraints {
  maxCharacters?: number;
  maxDuration?: number;
  maxHashtags?: number;
  aspectRatio?: string;
}

export function formatForLinkedIn(content: string): string {
  let formatted = content;

  // Add strategic line breaks every 2-3 sentences
  formatted = formatted.replace(/([.!?])\s+/g, '$1\n\n');

  // Limit to 3000 characters
  if (formatted.length > 3000) {
    formatted = formatted.substring(0, 2950) + '... [Read more]';
  }

  // Ensure hashtags at end
  const hashtagMatch = formatted.match(/#\w+/g);
  if (hashtagMatch && hashtagMatch.length > 5) {
    // Keep only 5 hashtags
    const hashtags = hashtagMatch.slice(0, 5);
    formatted = formatted.replace(/#\w+/g, '');
    formatted += '\n\n' + hashtags.join(' ');
  }

  return formatted;
}

export function formatForTwitterThread(content: string): string[] {
  const tweets: string[] = [];
  const sentences = content.split(/[.!?]+\s+/);

  let currentTweet = '';
  let tweetNumber = 1;

  for (const sentence of sentences) {
    if ((currentTweet + sentence).length > 250) {
      // Add tweet number
      tweets.push(`${tweetNumber}/ ${currentTweet.trim()}`);
      tweetNumber++;
      currentTweet = sentence + '. ';
    } else {
      currentTweet += sentence + '. ';
    }
  }

  if (currentTweet.trim()) {
    tweets.push(`${tweetNumber}/ ${currentTweet.trim()}`);
  }

  // Add thread emoji to first tweet
  if (tweets.length > 0) {
    tweets[0] = '🧵 ' + tweets[0];
  }

  return tweets;
}

export function formatForInstagram(content: string): {
  caption: string;
  slides: string[];
} {
  const sections = content.split(/\n\n+/);
  const caption = sections[0].substring(0, 2200);

  // Create 3-5 slides from remaining content
  const slides: string[] = [];
  for (let i = 1; i < Math.min(6, sections.length); i++) {
    slides.push(sections[i].substring(0, 150));
  }

  return { caption, slides };
}

export function formatForVideoScript(
  content: string,
  platform: 'tiktok' | 'youtube' | 'youtube_shorts' | 'ig_reels'
): string {
  const maxDurations = {
    tiktok: 180,
    youtube_shorts: 60,
    ig_reels: 90,
    youtube: 600,
  };

  const maxDuration = maxDurations[platform];
  const maxWords = Math.floor(maxDuration * 2.5); // 2.5 words per second

  const words = content.split(/\s+/);
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }

  return content;
}

export function validateContent(content: string, platform: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const constraints: Record<string, PlatformConstraints> = {
    linkedin: { maxCharacters: 3000, maxHashtags: 5 },
    twitter: { maxCharacters: 280 },
    instagram: { maxCharacters: 2200 },
    tiktok: { maxDuration: 180 },
    youtube_shorts: { maxDuration: 60 },
    ig_reels: { maxDuration: 90 },
  };

  const config = constraints[platform];
  if (!config) return { valid: true, errors: [], warnings: [] };

  if (config.maxCharacters && content.length > config.maxCharacters) {
    errors.push(`Content exceeds ${config.maxCharacters} character limit (${content.length} chars)`);
  }

  if (config.maxHashtags) {
    const hashtagCount = (content.match(/#\w+/g) || []).length;
    if (hashtagCount > config.maxHashtags) {
      warnings.push(`${hashtagCount} hashtags used, recommended: ${config.maxHashtags}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function calculateVideoDuration(script: string): number {
  const words = script.split(/\s+/).length;
  return Math.ceil(words / 2.5); // ~150 words per minute for video = 2.5 words/sec
}

export function extractVideoHooks(script: string): string[] {
  const hookMatches = script.match(/Hook:\s*(.+?)(?:\n|$)/gi) || [];
  return hookMatches.map(h => h.replace(/Hook:\s*/i, '').trim());
}

export function extractBRollSuggestions(script: string): string[] {
  const bRollMatches = script.match(/\[([^\]]+)\]/g) || [];
  return bRollMatches.map(b => b.replace(/[\[\]]/g, ''));
}
