"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import {
  User,
  Settings,
  FileText,
  Brain,
  TrendingUp,
  Upload,
  Edit,
  Save,
  Plus,
  MessageSquare,
  BarChart3,
  Calendar,
  Tag,
  Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export default function TeamMemberPage() {
  const { isCollapsed } = useSidebar();
  const params = useParams();
  const memberId = params.memberId as Id<"team_member_profiles">;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // Queries
  const teamProfile = useQuery(api.teamProfiles.getTeamProfile, { profileId: memberId });
  const documents = useQuery(api.personalDocuments.getDocumentsByTeamMember, {
    teamMemberId: memberId,
  });
  const documentStats = useQuery(api.personalDocuments.getDocumentStats, {
    teamMemberId: memberId,
  });

  // Mutations
  const updateProfile = useMutation(api.teamProfiles.updateTeamProfile);
  const generateRecommendations = useMutation(api.actions.generatePersonalizedContent.getPersonalizedContentRecommendations);

  const handleSave = async () => {
    if (!editData) return;

    try {
      await updateProfile({
        profileId: memberId,
        updates: editData,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
      setEditData(null);
    } catch (error: any) {
      toast.error("Failed to update profile: " + error.message);
    }
  };

  const startEditing = () => {
    setEditData({
      name: teamProfile?.name,
      role: teamProfile?.role,
      primaryExpertise: teamProfile?.primaryExpertise || [],
      secondaryExpertise: teamProfile?.secondaryExpertise || [],
      focusAreas: teamProfile?.focusAreas || [],
    });
    setIsEditing(true);
  };

  if (!teamProfile) {
    return (
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Team Member Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The requested team member profile doesn't exist.
              </p>
              <Button asChild>
                <Link href="/dashboard/team">Back to Team Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={teamProfile.avatarUrl} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                  {teamProfile.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editData?.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="text-2xl font-bold"
                    />
                    <Input
                      value={editData?.role || ""}
                      onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                      className="text-gray-600"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {teamProfile.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {teamProfile.role}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={startEditing}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button asChild>
                    <Link href={`/dashboard/team/${memberId}/create-content`}>
                      <Brain className="h-4 w-4 mr-2" />
                      Create Content
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Status and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                    <Badge variant={teamProfile.isActive ? "default" : "secondary"} className="mt-1">
                      {teamProfile.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <User className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documents</p>
                    <p className="text-2xl font-bold">{documentStats?.totalDocuments || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Insights</p>
                    <p className="text-2xl font-bold">{documentStats?.totalInsights || 0}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Performance</p>
                    <p className="text-2xl font-bold">85%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-md">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expertise */}
              <Card>
                <CardHeader>
                  <CardTitle>Expertise & Focus Areas</CardTitle>
                  <CardDescription>
                    Core competencies and areas of specialization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Primary Expertise</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData?.primaryExpertise?.join(", ") || ""}
                        onChange={(e) => setEditData({
                          ...editData,
                          primaryExpertise: e.target.value.split(", ").filter(Boolean)
                        })}
                        placeholder="Enter comma-separated expertise areas"
                        className="mt-2"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {teamProfile.primaryExpertise.map((expertise) => (
                          <Badge key={expertise} variant="default">
                            {expertise}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Secondary Expertise</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData?.secondaryExpertise?.join(", ") || ""}
                        onChange={(e) => setEditData({
                          ...editData,
                          secondaryExpertise: e.target.value.split(", ").filter(Boolean)
                        })}
                        placeholder="Enter comma-separated expertise areas"
                        className="mt-2"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {teamProfile.secondaryExpertise.map((expertise) => (
                          <Badge key={expertise} variant="outline">
                            {expertise}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Focus Areas</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData?.focusAreas?.join(", ") || ""}
                        onChange={(e) => setEditData({
                          ...editData,
                          focusAreas: e.target.value.split(", ").filter(Boolean)
                        })}
                        placeholder="Enter comma-separated focus areas"
                        className="mt-2"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {teamProfile.focusAreas.map((area) => (
                          <Badge key={area} variant="secondary">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Communication Style */}
              <Card>
                <CardHeader>
                  <CardTitle>Communication Style</CardTitle>
                  <CardDescription>
                    How this team member communicates and creates content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Tone</Label>
                      <p className="text-lg font-semibold capitalize mt-1">
                        {teamProfile.communicationStyle.tone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Formality</Label>
                      <p className="text-lg font-semibold capitalize mt-1">
                        {teamProfile.communicationStyle.formality}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Preferred Formats</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {teamProfile.communicationStyle.preferredFormats.map((format) => (
                        <Badge key={format} variant="outline">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Content Characteristics</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Uses Case Studies</span>
                        <Badge variant={teamProfile.communicationStyle.usesCaseStudies ? "default" : "secondary"}>
                          {teamProfile.communicationStyle.usesCaseStudies ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Uses Data & Stats</span>
                        <Badge variant={teamProfile.communicationStyle.usesDataAndStats ? "default" : "secondary"}>
                          {teamProfile.communicationStyle.usesDataAndStats ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Uses Personal Stories</span>
                        <Badge variant={teamProfile.communicationStyle.usesPersonalStories ? "default" : "secondary"}>
                          {teamProfile.communicationStyle.usesPersonalStories ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Content Preferences</CardTitle>
                <CardDescription>
                  Topics, hashtags, and call-to-action styles this member prefers
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium">Favorite Topics</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teamProfile.contentPreferences?.favoriteTopics?.map((topic) => (
                      <Badge key={topic} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Common Hashtags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teamProfile.contentPreferences?.commonHashtags?.map((hashtag) => (
                      <Badge key={hashtag} variant="secondary" className="text-xs">
                        #{hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Call-to-Action Style</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {teamProfile.contentPreferences?.callToActionStyle || "Standard"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Documents</CardTitle>
                  <CardDescription>
                    Documents uploaded to personalize content generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {documents && documents.length > 0 ? (
                    <div className="space-y-4">
                      {documents.map((doc) => (
                        <div key={doc._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {doc.insights?.length || 0} insights extracted
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{doc.category}</Badge>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Documents Yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Upload documents to personalize content generation for this team member
                      </p>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Documents</span>
                    <span className="font-semibold">{documentStats?.totalDocuments || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Insights</span>
                    <span className="font-semibold">{documentStats?.totalInsights || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Categories</span>
                    <span className="font-semibold">{documentStats?.categories || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>
                  Content pieces created for this team member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Content Generated Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start generating personalized content for this team member
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/team/${memberId}/create-content`}>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Content
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Content performance and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Detailed analytics will be available once content is generated
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Active Status</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable or disable this team member profile
                    </p>
                  </div>
                  <Badge variant={teamProfile.isActive ? "default" : "secondary"}>
                    {teamProfile.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium text-red-600">Danger Zone</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Permanently delete this team member profile
                      </p>
                    </div>
                    <Button variant="destructive">
                      Delete Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}