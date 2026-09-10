export type CpStudentFormValues = {
  name: string;
  email: string;
  phone: string;
  grade: "10" | "11" | "12";
  stream: string;
  schoolName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  germanyInterest: "yes" | "no" | "unsure";
  notes: string;
};

export type EnrolledStudentFormValues = {
  name: string;
  email: string;
  phoneNumber: string;
  source: string;
  universityType: "public" | "private" | "both";
  studyLevel: string;
  intake: string;
  programOfStudy: string;
  paymentStatus: string;
};

export const CP_GRADE_OPTIONS = [
  { label: "Grade 10", value: "10" as const },
  { label: "Grade 11", value: "11" as const },
  { label: "Grade 12", value: "12" as const },
];

export const UNIVERSITY_TYPE_OPTIONS = [
  { label: "Public universities", value: "public" as const },
  { label: "Private universities", value: "private" as const },
  { label: "Both", value: "both" as const },
];

export function emptyCpStudentForm(): CpStudentFormValues {
  return {
    name: "",
    email: "",
    phone: "",
    grade: "11",
    stream: "",
    schoolName: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    germanyInterest: "unsure",
    notes: "",
  };
}

export function emptyEnrolledStudentForm(): EnrolledStudentFormValues {
  return {
    name: "",
    email: "",
    phoneNumber: "",
    source: "School counsellor",
    universityType: "both",
    studyLevel: "Bachelor",
    intake: "Winter",
    programOfStudy: "",
    paymentStatus: "Paid",
  };
}

export function validateCpStudentForm(values: CpStudentFormValues): string | null {
  if (!values.name.trim()) return "Student name is required.";
  if (!values.email.trim()) return "Student email is required.";
  if (!values.phone.trim()) return "Student phone is required.";
  if (!values.grade) return "Grade is required.";
  return null;
}

export function validateEnrolledStudentForm(
  values: EnrolledStudentFormValues,
): string | null {
  if (!values.name.trim()) return "Student name is required.";
  if (!values.email.trim()) return "Student email is required.";
  if (!values.phoneNumber.trim()) return "Phone number is required.";
  return null;
}
