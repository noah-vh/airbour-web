"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  const teamProfiles = useQuery(api.teamProfiles.getAllTeamProfiles, {});
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Team Content Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage team member profiles and personalized content generation
              </p>
            </div>
            <div className="flex items-center gap-3">
              {teamProfiles && teamProfiles.length === 0 && (
                <Button onClick={handleInitializeProfiles} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Initialize Default Profiles
                </Button>
              )}
              <Button asChild>
                <Link href="/dashboard/team/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {teamProfiles && teamProfiles.length === 0 ? (
          /* Empty State */
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Team Members Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by adding team member profiles to enable personalized content generation
            </p>
            <Button onClick={handleInitializeProfiles} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Initialize Default Profiles (Louise, Tania, Russ)
            </Button>
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
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Team Members
                        </p>
                        <p className="text-2xl font-bold">
                          {teamProfiles?.filter(p => p.isActive).length || 0}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Content Pieces
                        </p>
                        <p className="text-2xl font-bold">0</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Documents
                        </p>
                        <p className="text-2xl font-bold">0</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          This Month
                        </p>
                        <p className="text-2xl font-bold">
                          <TrendingUp className="h-5 w-5 inline mr-1 text-green-500" />
                          +15%
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Team Members Grid */}
            <motion.div variants={itemVariants}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Team Members</h2>
                <p className="text-gray-600 dark:text-gray-400">
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
                    <Card className="hover:shadow-lg border-2 hover:border-blue-200 dark:hover:border-blue-800">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={profile.avatarUrl} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {profile.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">{profile.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {profile.role}
                              </p>
                            </div>
                          </div>
                          <Badge variant={profile.isActive ? "default" : "secondary"}>
                            {profile.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Expertise Tags */}
                        <div>
                          <p className="text-sm font-medium mb-2">Primary Expertise</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.primaryExpertise.slice(0, 2).map((expertise) => (
                              <Badge key={expertise} variant="outline" className="text-xs">
                                {expertise}
                              </Badge>
                            ))}
                            {profile.primaryExpertise.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.primaryExpertise.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Communication Style */}
                        <div>
                          <p className="text-sm font-medium mb-2">Communication Style</p>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {profile.communicationStyle.tone}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {profile.communicationStyle.formality}
                            </Badge>
                          </div>
                        </div>

                        {/* Content Performance */}
                        <div>
                          <p className="text-sm font-medium mb-2">Profile Completion</p>
                          <Progress value={85} className="h-2" />
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">85% complete</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                          <Button asChild size="sm" className="flex-1">
                            <Link href={`/dashboard/team/${profile._id}`}>
                              <User className="h-4 w-4 mr-2" />
                              View Profile
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/team/${profile._id}/create-content`}>
                              <Brain className="h-4 w-4 mr-2" />
                              Create Content
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks for team content management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button asChild variant="outline" className="h-16 flex-col">
                      <Link href="/dashboard/team/bulk-content">
                        <MessageSquare className="h-6 w-6 mb-2" />
                        Bulk Content Generation
                      </Link>
                    </Button>

                    <Button asChild variant="outline" className="h-16 flex-col">
                      <Link href="/dashboard/team/content-calendar">
                        <Calendar className="h-6 w-6 mb-2" />
                        Content Calendar
                      </Link>
                    </Button>

                    <Button asChild variant="outline" className="h-16 flex-col">
                      <Link href="/dashboard/team/analytics">
                        <BarChart3 className="h-6 w-6 mb-2" />
                        Team Analytics
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}