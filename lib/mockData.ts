// Mock data and functions to replace Convex dependencies

// Mock useQuery hook that returns static data
export function useMockQuery(endpoint: string, args?: any) {
  // Sources mock data
  if (endpoint.includes('sources')) {
    return [
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
  }

  // Team profiles mock data
  if (endpoint.includes('teamProfiles')) {
    if (endpoint.includes('getAllTeamProfiles')) {
      return [
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
    }
    // Single profile lookup
    return {
      _id: "profile_1",
      name: "Alex Thompson",
      email: "alex.thompson@sysinno.com",
      role: "Senior Innovation Analyst",
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
    };
  }

  // Personal documents mock data
  if (endpoint.includes('personalDocuments')) {
    if (endpoint.includes('Stats')) {
      return {
        totalDocuments: 24,
        completedThisMonth: 7,
        averageConfidence: 0.84,
      };
    }
    return [
      {
        _id: "doc_1",
        title: "Quantum Computing Market Analysis Q4 2024",
        type: "analysis",
        status: "completed",
        lastUpdated: "2024-01-18",
        confidenceScore: 0.92,
      },
    ];
  }

  // Newsletters mock data
  if (endpoint.includes('newsletters')) {
    return [
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
  }

  // Mentions mock data
  if (endpoint.includes('mentions')) {
    return [
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
  }

  // Admin controls mock data
  if (endpoint.includes('adminControls')) {
    return [
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
  }

  // Default empty return
  return [];
}

// Mock useMutation hook that returns success functions
export function useMockMutation(endpoint: string) {
  return async (args: any) => {
    console.log(`Mock mutation called: ${endpoint}`, args);
    return { success: true, ...args };
  };
}

// Export mock api object to replace Convex api
export const mockApi = {
  signals: {
    listSignals: 'signals.listSignals',
    getSignalStats: 'signals.getSignalStats',
    createSignal: 'signals.createSignal',
    updateSignal: 'signals.updateSignal',
    deleteSignal: 'signals.deleteSignal',
    deleteSignals: 'signals.deleteSignals',
  },
  adminControls: {
    getAdminControls: 'adminControls.getAdminControls',
    isLLMProcessingEnabled: 'adminControls.isLLMProcessingEnabled',
    toggleControl: 'adminControls.toggleControl',
    setControlValue: 'adminControls.setControlValue',
    initializeDefaultControls: 'adminControls.initializeDefaultControls',
  },
  sources: {
    listSources: 'sources.listSources',
    getSourceStats: 'sources.getSourceStats',
    createSource: 'sources.createSource',
    updateSource: 'sources.updateSource',
    deleteSource: 'sources.deleteSource',
  },
  teamProfiles: {
    getTeamProfile: 'teamProfiles.getTeamProfile',
    updateTeamProfile: 'teamProfiles.updateTeamProfile',
  },
  personalDocuments: {
    getDocumentsByTeamMember: 'personalDocuments.getDocumentsByTeamMember',
    getDocumentStats: 'personalDocuments.getDocumentStats',
  },
  newsletters: {
    listNewsletters: 'newsletters.listNewsletters',
    getNewsletterStats: 'newsletters.getNewsletterStats',
  },
  mentions: {
    listMentions: 'mentions.listMentions',
    getMentionStats: 'mentions.getMentionStats',
  },
  actions: {
    generatePersonalizedContent: {
      getPersonalizedContentRecommendations: 'actions.generatePersonalizedContent.getPersonalizedContentRecommendations',
    },
  },
};