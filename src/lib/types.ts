export type Language = 'en' | 'hi' | 'hinglish' | 'bn' | 'ta' | 'te' | 'mr' | 'gu';

export type SchemeCategory =
  | 'education'
  | 'agriculture'
  | 'pension'
  | 'welfare'
  | 'employment'
  | 'health'
  | 'housing'
  | 'finance';

export interface EligibilityRule {
  id: string;
  label: string;
  description: string;
  field: string;
  operator: 'eq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'bool';
  value: string | number | boolean | string[];
}

export interface GovernmentScheme {
  id: string;
  name: string;
  nameHi?: string;
  category: SchemeCategory;
  department: string;
  shortDescription: string;
  description: string;
  eligibility: EligibilityRule[];
  eligibilitySummary: string;
  requiredDocuments: string[];
  applicationProcess: string[];
  officialSource: string;
  sourceUrl: string;
  lastVerified: string;
  availability: 'national' | 'state';
  states?: string[];
  applicationDeadline?: string;
  benefits: string;
  tags: string[];
}

export interface CitizenProfile {
  age?: number;
  state?: string;
  district?: string;
  occupation?: string;
  isStudent?: boolean;
  incomeRange?: string;
  gender?: string;
  hasDisability?: boolean;
  location?: 'rural' | 'urban';
  isFarmer?: boolean;
  employmentStatus?: 'employed' | 'unemployed' | 'student' | 'self-employed';
}

export type ComplaintCategory =
  | 'garbage'
  | 'potholes'
  | 'streetlight'
  | 'water'
  | 'drainage'
  | 'road'
  | 'safety'
  | 'dumping'
  | 'other';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'escalated';

export interface ComplaintStatusEvent {
  status: ComplaintStatus;
  timestamp: string;
  note: string;
  by: string;
}

export interface Complaint {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: ComplaintStatus;
  department: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    area: string;
  };
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  timeline: ComplaintStatusEvent[];
  isMock: boolean;
  assignedTo?: string;
}

export type JourneyEventType =
  | 'scheme_discovered'
  | 'eligibility_checked'
  | 'documents_prepared'
  | 'application_started'
  | 'complaint_submitted'
  | 'complaint_updated'
  | 'complaint_escalated'
  | 'issue_resolved'
  | 'ai_consultation';

export interface CivicJourneyEvent {
  id: string;
  type: JourneyEventType;
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
  relatedType?: 'scheme' | 'complaint' | 'document';
  icon: string;
}

export interface DocumentChecklistItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded?: boolean;
  status?: 'verified' | 'missing_field' | 'expired' | 'unreadable' | 'pending';
  analysis?: string;
}

export interface DocumentAnalysis {
  documentType: string;
  extractedFields: { label: string; value: string; masked: boolean }[];
  readability: number;
  issues: string[];
  status: 'verified' | 'missing_field' | 'expired' | 'unreadable';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: CitationSource[];
  confidence?: number;
  intent?: string;
  language?: Language;
  actions?: RecommendedAction[];
  transparency?: TransparencyInfo;
  isTyping?: boolean;
}

export interface CitationSource {
  title: string;
  url: string;
  department: string;
  lastVerified: string;
  reliability: 'official' | 'verified' | 'unverified';
}

export interface TransparencyInfo {
  userInfoConsidered: string[];
  rulesMatched: string[];
  sourcesRetrieved: string[];
  uncertainties: string[];
  reasoning: string;
}

export interface RecommendedAction {
  id: string;
  label: string;
  type: 'navigate' | 'apply' | 'check' | 'report' | 'escalate' | 'prepare';
  target?: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DemoPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  state: string;
  description: string;
  profile: CitizenProfile;
  suggestedQuery: string;
  journey: string[];
  color: string;
}

export interface DashboardStats {
  schemesDiscovered: number;
  applicationsPrepared: number;
  documentsCompleted: number;
  complaintsSubmitted: number;
  complaintsResolved: number;
  avgResolutionTime: string;
  civicImpactScore: number;
}

export interface AdminMetrics {
  totalComplaints: number;
  byCategory: { category: ComplaintCategory; count: number }[];
  byStatus: { status: ComplaintStatus; count: number }[];
  resolutionRate: number;
  departmentWorkload: { department: string; count: number; avgDays: number }[];
  emergingIssues: { title: string; trend: 'up' | 'down' | 'stable'; count: number }[];
  civicPulse: string;
  weeklyTrend: { week: string; complaints: number; resolved: number }[];
}
