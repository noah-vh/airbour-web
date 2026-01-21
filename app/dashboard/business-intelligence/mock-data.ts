import {
  Briefcase,
  DollarSign,
  Users,
  Target,
  Search,
  Phone,
  Calendar,
  Truck,
  CreditCard,
  Star,
} from "lucide-react";

export const mockBusinessData = {
  // Key metrics for the dashboard
  keyMetrics: [
    {
      label: "Market Opportunity",
      value: "$2.4M",
      change: "+18% YoY",
      icon: DollarSign,
    },
    {
      label: "Competitor Count",
      value: "12",
      change: "+3 new entrants",
      icon: Briefcase,
    },
    {
      label: "Target Segments",
      value: "5",
      change: "2 underserved",
      icon: Users,
    },
    {
      label: "Price Position",
      value: "Below Market",
      change: "15% gap",
      icon: Target,
    },
  ],

  // Competitive landscape data
  competitors: [
    {
      id: "comp-1",
      name: "Elite Catering Co",
      description: "Premium full-service catering with established corporate contracts",
      location: "Downtown Chicago",
      size: "50+ employees",
      priceRange: "$$$",
      threat: "high",
      targetCustomers: ["Investment Banks", "Law Firms", "Fortune 500"],
      differentiators: [
        "White-glove service",
        "24/7 concierge support",
        "Custom menu development",
        "Net-30 payment terms",
      ],
      operationalPatterns: [
        "One-button repeat ordering",
        "Dedicated account managers",
        "Same-day emergency catering",
      ],
    },
    {
      id: "comp-2",
      name: "Quick Bites Catering",
      description: "Fast, affordable catering focused on volume and efficiency",
      location: "West Loop",
      size: "20-30 employees",
      priceRange: "$",
      threat: "medium",
      targetCustomers: ["Startups", "Schools", "Non-profits"],
      differentiators: [
        "Lowest price guarantee",
        "2-hour delivery window",
        "No minimum order",
        "Online-only ordering",
      ],
      operationalPatterns: [
        "Automated order confirmation",
        "GPS delivery tracking",
        "Subscription meal plans",
      ],
    },
    {
      id: "comp-3",
      name: "Fusion Kitchen Catering",
      description: "Multi-cuisine catering with focus on dietary restrictions",
      location: "North Side",
      size: "30-40 employees",
      priceRange: "$$",
      threat: "medium",
      targetCustomers: ["Tech Companies", "Healthcare", "Universities"],
      differentiators: [
        "30+ cuisine options",
        "Certified allergen-free kitchen",
        "Nutritionist-approved menus",
        "Eco-friendly packaging",
      ],
      operationalPatterns: [
        "Dietary preference profiles",
        "Recurring order templates",
        "Carbon-neutral delivery",
      ],
    },
    {
      id: "comp-4",
      name: "Corporate Cuisine Solutions",
      description: "B2B-only catering specializing in recurring corporate accounts",
      location: "Loop",
      size: "40+ employees",
      priceRange: "$$$",
      threat: "high",
      targetCustomers: ["Banks", "Consulting Firms", "Insurance Companies"],
      differentiators: [
        "Invoice billing",
        "Quarterly business reviews",
        "Executive chef consultations",
        "Event planning services",
      ],
      operationalPatterns: [
        "ERP integration",
        "Approval workflow system",
        "Dedicated delivery fleet",
      ],
    },
    {
      id: "comp-5",
      name: "Mama's Kitchen Express",
      description: "Family-style comfort food catering with homemade appeal",
      location: "South Side",
      size: "10-15 employees",
      priceRange: "$$",
      threat: "low",
      targetCustomers: ["Community Centers", "Churches", "Local Businesses"],
      differentiators: [
        "Family recipes",
        "Generous portions",
        "Local sourcing",
        "Personal touch service",
      ],
      operationalPatterns: [
        "Phone-based ordering",
        "Cash discounts",
        "Loyalty program",
      ],
    },
  ],

  // Pricing comparison data
  pricingComparison: [
    {
      service: "Per Person (Basic)",
      current: "$11",
      marketAvg: "$14",
      premium: "$22",
      recommendation: "+$3",
    },
    {
      service: "Per Person (Premium)",
      current: "$16",
      marketAvg: "$20",
      premium: "$35",
      recommendation: "+$4",
    },
    {
      service: "Delivery Fee",
      current: "$25",
      marketAvg: "$40",
      premium: "$0 (included)",
      recommendation: "+$15",
    },
    {
      service: "Setup Service",
      current: "Not offered",
      marketAvg: "$75",
      premium: "$150",
      recommendation: "Add at $75",
    },
    {
      service: "Minimum Order",
      current: "$150",
      marketAvg: "$200",
      premium: "$500",
      recommendation: "Keep current",
    },
  ],

  // Customer insights from interviews
  customerInsights: {
    themes: [
      {
        theme: "Reliability Over Price",
        description: "Consistent on-time delivery matters more than saving 10-15% on cost",
        sentiment: "positive",
        frequency: 78,
      },
      {
        theme: "Payment Flexibility",
        description: "Need net-30 or net-60 terms for accounting workflows",
        sentiment: "neutral",
        frequency: 65,
      },
      {
        theme: "Order Simplicity",
        description: "Want to reorder previous selections with one click",
        sentiment: "negative",
        frequency: 82,
      },
      {
        theme: "Quality Consistency",
        description: "Food quality varies too much between orders",
        sentiment: "negative",
        frequency: 45,
      },
      {
        theme: "Dietary Options",
        description: "Need better labeling and more diverse dietary accommodations",
        sentiment: "neutral",
        frequency: 71,
      },
      {
        theme: "Executive Presentation",
        description: "Board meeting catering needs elevated presentation",
        sentiment: "positive",
        frequency: 34,
      },
    ],
    quotes: [
      {
        text: "We switched caterers three times last year because they couldn't consistently deliver on time. I'd happily pay 20% more for reliability.",
        source: "Sarah Chen",
        role: "Executive Assistant, Chase Bank",
        category: "Reliability",
      },
      {
        text: "The food is great, but ordering takes forever. Why can't I just click 'repeat last order' like with everything else?",
        source: "Michael Rodriguez",
        role: "Office Manager, Tech Startup",
        category: "Ordering",
      },
      {
        text: "Our accounting requires net-60 terms. Most caterers want payment upfront or net-15 at best. It's a dealbreaker.",
        source: "Jennifer Park",
        role: "Procurement Lead, Insurance Corp",
        category: "Payment",
      },
      {
        text: "We have 12 people with different dietary restrictions. Clear labeling and separate packaging would make my life so much easier.",
        source: "David Thompson",
        role: "HR Director, Marketing Agency",
        category: "Dietary",
      },
    ],
  },

  // Customer journey mapping
  customerJourney: [
    {
      stage: "Discovery",
      satisfaction: 4,
      painPoints: ["Hard to find authentic Mexican catering", "No clear USP visible"],
      icon: Search,
    },
    {
      stage: "Evaluation",
      satisfaction: 6,
      painPoints: ["No online menu", "Can't see pricing upfront"],
      icon: Calendar,
    },
    {
      stage: "Ordering",
      satisfaction: 3,
      painPoints: ["Phone-only ordering", "No order confirmation"],
      icon: Phone,
    },
    {
      stage: "Delivery",
      satisfaction: 8,
      painPoints: ["No tracking available"],
      icon: Truck,
    },
    {
      stage: "Payment",
      satisfaction: 5,
      painPoints: ["Cash/check only", "No invoicing option"],
      icon: CreditCard,
    },
    {
      stage: "Feedback",
      satisfaction: 7,
      painPoints: ["No systematic follow-up"],
      icon: Star,
    },
  ],

  // Strategic planning data
  strategicPlan: [
    {
      timeframe: "90d",
      goal: "Establish Digital Presence",
      target: "Launch online ordering & payment",
      progress: 35,
      milestones: [
        { title: "Website development", completed: true },
        { title: "Online menu system", completed: true },
        { title: "Payment gateway integration", completed: false },
        { title: "Order management system", completed: false },
      ],
      metrics: {
        orders: "150/mo",
        revenue: "$45k",
        customers: "25",
      },
    },
    {
      timeframe: "90d",
      goal: "Secure First Corporate Accounts",
      target: "3 recurring B2B contracts",
      progress: 67,
      milestones: [
        { title: "Develop B2B sales materials", completed: true },
        { title: "First corporate tastings", completed: true },
        { title: "Close first contract", completed: false },
      ],
    },
    {
      timeframe: "1y",
      goal: "Scale Operations",
      target: "$100k monthly revenue",
      progress: 22,
      milestones: [
        { title: "Hire dedicated delivery team", completed: false },
        { title: "Implement CRM system", completed: false },
        { title: "Launch customer portal", completed: false },
        { title: "Achieve 50 corporate accounts", completed: false },
      ],
      metrics: {
        orders: "500/mo",
        revenue: "$100k",
        customers: "75",
      },
    },
    {
      timeframe: "3y",
      goal: "Market Leadership",
      target: "$5M annual revenue",
      progress: 8,
      milestones: [
        { title: "Open central kitchen facility", completed: false },
        { title: "Launch franchise model", completed: false },
        { title: "Expand to Milwaukee & Indianapolis", completed: false },
        { title: "IPO preparation", completed: false },
      ],
      metrics: {
        orders: "2000/mo",
        revenue: "$400k/mo",
        customers: "300+",
      },
    },
    {
      timeframe: "10y",
      goal: "National Expansion",
      target: "$50M revenue, 20 cities",
      progress: 2,
      milestones: [
        { title: "Establish brand nationwide", completed: false },
        { title: "Technology platform licensing", completed: false },
        { title: "Strategic acquisition completed", completed: false },
        { title: "Public offering", completed: false },
      ],
      metrics: {
        cities: "20",
        revenue: "$50M",
        valuation: "$200M",
      },
    },
  ],

  // 90-day action items
  ninetyDayActions: [
    {
      id: "action-1",
      week: "W1",
      action: "Launch basic website with menu and contact info",
      owner: "Marketing Team",
      priority: "high",
    },
    {
      id: "action-2",
      week: "W2",
      action: "Implement online ordering system",
      owner: "Tech Team",
      priority: "high",
    },
    {
      id: "action-3",
      week: "W3",
      action: "Set up Stripe payment processing",
      owner: "Finance Team",
      priority: "high",
    },
    {
      id: "action-4",
      week: "W4",
      action: "Create corporate sales deck",
      owner: "Sales Team",
      priority: "medium",
    },
    {
      id: "action-5",
      week: "W5",
      action: "Schedule 10 corporate tastings",
      owner: "Sales Team",
      priority: "high",
    },
    {
      id: "action-6",
      week: "W6",
      action: "Implement CRM for lead tracking",
      owner: "Operations",
      priority: "medium",
    },
    {
      id: "action-7",
      week: "W8",
      action: "Launch email marketing campaign",
      owner: "Marketing Team",
      priority: "low",
    },
    {
      id: "action-8",
      week: "W10",
      action: "Hire first dedicated sales person",
      owner: "HR Team",
      priority: "medium",
    },
    {
      id: "action-9",
      week: "W11",
      action: "Implement customer feedback system",
      owner: "Operations",
      priority: "low",
    },
    {
      id: "action-10",
      week: "W12",
      action: "Close first 3 corporate contracts",
      owner: "Sales Team",
      priority: "high",
    },
  ],
};