export type SchoolPlanSummary = {
  active: boolean;
  studentCap: number;
  packageType: string | null;
  validUntil: string | null;
  placementsConfirmed: number;
  schoolPartnerTrainingAccess: boolean;
};

export type CareerPathingQuotaSnapshot = {
  studentCap: number;
  quotaUsed: number;
  remaining: number;
  prospectCount: number;
  overflowCount: number;
};

export type SchoolCounsellorContext = {
  role: string | null;
  isSchoolCounsellor: boolean;
  schoolPlan: SchoolPlanSummary;
  airtableRecordId: string | null;
  counsellorAccessPaid: boolean;
  careerPathingQuota: CareerPathingQuotaSnapshot | null;
};

export type AgentMeProfile = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  isAgentActive: boolean;
  needsPasswordSetup: boolean;
  airtableRecordId: string | null;
};

export type AgentMeResponse = {
  profile: AgentMeProfile;
  schoolCounsellorContext: SchoolCounsellorContext | null;
};

export type SchoolPurchaseHistoryItem = {
  id: string;
  productType: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
};

export type EntitlementsMeResponse = {
  plan: "free" | "ai_plus";
  schoolPlan: SchoolPlanSummary;
  schoolPurchaseHistory: SchoolPurchaseHistoryItem[];
};

export type PortalRoadmapStage = {
  grade: 10 | 11 | 12;
  label: string;
  detail: string;
  status: "done" | "current" | "upcoming";
};

export type CareerPathingPortalStudent = {
  id: string;
  schoolStudentId: string | null;
  name: string;
  gradeLabel: string;
  gradeNumber: 10 | 11 | 12 | null;
  stream: string;
  eligibility: "eligible" | "needs_pathing" | "overflow";
  eligibilityLabel: string;
  profileEditable: boolean;
  roadmap: PortalRoadmapStage[];
};

export type CounsellorStudentRoadmapView = {
  id: string;
  students_airtable_id: string;
  student_name: string;
  status: string;
  current_grade: number | null;
  roadmap_json: Record<string, unknown> | null;
  approved_at: string | null;
  last_modified_at: string | null;
};

export type CareerPathingBundle = {
  ok: true;
  students: CareerPathingPortalStudent[];
  roadmapsByStudentId: Record<string, CounsellorStudentRoadmapView>;
  roadmaps: CounsellorStudentRoadmapView[];
  quota: CareerPathingQuotaSnapshot;
  schoolPlan: SchoolPlanSummary;
  planActive: boolean;
  resources?: AgentResource[];
};

export type AgentStudentRow = {
  id: string;
  name?: string;
  email?: string;
  status?: string;
  grade?: string;
  program?: string;
  needsPasswordSetup?: boolean;
};

export type AgentResource = {
  id: string;
  title: string;
  description?: string;
  tag?: string;
  url?: string;
  mediaType?: string;
  category?: string;
};

export type TrainingModule = {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  status?: string;
  completed?: boolean;
  sortOrder?: number;
};

export type WebinarSession = {
  id: string;
  title: string;
  startsAt?: string;
  joinUrl?: string;
  description?: string;
};

export type AgentNotification = {
  id: string;
  title: string;
  body?: string;
  message?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
  created_at?: string;
  type?: string;
};

export type SupportMessage = {
  id: string;
  body: string;
  senderRole: string;
  createdAt: string;
};

export type SupportThread = {
  id: string;
  subject: string;
  status: string;
  messages: SupportMessage[];
};

export type CheckoutProductType =
  | "school_counsellor_access"
  | "school"
  | "school_topup"
  | "report";
