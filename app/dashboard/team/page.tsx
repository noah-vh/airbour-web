"use client";

import { useState } from "react";
import { useQuery, useMutation, api } from "@/lib/mockConvexTyped";
import type { TeamProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import {
  Users,
  FileText,
  TrendingUp,
  Brain,
  Settings,
  Plus,
  User,
  Calendar,
  BarChart3,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

export default function TeamDashboard() {
  const { isCollapsed } = useSidebar();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Queries
  const teamProfiles = useQuery<TeamProfile[]>(api.teamProfiles.getAllTeamProfiles);
  const initializeProfiles = useMutation(api.teamProfiles.initializeDefaultProfiles);

  // Initialize default profiles if none exist
  const handleInitializeProfiles = async () => {
    try {
      const result = await initializeProfiles({ adminUserId: "admin-user-1" });
      toast.success(result.message);
    } catch (error: any) {
      toast.error("Failed to initialize profiles: " + error.message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (teamProfiles === undefined) {
    return (
      <div className={cn(
        "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
        isCollapsed ? "left-16" : "left-64"
      )}>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 animate-spin text-purple-400" />
            <span className="text-[#f5f5f5]">Loading team dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Users className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Team Content Hub</h1>
            <p className="text-sm text-[#a3a3a3]">Manage team member profiles and personalized content generation</p>
          </div>
          <div className="flex items-center gap-2">
            {teamProfiles && teamProfiles.length === 0 && (
              <button
                onClick={handleInitializeProfiles}
                className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-blue-500/20 flex items-center gap-2"
              >
                <Plus className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-300">Initialize Profiles</span>
              </button>
            )}
            <Link href="/dashboard/team/new">
              <button className="glass bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-purple-500/20 flex items-center gap-2">
                <Plus className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-purple-300">Add Team Member</span>
              </button>
            </Link>
          </div>
        </motion.div>

        {teamProfiles && teamProfiles.length === 0 ? (
          /* Empty State */
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Users className="h-16 w-16 text-[#666] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-[#f5f5f5]">No Team Members Yet</h3>
            <p className="text-[#a3a3a3] mb-6">
              Get started by adding team member profiles to enable personalized content generation
            </p>
            <button
              onClick={handleInitializeProfiles}
              className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg px-6 py-3 transition-standard hover:bg-blue-500/20 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5 text-blue-400" />
              <span className="text-blue-300">Initialize Default Profiles (Louise, Tania, Russ)</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Overview Stats */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6 transition-standard"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#a3a3a3]">
                        Team Members
                      </p>
                      <p className="text-2xl font-bold text-[#f5f5f5]">
                        {teamProfiles?.filter(p => p.isActive).length || 0}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6 transition-standard"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#a3a3a3]">
                        Content Pieces
                      </p>
                      <p className="text-2xl font-bold text-[#f5f5f5]">24</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                      <MessageSquare className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6 transition-standard"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#a3a3a3]">
                        Documents
                      </p>
                      <p className="text-2xl font-bold text-[#f5f5f5]">12</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                      <FileText className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6 transition-standard"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#a3a3a3]">
                        This Month
                      </p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <p className="text-2xl font-bold text-[#f5f5f5]">+15%</p>
                      </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/30">
                      <BarChart3 className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Team Members Grid */}
            <motion.div variants={itemVariants}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-[#f5f5f5]">Team Members</h2>
                <p className="text-[#a3a3a3]">
                  Manage individual team member profiles and content generation settings
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamProfiles?.map((profile) => (
                  <motion.div
                    key={profile._id}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="transition-all duration-200"
                  >
                    <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6 hover:border-purple-500/30 transition-standard">
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                              <span className="text-lg font-semibold text-purple-300">
                                {profile.name.split(" ").map(n => n[0]).join("")}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-[#f5f5f5]">{profile.name}</h3>
                              <p className="text-sm text-[#a3a3a3]">
                                {profile.role}
                              </p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                            profile.isActive
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}>
                            {profile.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Expertise Tags */}
                        <div>
                          <p className="text-sm font-medium mb-2 text-[#f5f5f5]">Primary Expertise</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.primaryExpertise.slice(0, 2).map((expertise) => (
                              <span key={expertise} className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md text-xs">
                                {expertise}
                              </span>
                            ))}
                            {profile.primaryExpertise.length > 2 && (
                              <span className="px-2 py-1 bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded-md text-xs">
                                +{profile.primaryExpertise.length - 2}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Communication Style */}
                        <div>
                          <p className="text-sm font-medium mb-2 text-[#f5f5f5]">Communication Style</p>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-md text-xs">
                              {profile.communicationStyle.tone}
                            </span>
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-md text-xs">
                              {profile.communicationStyle.formality}
                            </span>
                          </div>
                        </div>

                        {/* Content Performance */}
                        <div>
                          <p className="text-sm font-medium mb-2 text-[#f5f5f5]">Profile Completion</p>
                          <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                            <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <p className="text-xs text-[#a3a3a3] mt-1">85% complete</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                          <Link
                            href={`/dashboard/team/${profile._id}`}
                            className="flex-1 glass bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 transition-standard hover:bg-purple-500/20 flex items-center justify-center gap-2"
                          >
                            <User className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-purple-300">View Profile</span>
                          </Link>
                          <Link
                            href={`/dashboard/team/${profile._id}/create-content`}
                            className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 transition-standard hover:bg-blue-500/20 flex items-center justify-center gap-2"
                          >
                            <Brain className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-blue-300">Create Content</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#f5f5f5]">Quick Actions</h3>
                  <p className="text-sm text-[#a3a3a3]">
                    Common tasks for team content management
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/dashboard/team/bulk-content"
                    className="glass bg-green-500/10 border border-green-500/20 rounded-lg p-6 transition-standard hover:bg-green-500/20 flex flex-col items-center justify-center gap-3 h-24"
                  >
                    <MessageSquare className="h-6 w-6 text-green-400" />
                    <span className="text-sm text-green-300 font-medium">Bulk Content Generation</span>
                  </Link>

                  <Link
                    href="/dashboard/team/content-calendar"
                    className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 transition-standard hover:bg-blue-500/20 flex flex-col items-center justify-center gap-3 h-24"
                  >
                    <Calendar className="h-6 w-6 text-blue-400" />
                    <span className="text-sm text-blue-300 font-medium">Content Calendar</span>
                  </Link>

                  <Link
                    href="/dashboard/team/analytics"
                    className="glass bg-purple-500/10 border border-purple-500/20 rounded-lg p-6 transition-standard hover:bg-purple-500/20 flex flex-col items-center justify-center gap-3 h-24"
                  >
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                    <span className="text-sm text-purple-300 font-medium">Team Analytics</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}