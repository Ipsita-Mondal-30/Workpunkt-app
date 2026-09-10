import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { GradientButton } from "@/components/shared/gradient-button";
import { KlaraAvatar } from "@/components/shared/klara-avatar";
import { authFetch } from "@/lib/api/auth-fetch";
import { QUALIFIER_QUESTIONS } from "@/lib/klara/qualifier-questions";
import { queryKeys } from "@/lib/query/keys";
import { fetchApiJson, postApiJson } from "@/lib/query/use-api";
import { useTheme } from "@/lib/theme/theme-context";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type MatchedProgram = {
  programRecordId?: string;
  universityName: string;
  programName: string;
  reason: string;
};

type QualifierStatus = {
  completed: boolean;
  remainingFreeMatches: number;
  canRequestMatches: boolean;
  matchedPrograms: MatchedProgram[];
  questions?: typeof QUALIFIER_QUESTIONS;
  dominantStrength?: string | null;
  eligibilityLabel?: string | null;
};

type StudentOption = {
  email: string;
  profileId?: string | null;
  name: string;
};

type KlaraMatchingScreenProps = {
  subtitle?: string;
  /** When true, require a student target before chat/matching (agent/counsellor). */
  requireStudentTarget?: boolean;
  studentEmail?: string | null;
  studentProfileId?: string | null;
  studentName?: string | null;
  studentOptions?: StudentOption[];
  onClearStudent?: () => void;
  onPickStudent?: (student: StudentOption) => void;
};

function buildStatusPath(email?: string | null, profileId?: string | null) {
  const params = new URLSearchParams();
  if (email) params.set("studentEmail", email);
  if (profileId) params.set("studentProfileId", profileId);
  const qs = params.toString();
  return `/api/klara/qualifier/status${qs ? `?${qs}` : ""}`;
}

