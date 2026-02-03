import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  formatForTwitterThread,
  formatForInstagram,
  calculateVideoDuration,
  extractVideoHooks,
  extractBRollSuggestions,
} from '@/lib/platformFormatters';

export function LinkedInPreview({ content }: { content: string }) {
  const charCount = content.length;
  const hashtagCount = (content.match(/#\w+/g) || []).length;

  return (
    <Card className="p-6 bg-[#0a0a0a]/80 border border-white/5">
      <div className="flex justify-between mb-4">
        <Badge variant={charCount > 3000 ? 'destructive' : 'default'}>
          {charCount} / 3000 chars
        </Badge>
        <Badge variant="outline">{hashtagCount} hashtags</Badge>
      </div>
      <div className="bg-white text-black p-6 rounded-lg">
        <div className="whitespace-pre-wrap font-sans text-sm">{content}</div>
      </div>
    </Card>
  );
}

export function TwitterThreadPreview({ content }: { content: string }) {
  const tweets = formatForTwitterThread(content);

  return (
    <div className="space-y-4">
      {tweets.map((tweet, i) => (
        <Card key={i} className="p-4 bg-white text-black">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-bold">Your Account</div>
              <div className="text-sm text-gray-600">@youraccount</div>
              <div className="mt-2 text-sm">{tweet}</div>
              <div className="text-xs text-gray-500 mt-2">
                {tweet.length} / 280 chars
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function InstagramPreview({ content }: { content: string }) {
  const { caption, slides } = formatForInstagram(content);

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-[#0a0a0a]/80 border border-white/5">
        <h4 className="font-semibold text-[#f5f5f5] mb-2">Caption</h4>
        <div className="bg-white text-black p-4 rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{caption}</p>
          <div className="text-xs text-gray-500 mt-2">
            {caption.length} / 2200 chars
          </div>
        </div>
      </Card>

      {slides.length > 0 && (
        <Card className="p-6 bg-[#0a0a0a]/80 border border-white/5">
          <h4 className="font-semibold text-[#f5f5f5] mb-2">Carousel Slides ({slides.length})</h4>
          <div className="grid grid-cols-2 gap-3">
            {slides.map((slide, i) => (
              <div key={i} className="bg-white text-black p-3 rounded-lg">
                <div className="text-xs font-semibold mb-1">Slide {i + 1}</div>
                <p className="text-xs">{slide}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export function VideoScriptPreview({ content, platform }: { content: string; platform: string }) {
  const duration = calculateVideoDuration(content);
  const hooks = extractVideoHooks(content);
  const bRoll = extractBRollSuggestions(content);

  return (
    <Card className="p-6 bg-[#0a0a0a]/80 border border-white/5">
      <div className="flex gap-2 mb-4 flex-wrap">
        <Badge>Duration: ~{duration}s</Badge>
        <Badge variant="outline">{hooks.length} hooks</Badge>
        <Badge variant="outline">{bRoll.length} B-roll shots</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-[#f5f5f5] mb-2">Script</h4>
          <div className="bg-gray-900 p-4 rounded font-mono text-xs whitespace-pre-wrap text-gray-300 max-h-96 overflow-y-auto">
            {content}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-[#f5f5f5] mb-2">Visual Elements</h4>
          <div className="space-y-4">
            {hooks.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[#a3a3a3] mb-1">Hooks:</p>
                <ul className="text-xs text-[#666] space-y-1">
                  {hooks.map((h, i) => <li key={i}>• {h}</li>)}
                </ul>
              </div>
            )}
            {bRoll.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[#a3a3a3] mb-1">B-Roll:</p>
                <ul className="text-xs text-[#666] space-y-1">
                  {bRoll.map((b, i) => <li key={i}>• {b}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function PlatformPreview({ content, platform }: { content: string; platform: string }) {
  switch (platform) {
    case 'linkedin':
      return <LinkedInPreview content={content} />;
    case 'twitter':
      return <TwitterThreadPreview content={content} />;
    case 'instagram':
      return <InstagramPreview content={content} />;
    case 'tiktok':
    case 'youtube_shorts':
    case 'ig_reels':
    case 'youtube':
      return <VideoScriptPreview content={content} platform={platform} />;
    default:
      return (
        <Card className="p-6 bg-[#0a0a0a]/80 border border-white/5">
          <div className="whitespace-pre-wrap text-[#f5f5f5]">{content}</div>
        </Card>
      );
  }
}
