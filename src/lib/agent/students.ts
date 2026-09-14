export type AgentStudentInfoCard = {
  airtableStudentId: string;
  profileId: string | null;
  name: string;
  email: string;
  status: string;
  programMatchStatus: "matched" | "waiting" | "not_generated";
  applicationStatus?: string;
  currentStage?: string;
  intake?: string;
  universityName?: string;
  programName?: string;
};

export type AgentStudent = {
  id: string;
  name: string;
  stage: string;
  detail?: {
    email?: string | null;
    applicationStatus?: string | null;
    intake?: string | null;
    universityName?: string | null;
    programName?: string | null;
  };
};

export type AgentStudentsBundle = {
  students: {
    meta: { total: number };
    students: AgentStudent[];
  };
  info?: {
    cards?: AgentStudentInfoCard[];
  };
};

export type AgentStudentListItem = {
  key: string;
  airtableStudentId: string | null;
  name: string;
  email: string;
  status: string;
  matchStatus: string;
  profileId: string | null;
  applicationStatus: string;
  intake: string;
  universityName: string;
  programName: string;
};

export function agentStudentsFromBundle(data: AgentStudentsBundle): AgentStudentListItem[] {
  const cards = data.info?.cards;
  if (cards?.length) {
    return cards.map((card) => ({
      key: card.airtableStudentId || card.profileId || card.email,
      airtableStudentId: card.airtableStudentId || null,
      name: card.name,
      email: card.email,
      status: card.currentStage || card.status,
      matchStatus: card.programMatchStatus.replace(/_/g, " "),
      profileId: card.profileId,
      applicationStatus: card.applicationStatus ?? "",
      intake: card.intake ?? "",
      universityName: card.universityName ?? "",
      programName: card.programName ?? "",
    }));
  }

  return data.students.students.map((student) => ({
    key: student.id,
    airtableStudentId: student.id,
    name: student.name,
    email: student.detail?.email ?? "",
    status: student.stage,
    matchStatus: "—",
    profileId: null,
    applicationStatus: student.detail?.applicationStatus ?? "",
    intake: student.detail?.intake ?? "",
    universityName: student.detail?.universityName ?? "",
    programName: student.detail?.programName ?? "",
  }));
}
