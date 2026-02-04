"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  User,
  Building2,
  ChevronDown,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface TeamMemberContext {
  id: Id<"team_member_profiles"> | null;
  name: string;
  writingStyle?: string;
  expertise?: string[];
  targetAudience?: string[];
  bio?: string;
  department?: string;
  role?: string;
  isOrganization: boolean;
}

interface TeamMemberSelectorProps {
  value: TeamMemberContext | null;
  onChange: (member: TeamMemberContext) => void;
  className?: string;
  compact?: boolean;
}

const WRITING_STYLE_COLORS: Record<string, string> = {
  strategic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  analytical: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  engaging: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  technical: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  conversational: "bg-green-500/20 text-green-300 border-green-500/30",
};

export function TeamMemberSelector({
  value,
  onChange,
  className,
  compact = false,
}: TeamMemberSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const teamMembers = useQuery(api.teamProfiles.getAllTeamProfiles, {
    includeInactive: false,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const organizationOption: TeamMemberContext = {
    id: null,
    name: "Organization Voice",
    writingStyle: "professional",
    expertise: ["General Business", "Industry Insights"],
    targetAudience: ["broad audience"],
    isOrganization: true,
  };

  const handleSelect = (member: TeamMemberContext) => {
    onChange(member);
    setIsOpen(false);
  };

  const selectedDisplay = value || organizationOption;

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg border transition-all",
          compact
            ? "px-3 py-1.5 text-xs"
            : "px-4 py-2 text-sm",
          "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
          isOpen && "border-purple-500/50 bg-purple-500/10"
        )}
      >
        {selectedDisplay.isOrganization ? (
          <Building2 className={cn("text-[#a3a3a3]", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        ) : (
          <User className={cn("text-purple-400", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        )}
        <span className="text-[#f5f5f5] truncate max-w-[120px]">
          {selectedDisplay.name}
        </span>
        {selectedDisplay.writingStyle && !compact && (
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-medium border",
            WRITING_STYLE_COLORS[selectedDisplay.writingStyle] || "bg-gray-500/20 text-gray-300"
          )}>
            {selectedDisplay.writingStyle}
          </span>
        )}
        <ChevronDown className={cn(
          "text-[#666] transition-transform",
          compact ? "h-3 w-3" : "h-4 w-4",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-[#f5f5f5]">Content Voice</span>
            </div>
            <p className="text-[10px] text-[#666] mt-0.5">
              Select who's perspective to use for AI-generated content
            </p>
          </div>

          {/* Options */}
          <div className="max-h-[300px] overflow-y-auto">
            {/* Organization Option */}
            <button
              onClick={() => handleSelect(organizationOption)}
              className={cn(
                "w-full px-3 py-3 flex items-start gap-3 hover:bg-white/5 transition-all text-left",
                selectedDisplay.isOrganization && "bg-purple-500/10"
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30 flex-shrink-0">
                <Building2 className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#f5f5f5]">Organization Voice</span>
                  {selectedDisplay.isOrganization && (
                    <Check className="h-3.5 w-3.5 text-purple-400" />
                  )}
                </div>
                <p className="text-[10px] text-[#666] mt-0.5">
                  General company voice - professional and balanced
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    professional
                  </span>
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="px-3 py-1.5 border-t border-white/5">
              <span className="text-[10px] text-[#555] uppercase tracking-wider">Team Members</span>
            </div>

            {/* Team Members */}
            {teamMembers?.map((member: any) => {
              const memberContext: TeamMemberContext = {
                id: member._id,
                name: member.name,
                writingStyle: member.writingStyle,
                expertise: member.expertise,
                targetAudience: member.targetAudience,
                bio: member.bio,
                department: member.department,
                role: member.role,
                isOrganization: false,
              };

              const isSelected = value?.id === member._id;

              return (
                <button
                  key={member._id}
                  onClick={() => handleSelect(memberContext)}
                  className={cn(
                    "w-full px-3 py-3 flex items-start gap-3 hover:bg-white/5 transition-all text-left",
                    isSelected && "bg-purple-500/10"
                  )}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30 flex-shrink-0">
                    <User className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#f5f5f5]">{member.name}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-purple-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#666] mt-0.5">
                      {member.role} • {member.department}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {member.writingStyle && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium border",
                          WRITING_STYLE_COLORS[member.writingStyle] || "bg-gray-500/20 text-gray-300"
                        )}>
                          {member.writingStyle}
                        </span>
                      )}
                      {member.expertise?.slice(0, 2).map((exp: string, i: number) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-[#888] border border-white/10"
                        >
                          {exp}
                        </span>
                      ))}
                      {member.expertise?.length > 2 && (
                        <span className="text-[10px] text-[#555]">
                          +{member.expertise.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Loading state */}
            {!teamMembers && (
              <div className="px-3 py-6 text-center text-[#666] text-sm">
                Loading team members...
              </div>
            )}

            {/* Empty state */}
            {teamMembers?.length === 0 && (
              <div className="px-3 py-6 text-center text-[#666] text-sm">
                No team members found. Add team members in Settings.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to build AI context prompt from team member
export function buildVoiceContext(member: TeamMemberContext | null): string {
  if (!member || member.isOrganization) {
    return `Write in a professional, balanced organizational voice that represents the company broadly. Maintain a tone that is informative yet accessible.`;
  }

  const parts: string[] = [];

  parts.push(`Write from the perspective of ${member.name}, ${member.role} in ${member.department}.`);

  if (member.writingStyle) {
    const styleDescriptions: Record<string, string> = {
      strategic: "Use a strategic, high-level perspective focusing on business implications and long-term vision.",
      analytical: "Use an analytical approach with data-driven insights, clear reasoning, and structured arguments.",
      engaging: "Use an engaging, conversational style that connects emotionally while delivering value.",
      technical: "Use a technical, precise style with accurate terminology and detailed explanations.",
      conversational: "Use a friendly, approachable tone that feels like a knowledgeable peer sharing insights.",
    };
    parts.push(styleDescriptions[member.writingStyle] || `Write in a ${member.writingStyle} style.`);
  }

  if (member.expertise && member.expertise.length > 0) {
    parts.push(`Draw on expertise in: ${member.expertise.join(", ")}.`);
  }

  if (member.targetAudience && member.targetAudience.length > 0) {
    parts.push(`Target audience: ${member.targetAudience.join(", ")}.`);
  }

  if (member.bio) {
    parts.push(`Background: ${member.bio}`);
  }

  return parts.join(" ");
}

export default TeamMemberSelector;
