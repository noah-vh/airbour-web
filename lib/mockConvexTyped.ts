import { Source, TeamProfile, DocumentStats, PersonalDocument, Newsletter, Mention, AdminControl, Signal } from './types';

// Typed mock data
const mockSources: Source[] = [
  {
    _id: "source_1",
    name: "TechCrunch",
    url: "https://techcrunch.com",
    type: "news",
    status: "active",
    credibility: 0.85,
    lastCrawled: Date.now() - 1000 * 60 * 60, // 1 hour ago
    signalsFound: 23,
  },
  {
    _id: "source_2",
    name: "MIT Technology Review",
    url: "https://technologyreview.com",
    type: "academic",
    status: "active",
    credibility: 0.95,
    lastCrawled: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    signalsFound: 15,
  },
  {
    _id: "source_3",
    name: "Wired",
    url: "https://wired.com",
    type: "magazine",
    status: "paused",
    credibility: 0.78,
    lastCrawled: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    signalsFound: 8,
  },
];

const mockTeamProfiles: TeamProfile[] = [
  {
    _id: "profile_1",
    name: "Louise Chen",
    email: "louise.chen@sysinno.com",
    role: "AI Research Lead",
    department: "Research & Development",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "2022-03-15",
    bio: "Passionate about emerging technologies and their applications in business innovation.",
    avatarUrl: "",
    isActive: true,
    primaryExpertise: ["Artificial Intelligence", "Machine Learning", "Data Science", "Innovation Strategy"],
    communicationStyle: {
      tone: "analytical",
      formality: "professional",
      preferredFormats: ["detailed reports", "technical documentation"],
    },
  },
  {
    _id: "profile_2",
    name: "Tania Rodriguez",
    email: "tania.rodriguez@sysinno.com",
    role: "Innovation Strategist",
    department: "Strategy",
    phone: "+1 (555) 234-5678",
    location: "Austin, TX",
    joinDate: "2021-08-20",
    bio: "Expert in translating technological trends into actionable business strategies.",
    avatarUrl: "",
    isActive: true,
    primaryExpertise: ["Business Strategy", "Market Analysis", "Technology Trends", "Innovation Management"],
    communicationStyle: {
      tone: "strategic",
      formality: "business-casual",
      preferredFormats: ["executive summaries", "strategic presentations"],
    },
  },
  {
    _id: "profile_3",
    name: "Russ Kim",
    email: "russ.kim@sysinno.com",
    role: "Technology Analyst",
    department: "Engineering",
    phone: "+1 (555) 345-6789",
    location: "Seattle, WA",
    joinDate: "2023-01-10",
    bio: "Focused on emerging technologies and their practical implementation in enterprise environments.",
    avatarUrl: "",
    isActive: true,
    primaryExpertise: ["Software Engineering", "Cloud Technologies", "DevOps", "System Architecture"],
    communicationStyle: {
      tone: "technical",
      formality: "informal",
      preferredFormats: ["technical blogs", "implementation guides"],
    },
  },
];

const mockAdminControls: AdminControl[] = [
  {
    _id: "control_1",
    key: "llm_processing_enabled",
    label: "LLM Processing",
    description: "Enable AI-powered content analysis and generation",
    type: "boolean",
    value: true,
    category: "AI Processing",
    order: 1,
  },
  {
    _id: "control_2",
    key: "auto_source_crawling",
    label: "Auto Source Crawling",
    description: "Automatically crawl and analyze new content from sources",
    type: "boolean",
    value: true,
    category: "Data Collection",
    order: 2,
  },
  {
    _id: "control_3",
    key: "sentiment_analysis",
    label: "Sentiment Analysis",
    description: "Analyze sentiment of mentions and content",
    type: "boolean",
    value: false,
    category: "AI Processing",
    order: 3,
  },
  {
    _id: "control_4",
    key: "max_daily_crawls",
    label: "Max Daily Crawls",
    description: "Maximum number of source crawls per day",
    type: "number",
    value: 100,
    category: "Limits",
    order: 4,
  },
];

const mockNewsletters: Newsletter[] = [
  {
    _id: "newsletter_1",
    title: "Innovation Weekly #47",
    status: "sent",
    sentDate: "2024-01-15",
    openRate: 0.78,
    clickRate: 0.23,
    subscribers: 1250,
  },
];

const mockMentions: Mention[] = [
  {
    _id: "mention_1",
    content: "Revolutionary breakthrough in quantum computing announced by IBM",
    source: "TechCrunch",
    url: "https://techcrunch.com/quantum-breakthrough",
    sentiment: 0.85,
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    relevance: 0.92,
  },
];

const mockDocumentStats: DocumentStats = {
  totalDocuments: 24,
  completedThisMonth: 7,
  averageConfidence: 0.84,
};

