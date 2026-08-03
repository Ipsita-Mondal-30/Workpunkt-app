import type { StatCard } from "@/components/shared/stats-row";

export type SchoolPlanSummary = {
  active: boolean;
  studentCap: number;
  packageType: string | null;
  validUntil: string | null;
  placementsConfirmed: number;
  schoolPartnerTrainingAccess: boolean;
};

export type EntitlementsMeSummary = {
  schoolPlan: SchoolPlanSummary;
  schoolPurchaseHistory: Array<{
    productType: "school" | "school_topup" | "school_counsellor_access";
    label: string;
    purchasedAt: string;
    paymentId: string;
    amountCents: number;
    currency: string;
  }>;
};

export type SchoolCounsellorDashboardContext = {
  isSchoolCounsellor: boolean;
  counsellorAccessPaid: boolean;
  schoolPlan: SchoolPlanSummary;
  careerPathingQuota: CareerPathingQuotaSnapshot | null;
};

export type AgentDashboardData = {
  schoolCounsellorContext: SchoolCounsellorDashboardContext;
};

export type CareerPathingQuotaSnapshot = {
  studentCap: number;
  quotaUsed: number;
  overflowCount: number;
  atLimit: boolean;
  remaining: number;
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
};

export type StudentRoadmapJson = {
  grades: Array<{
    grade: 10 | 11 | 12;
    sections: Array<{
      title: string;
      items: Array<{ text: string; timeline?: string; done?: boolean }>;
    }>;
  }>;
  counsellorNotes?: string;
};

export type CounsellorStudentRoadmapView = {
  id: string;
  school_student_airtable_id: string;
  students_airtable_id: string | null;
  student_name: string | null;
  status: "pending_review" | "approved" | "rejected";
  current_grade: number | null;
  roadmap_json: StudentRoadmapJson;
  last_modified_at: string | null;
  approved_at: string | null;
};

export type CareerPathingResource = {
  id: string;
  title: string;
  description?: string;
  tag?: string;
  body?: string;
  url?: string;
};

export type CareerPathingBundle = {
  ok: true;
  students: CareerPathingPortalStudent[];
  roadmapsByStudentId: Record<string, CounsellorStudentRoadmapView>;
  roadmaps: CounsellorStudentRoadmapView[];
  quota: CareerPathingQuotaSnapshot;
  schoolPlan: SchoolPlanSummary;
  planActive: boolean;
  resources: CareerPathingResource[];
};

export type CareerPathingBundleResult =
  | CareerPathingBundle
  | { ok: false; error: string };

export type CheckoutProductType =
  | "school"
  | "school_topup"
  | "school_counsellor_access";

export const CAREER_PATHING_PLACEMENT_TARGET = 10;

export function roadmapStatusLabel(status: string): string {
  if (status === "pending_review") return "Pending review";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Needs changes";
  return status;
}

export function buildQuotaStats(quota: CareerPathingQuotaSnapshot): StatCard[] {
  return [
    {
      id: "used",
      value: String(quota.quotaUsed),
      label: "Students used",
      sub: `Cap ${quota.studentCap}`,
      color: "pink",
    },
    {
      id: "remaining",
      value: String(quota.remaining),
      label: "Remaining",
      sub: quota.atLimit ? "At limit" : "Available slots",
      color: quota.atLimit ? "purple" : "green",
    },
  ];
}
