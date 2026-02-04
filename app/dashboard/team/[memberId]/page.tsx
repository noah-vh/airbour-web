"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Edit3,
  Save,
  X,
  FileText,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";

// Mock data
const mockProfile = {
  _id: "profile_1",
  name: "Alex Thompson",
  email: "alex.thompson@airbour.com",
  role: "Senior Innovation Analyst",
  department: "Research & Development",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  joinDate: "2022-03-15",
  bio: "Passionate about emerging technologies and their impact on business transformation. Specializes in AI/ML trends and quantum computing applications.",
  skills: ["AI/ML", "Quantum Computing", "Data Analysis", "Strategic Planning", "Innovation Management"],
  interests: ["Technological Disruption", "Sustainable Innovation", "Digital Transformation"],
  recentActivity: "Last active 2 hours ago",
};

const mockDocuments = [
  {
    _id: "doc_1",
    title: "Quantum Computing Market Analysis Q4 2024",
    type: "analysis",
    status: "completed",
    lastUpdated: "2024-01-18",
    confidenceScore: 0.92,
  },
  {
    _id: "doc_2",
    title: "AI Ethics Framework Implementation",
    type: "framework",
    status: "in-progress",
    lastUpdated: "2024-01-19",
    confidenceScore: 0.78,
  },
  {
    _id: "doc_3",
    title: "Emerging Tech Trends 2025 Forecast",
    type: "forecast",
    status: "draft",
    lastUpdated: "2024-01-20",
    confidenceScore: 0.65,
  },
];

const mockStats = {
  totalDocuments: 24,
  completedThisMonth: 7,
  averageConfidence: 0.84,
  topSkillAreas: ["AI/ML", "Quantum Computing", "Strategic Analysis"],
};

export default function TeamMemberProfile() {
  const params = useParams();
  const memberId = params.memberId as string;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const handleSave = async () => {
    // Mock save functionality
    console.log("Saving profile changes:", editData);
    setIsEditing(false);
    setEditData(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...mockProfile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "draft":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-muted border border-blue/30">
              <User className="h-6 w-6 text-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Team Member Profile</h1>
              <p className="text-sm text-muted-foreground">Detailed view and analytics</p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-muted border border-blue/20 text-blue hover:bg-blue/20 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span className="text-sm font-medium">Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-500/10 border border-gray-500/20 text-gray-400 hover:bg-gray-500/20 transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="text-sm font-medium">Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-muted border border-green-400/20 text-green-400 hover:bg-green-400/20 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span className="text-sm font-medium">Save</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-muted border border-blue/30 flex items-center justify-center">
                    <User className="h-8 w-8 text-blue" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{mockProfile.name}</h2>
                    <p className="text-muted-foreground">{mockProfile.role}</p>
                    <p className="text-sm text-muted-foreground">{mockProfile.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{mockProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{mockProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{mockProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Joined {formatDate(mockProfile.joinDate)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted border border-border">
                  <h4 className="font-medium text-foreground mb-2">Bio</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{mockProfile.bio}</p>
                </div>
              </div>
            </div>

            {/* Skills & Interests */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Skills & Expertise</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Core Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockProfile.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 rounded text-xs font-medium bg-blue-muted text-blue border border-blue/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Research Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockProfile.interests.map((interest, index) => (
                      <span key={index} className="px-2 py-1 rounded text-xs font-medium bg-purple-muted text-purple border border-purple/20">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-foreground">Total Documents</span>
                  </div>
                  <span className="text-xl font-bold text-blue-400">{mockStats.totalDocuments}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-foreground">This Month</span>
                  </div>
                  <span className="text-xl font-bold text-green-400">{mockStats.completedThisMonth}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Target className="h-4 w-4 text-purple" />
                    <span className="text-foreground">Avg Confidence</span>
                  </div>
                  <span className="text-xl font-bold text-purple">
                    {Math.round(mockStats.averageConfidence * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground">{mockProfile.recentActivity}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Documents</h3>
          <div className="space-y-3">
            {mockDocuments.map((doc) => (
              <div key={doc._id} className="p-4 rounded-lg bg-muted border border-border hover:bg-muted/80 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">{doc.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>Updated {formatDate(doc.lastUpdated)}</span>
                      <span>•</span>
                      <span>Confidence: {Math.round(doc.confidenceScore * 100)}%</span>
                    </div>
                  </div>
                  <div className={cn("px-2 py-1 rounded text-xs font-medium border", getStatusColor(doc.status))}>
                    {doc.status.replace('-', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}