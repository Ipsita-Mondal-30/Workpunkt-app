import AsyncStorage from "@react-native-async-storage/async-storage";

const DRAFT_KEY = "workpunkt-private-application-draft";

export type PrivateSignupDraft = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  source: string;
  track: "private-university";
};

export type PrivateAcademicDraft = {
  qualification: string;
  institution: string;
  year: string;
  grade: string;
  boards: string;
  boardsOther?: string;
  studyGoal: string;
  studyLevel: string;
  languageCert: string;
  intake: string;
};

export type PrivateApplicationDraft = {
  signup: PrivateSignupDraft;
  academic?: PrivateAcademicDraft;
  reference?: string;
  documents?: Array<{ id: string; fileName: string }>;
};

export async function loadPrivateDraft(): Promise<PrivateApplicationDraft | null> {
  const raw = await AsyncStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PrivateApplicationDraft;
  } catch {
    return null;
  }
}

export async function savePrivateDraft(draft: PrivateApplicationDraft) {
  await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export async function clearPrivateDraft() {
  await AsyncStorage.removeItem(DRAFT_KEY);
}