const mockPersonalDocuments: PersonalDocument[] = [
  {
    _id: "doc_1",
    title: "Quantum Computing Market Analysis Q4 2024",
    type: "analysis",
    status: "completed",
    lastUpdated: "2024-01-18",
    confidenceScore: 0.92,
  },
];

const mockSignals: Signal[] = [
  {
    _id: "signal_1",
    title: "AI Model Efficiency Breakthrough",
    description: "New neural network architecture achieves 40% better performance",
    source: "MIT Technology Review",
    url: "https://technologyreview.com/ai-breakthrough",
    relevance: 0.95,
    confidence: 0.88,
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    status: "active",
    category: "Artificial Intelligence",
    tags: ["AI", "Machine Learning", "Performance"],
  },
];

// Typed useQuery function
export function useQuery<T>(endpoint: string, args?: any): T | undefined {
  // Admin controls
  if (endpoint === 'adminControls.getAdminControls') {
    return mockAdminControls as T;
  }

  if (endpoint === 'adminControls.isLLMProcessingEnabled') {
    return true as T;
  }

  // Sources
  if (endpoint === 'sources.listSources') {
    return mockSources as T;
  }

  // Team profiles
  if (endpoint === 'teamProfiles.getAllTeamProfiles') {
    return mockTeamProfiles as T;
  }

  if (endpoint === 'teamProfiles.getTeamProfile') {
    return mockTeamProfiles[0] as T;
  }

  // Personal documents
  if (endpoint === 'personalDocuments.getDocumentStats') {
    return mockDocumentStats as T;
  }

  if (endpoint === 'personalDocuments.getDocumentsByTeamMember') {
    return mockPersonalDocuments as T;
  }

  // Newsletters
  if (endpoint === 'newsletters.listNewsletters') {
    return mockNewsletters as T;
  }

  // Mentions
  if (endpoint === 'mentions.listMentions') {
    return mockMentions as T;
  }

  // Signals
  if (endpoint === 'signals.listSignals') {
    return mockSignals as T;
  }

  return undefined;
}

// Typed useMutation function
export function useMutation<T = any>(endpoint: string) {
  return async (args?: any): Promise<T> => {
    console.log(`Mock mutation called: ${endpoint}`, args);

    if (endpoint.includes('toggleControl')) {
      return { success: true, newValue: !args?.currentValue, message: 'Control toggled' } as T;
    }

    if (endpoint.includes('initializeDefaultControls') || endpoint.includes('initializeDefaultProfiles')) {
      return { success: true, message: 'Initialized successfully' } as T;
    }

    return { success: true, ...args } as T;
  };
}

// Export the typed api object
export const api = {
  adminControls: {
    getAdminControls: 'adminControls.getAdminControls' as const,
    isLLMProcessingEnabled: 'adminControls.isLLMProcessingEnabled' as const,
    toggleControl: 'adminControls.toggleControl' as const,
    setControlValue: 'adminControls.setControlValue' as const,
    initializeDefaultControls: 'adminControls.initializeDefaultControls' as const,
  },
  sources: {
    listSources: 'sources.listSources' as const,
    getSourceStats: 'sources.getSourceStats' as const,
    createSource: 'sources.createSource' as const,
    updateSource: 'sources.updateSource' as const,
    deleteSource: 'sources.deleteSource' as const,
  },
  teamProfiles: {
    getAllTeamProfiles: 'teamProfiles.getAllTeamProfiles' as const,
    getTeamProfile: 'teamProfiles.getTeamProfile' as const,
    updateTeamProfile: 'teamProfiles.updateTeamProfile' as const,
    initializeDefaultProfiles: 'teamProfiles.initializeDefaultProfiles' as const,
  },
  personalDocuments: {
    getDocumentsByTeamMember: 'personalDocuments.getDocumentsByTeamMember' as const,
    getDocumentStats: 'personalDocuments.getDocumentStats' as const,
  },
  newsletters: {
    listNewsletters: 'newsletters.listNewsletters' as const,
    getNewsletterStats: 'newsletters.getNewsletterStats' as const,
  },
  mentions: {
    listMentions: 'mentions.listMentions' as const,
    getMentionStats: 'mentions.getMentionStats' as const,
  },
  signals: {
    listSignals: 'signals.listSignals' as const,
    getSignalStats: 'signals.getSignalStats' as const,
    createSignal: 'signals.createSignal' as const,
    updateSignal: 'signals.updateSignal' as const,
    deleteSignal: 'signals.deleteSignal' as const,
    deleteSignals: 'signals.deleteSignals' as const,
  },
  actions: {
    generatePersonalizedContent: {
      getPersonalizedContentRecommendations: 'actions.generatePersonalizedContent.getPersonalizedContentRecommendations' as const,
    },
  },
};