export function KlaraMatchingScreen({
  subtitle,
  requireStudentTarget = false,
  studentEmail,
  studentProfileId,
  studentName,
  studentOptions = [],
  onClearStudent,
  onPickStudent,
}: KlaraMatchingScreenProps) {
  const { isDark } = useTheme();
  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";
  const queryClient = useQueryClient();
  const hasTarget = Boolean(studentEmail || studentProfileId);
  const blocked = requireStudentTarget && !hasTarget;

  const [tab, setTab] = useState<"chat" | "match">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I'm Klara — Workpunkt's AI counsellor. Ask me about German universities, admissions, or your pathway.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<QualifierStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submittingQualifier, setSubmittingQualifier] = useState(false);
  const [matching, setMatching] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const scopeKey = useMemo(
    () => studentProfileId || studentEmail || "self",
    [studentEmail, studentProfileId],
  );

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: studentName
          ? `Hi, I'm Klara. I'm helping with ${studentName}'s pathway. Ask me anything.`
          : "Hi, I'm Klara — Workpunkt's AI counsellor. Ask me about German universities, admissions, or your pathway.",
      },
    ]);
  }, [scopeKey, studentName]);

  async function loadStatus() {
    if (blocked) return;
    setStatusLoading(true);
    setStatusError(null);
    try {
      const data = await fetchApiJson<QualifierStatus>(
        buildStatusPath(studentEmail, studentProfileId),
      );
      setStatus(data);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.klaraQualifier(studentEmail ?? undefined),
      });
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Failed to load status");
    } finally {
      setStatusLoading(false);
    }
  }

  useEffect(() => {
    if (blocked) return;
    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey, blocked]);

  async function sendChat() {
    const text = input.trim();
    if (!text || sending || blocked) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    const history = [...messages, userMessage]
      .filter((m) => m.id !== "welcome")
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await authFetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          history: history.slice(0, -1),
          studentEmail: studentEmail || undefined,
          studentProfileId: studentProfileId || undefined,
        }),
      });
      const json = (await response.json()) as {
        data?: { reply?: string };
        error?: string;
      };
      const reply =
        json.data?.reply ??
        json.error ??
        "Sorry, I couldn't respond right now. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function submitQualifier() {
    const questions = status?.questions ?? QUALIFIER_QUESTIONS;
    if (questions.some((q) => !answers[q.id])) return;

    setSubmittingQualifier(true);
    try {
      await postApiJson("/api/klara/qualifier/complete", {
        answers: questions.map((q) => ({
          questionId: q.id,
          optionIndex: answers[q.id],
          optionText: q.options[answers[q.id] - 1],
        })),
        studentEmail: studentEmail || undefined,
        studentProfileId: studentProfileId || undefined,
      });
      await loadStatus();
      await queryClient.invalidateQueries({
        queryKey: queryKeys.klaraMatches(studentEmail ?? undefined),
      });
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Failed to save qualifier");
    } finally {
      setSubmittingQualifier(false);
    }
  }

  async function runFreeMatches() {
    setMatching(true);
    setStatusError(null);
    try {
      const result = await postApiJson<{
        programs?: MatchedProgram[];
        remainingFreeMatches?: number;
      }>("/api/klara/matches/free", {
        studentEmail: studentEmail || undefined,
        studentProfileId: studentProfileId || undefined,
      });
      const programs = result.programs ?? [];
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              matchedPrograms: programs,
              remainingFreeMatches:
                result.remainingFreeMatches ?? prev.remainingFreeMatches,
              canRequestMatches: false,
            }
          : {
              completed: true,
              remainingFreeMatches: result.remainingFreeMatches ?? 0,
              canRequestMatches: false,
              matchedPrograms: programs,
            },
      );
      await loadStatus();
      await queryClient.invalidateQueries({
        queryKey: queryKeys.klaraMatches(studentEmail ?? undefined),
      });
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Matching failed");
    } finally {
      setMatching(false);
    }
  }

  if (blocked) {
    return (
      <View className="flex-1 bg-bg px-4 py-6">
        <Text className="text-2xl font-bold text-text">Ask Klara</Text>
        <Text className="mt-2 text-sm text-muted">
          {subtitle ?? "Pick a student first — each student gets an isolated Klara session."}
        </Text>

        <Pressable
          className="mt-6 rounded-xl bg-brand-mid px-4 py-3"
          onPress={() => setPickerOpen((v) => !v)}
        >
          <Text className="text-center text-sm font-semibold text-white">
            {pickerOpen ? "Hide students" : "Pick a student"}
          </Text>
        </Pressable>

        {pickerOpen ? (
          <ScrollView className="mt-4" contentContainerClassName="gap-2 pb-10">
            {studentOptions.length === 0 ? (
              <Text className="text-sm text-muted">
                No students loaded. Open My Students, then return here.
              </Text>
            ) : (
              studentOptions.map((student) => (
                <Pressable
                  key={student.email || student.profileId || student.name}
                  className="rounded-2xl border border-border bg-surface px-4 py-3"
                  onPress={() => onPickStudent?.(student)}
                >
                  <Text className="text-sm font-semibold text-text">{student.name}</Text>
                  <Text className="mt-1 text-xs text-muted">{student.email}</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        ) : null}
      </View>
    );
  }

  const questions = status?.questions ?? QUALIFIER_QUESTIONS;
  const matched = status?.matchedPrograms ?? [];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      <View className="border-b border-border px-4 py-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 flex-row items-start gap-3">
            <KlaraAvatar size={40} alt="" />
            <View className="flex-1">
              <Text className="text-2xl font-bold text-text">Ask Klara</Text>
              <Text className="mt-1 text-sm text-muted">
                {subtitle ||
                  (studentName
                    ? `Helping ${studentName}${studentEmail ? ` · ${studentEmail}` : ""}`
                    : "AI chat + program matching")}
              </Text>
            </View>
          </View>
          {requireStudentTarget && hasTarget ? (
            <Pressable onPress={onClearStudent} className="rounded-xl bg-surface-end px-3 py-2">
              <Text className="text-xs font-semibold text-text">Clear</Text>
            </Pressable>
          ) : null}
        </View>

        <View className="mt-3 flex-row gap-2">
          {(["chat", "match"] as const).map((key) => (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              className={`rounded-xl px-3 py-2 ${
                tab === key ? "bg-brand-mid" : "bg-surface-end"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  tab === key ? "text-white" : "text-text"
                }`}
              >
                {key === "chat" ? "AI Chat" : "Matching"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === "chat" ? (
        <>
          <FlatList
            className="flex-1 px-4"
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerClassName="py-4 gap-3"
            renderItem={({ item }) => (
              <View
                className={
                  item.role === "user"
                    ? "max-w-[88%] self-end"
                    : "max-w-[88%] flex-row items-end gap-2 self-start"
                }
              >
                {item.role !== "user" ? <KlaraAvatar size={28} alt="" /> : null}
                <View
                  className={`rounded-2xl px-3 py-2 ${
                    item.role === "user"
                      ? "bg-brand-mid"
                      : "border border-border bg-surface"
                  }`}
                >
                  <Text
                    className={`text-sm ${item.role === "user" ? "text-white" : "text-text"}`}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
          />
          <View className="flex-row items-end gap-2 border-t border-border px-4 py-3">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask Klara…"
              placeholderTextColor={placeholderColor}
              multiline
              className="max-h-28 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
            />
            <Pressable
              onPress={() => void sendChat()}
              disabled={sending}
              className="rounded-xl bg-brand-mid px-4 py-3"
            >
              <Text className="text-sm font-semibold text-white">
                {sending ? "…" : "Send"}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="px-4 py-4 pb-10 gap-4">
          {statusLoading ? <ActivityIndicator color="#f6339a" /> : null}
          {statusError ? (
            <Text className="text-sm text-error">{statusError}</Text>
          ) : null}

          {status ? (
            <View className="rounded-2xl border border-border bg-surface px-4 py-3">
              <Text className="text-sm font-semibold text-text">
                Qualifier: {status.completed ? "Complete" : "Not completed"}
              </Text>
              <Text className="mt-1 text-xs text-muted">
                Free matches left: {status.remainingFreeMatches}
                {status.eligibilityLabel ? ` · ${status.eligibilityLabel}` : ""}
              </Text>
              {status.dominantStrength ? (
                <Text className="mt-1 text-xs text-brand-mid">
                  Strength: {status.dominantStrength}
                </Text>
              ) : null}
            </View>
          ) : null}

          {!status?.completed ? (
            <View className="gap-4">
              <Text className="text-base font-semibold text-text">
                Complete the qualifier (10 questions)
              </Text>
              {questions.map((question) => (
                <View key={question.id} className="gap-2">
                  <Text className="text-sm font-semibold text-text">
                    {question.id}. {question.prompt}
                  </Text>
                  {question.options.map((option, index) => {
                    const optionIndex = index + 1;
                    const selected = answers[question.id] === optionIndex;
                    return (
                      <Pressable
                        key={option}
                        onPress={() =>
                          setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
                        }
                        className={`rounded-xl border px-3 py-2 ${
                          selected
                            ? "border-brand-mid bg-brand-mid/15"
                            : "border-border bg-surface"
                        }`}
                      >
                        <Text className="text-sm text-text">{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
              <GradientButton
                text={submittingQualifier ? "Saving…" : "Submit qualifier"}
                onPress={() => void submitQualifier()}
                disabled={
                  submittingQualifier ||
                  questions.some((q) => !answers[q.id])
                }
              />
            </View>
          ) : (
            <View className="gap-3">
              {status.canRequestMatches || matched.length === 0 ? (
                <GradientButton
                  text={matching ? "Matching…" : "Generate free matches"}
                  onPress={() => void runFreeMatches()}
                  disabled={matching}
                />
              ) : null}

              <Text className="text-base font-semibold text-text">Matched programs</Text>
              {matched.length === 0 ? (
                <Text className="text-sm text-muted">No matches yet.</Text>
              ) : (
                matched.map((program, index) => (
                  <View
                    key={`${program.programRecordId ?? program.programName}-${index}`}
                    className="rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-text">
                      {program.programName}
                    </Text>
                    <Text className="mt-1 text-xs text-brand-mid">
                      {program.universityName}
                    </Text>
                    <Text className="mt-2 text-xs text-muted">{program.reason}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
