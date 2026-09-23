import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";

import { GradientButton } from "@/components/shared/gradient-button";
import { KlaraAvatar } from "@/components/shared/klara-avatar";
import { KlaraMatchResults } from "@/components/klara/klara-match-results";
import { KlaraPlanBadge } from "@/components/klara/klara-plan-badge";
import { authFetch } from "@/lib/api/auth-fetch";
import { useAuth } from "@/lib/auth/auth-context";
import type { AppRole } from "@/lib/auth/resolve-role";
import {
  createAiChatMessage,
  getOrCreateConversationId,
  loadAiChatSession,
  saveAiChatSession,
  type AiChatMessage,
} from "@/lib/klara/ai-chat-storage";
import {
  AI_CHAT_WELCOME_MESSAGE,
  FAQ_WELCOME_MESSAGE,
  SUPPORT_FAQ_PRESETS,
} from "@/lib/klara/faq-presets";
import { formatKlaraReplyForDisplay } from "@/lib/klara/format-klara-reply";
import { QUALIFIER_QUESTIONS } from "@/lib/klara/qualifier-questions";
import { streamRevealText } from "@/lib/klara/stream-reveal-text";
import { fetchApiJson, postApiJson } from "@/lib/query/use-api";
import { useThemeColors } from "@/lib/theme/theme-context";
import { cn, createUuid } from "@/lib/utils";

export type KlaraChatMode = "faq" | "ai" | "counsellor";

type FaqMessage = {
  id: string;
  role: "bot" | "user";
  body: string;
};

type SupportMessage = {
  id: string;
  senderRole: string;
  senderName: string;
  body: string;
  createdAt: string;
};

type SupportInboxData = {
  threadId: string | null;
  thread: {
    id: string;
    subject: string;
    status: string;
    lastMessageAt: string;
  } | null;
  messages: SupportMessage[];
};

type MatchedProgram = {
  universityName: string;
  programName: string;
  reason: string;
};

type QualifierStatus = {
  completed: boolean;
  remainingFreeMatches: number;
  canRequestMatches: boolean;
  matchedPrograms: MatchedProgram[];
  eligibilityLabel?: string | null;
};

type KlaraChatSheetProps = {
  visible: boolean;
  onClose: () => void;
  role: AppRole;
  /** Admin portal: Ask Klara only (no matching CTAs). */
  aiOnly?: boolean;
};

const MODE_LABELS: Record<KlaraChatMode, string> = {
  faq: "FAQ",
  ai: "Ask Klara",
  counsellor: "Counsellor",
};

export function KlaraChatSheet({
  visible,
  onClose,
  role,
  aiOnly = false,
}: KlaraChatSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const colors = useThemeColors();

  const showMatching = role === "student" && !aiOnly;
  const inboxKind = role === "agent" || role === "counsellor" ? "agent_chat" : "student_help";
  const modes = useMemo<KlaraChatMode[]>(
    () => (aiOnly ? ["ai"] : ["faq", "ai", "counsellor"]),
    [aiOnly],
  );

  const [mode, setMode] = useState<KlaraChatMode>(aiOnly ? "ai" : "faq");
  const [faqMessages, setFaqMessages] = useState<FaqMessage[]>([
    { id: "faq-welcome", role: "bot", body: FAQ_WELCOME_MESSAGE },
  ]);
  const [revealedFaqIds, setRevealedFaqIds] = useState<string[]>([]);
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>([
    createAiChatMessage("assistant", AI_CHAT_WELCOME_MESSAGE),
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const [inbox, setInbox] = useState<SupportInboxData | null>(null);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxSending, setInboxSending] = useState(false);

  const [qualifier, setQualifier] = useState<QualifierStatus | null>(null);
  const [qualifierLoading, setQualifierLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showQualifier, setShowQualifier] = useState(false);
  const [matchBusy, setMatchBusy] = useState(false);
  const [latestMatches, setLatestMatches] = useState<MatchedProgram[]>([]);
  const [matchEmailSent, setMatchEmailSent] = useState<boolean | null>(null);
  const [plan, setPlan] = useState<"free" | "ai_plus">("free");

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<FlatList>(null);
  const userId = user?.id ?? null;

  const openFullKlara = useCallback(() => {
    onClose();
    if (role === "student") router.push("/(student)/klara" as never);
    else if (role === "agent") router.push("/(agent)/klara" as never);
    else if (role === "counsellor") router.push("/(counsellor)/klara" as never);
  }, [onClose, role, router]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchApiJson<{ plan?: "free" | "ai_plus" }>("/api/entitlements/me");
        if (!cancelled && (data.plan === "free" || data.plan === "ai_plus")) {
          setPlan(data.plan);
        }
      } catch {
        /* optional for FAB */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    void (async () => {
      const stored = await loadAiChatSession(userId);
      if (cancelled) return;
      if (stored.length > 0) {
        setAiMessages(stored);
      } else {
        setAiMessages([createAiChatMessage("assistant", AI_CHAT_WELCOME_MESSAGE)]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, userId]);

  useEffect(() => {
    if (!visible || !userId) return;
    void saveAiChatSession(aiMessages, userId);
  }, [aiMessages, userId, visible]);

  const loadInbox = useCallback(async () => {
    setInboxLoading(true);
    try {
      const data = await fetchApiJson<SupportInboxData>("/api/support/inbox");
      setInbox(data);
    } catch (error) {
      setStatusNote(error instanceof Error ? error.message : "Could not load counsellor chat.");
    } finally {
      setInboxLoading(false);
    }
  }, []);

  const loadQualifier = useCallback(async () => {
    if (!showMatching) return;
    setQualifierLoading(true);
    try {
      const data = await fetchApiJson<QualifierStatus>("/api/klara/qualifier/status");
      setQualifier(data);
      if ((data.matchedPrograms?.length ?? 0) > 0) {
        setLatestMatches(data.matchedPrograms);
      }
    } catch {
      // matching is optional in the FAB; full screen has richer errors
    } finally {
      setQualifierLoading(false);
    }
  }, [showMatching]);

  useEffect(() => {
    if (!visible) return;
    if (mode === "counsellor") void loadInbox();
    if (mode === "ai" && showMatching) void loadQualifier();
  }, [visible, mode, loadInbox, loadQualifier, showMatching]);

  useEffect(() => {
    if (!visible) {
      abortRef.current?.abort();
      setDraft("");
      setStatusNote(null);
    }
  }, [visible]);

  function pickFaq(presetId: string) {
    const preset = SUPPORT_FAQ_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setFaqMessages((current) => [
      ...current,
      { id: createUuid(), role: "user", body: preset.question },
      { id: createUuid(), role: "bot", body: preset.answer },
    ]);
    setRevealedFaqIds((ids) => (ids.includes(presetId) ? ids : [...ids, presetId]));
  }

  async function sendAiMessage(raw?: string) {
    const text = (raw ?? draft).trim();
    if (!text || sending) return;

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    const userMessage = createAiChatMessage("user", text);
    const assistantId = createUuid();
    const history = [...aiMessages, userMessage]
      .filter((m) => m.content.trim())
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    setAiMessages((current) => [
      ...current,
      userMessage,
      createAiChatMessage("assistant", "", { id: assistantId, isStreaming: true }),
    ]);
    setDraft("");
    setSending(true);
    setStatusNote(null);

    try {
      const conversationId = await getOrCreateConversationId(userId);
      const response = await authFetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          history: history.slice(0, -1),
          conversationId,
        }),
      });
      const json = (await response.json()) as {
        data?: {
          reply?: string;
          requiresLogin?: boolean;
          requiresQualifier?: boolean;
          requiresDocs?: boolean;
          requiresDocumentUpload?: boolean;
          canRequestMatches?: boolean;
        };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? `Request failed (${response.status})`);
      }

      const reply = formatKlaraReplyForDisplay(
        json.data?.reply?.trim() ||
          json.error ||
          "Sorry, I couldn't respond right now. Please try again.",
      );

      if (json.data?.requiresQualifier) {
        setShowQualifier(true);
      }
      if (json.data?.canRequestMatches) {
        setStatusNote("You're ready — tap Ask Klara for Program Matches below.");
      }
      if (json.data?.requiresDocs || json.data?.requiresDocumentUpload) {
        setStatusNote("Upload your documents from the full Klara screen to unlock matches.");
      }

      await streamRevealText(
        reply,
        (partial, done) => {
          setAiMessages((current) =>
            current.map((item) =>
              item.id === assistantId
                ? { ...item, content: partial, isStreaming: !done }
                : item,
            ),
          );
        },
        { signal: abort.signal },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setAiMessages((current) =>
        current.map((item) =>
          item.id === assistantId
            ? { ...item, content: message, isStreaming: false }
            : item,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  async function sendCounsellorMessage() {
    const trimmed = draft.trim();
    if (!trimmed || inboxSending) return;
    setInboxSending(true);
    setStatusNote(null);
    try {
      await postApiJson("/api/support/inbox", {
        kind: inboxKind,
        message: trimmed,
      });
      setDraft("");
      setStatusNote("Message sent. A counsellor will reply soon.");
      await loadInbox();
    } catch (error) {
      setStatusNote(error instanceof Error ? error.message : "Could not send message.");
    } finally {
      setInboxSending(false);
    }
  }

  async function submitQualifier() {
    const questions = QUALIFIER_QUESTIONS;
    if (questions.some((q) => answers[q.id] == null)) {
      setStatusNote("Please answer all qualifier questions.");
      return;
    }

    setMatchBusy(true);
    try {
      await postApiJson("/api/klara/qualifier/complete", {
        answers: questions.map((q) => ({
          questionId: q.id,
          optionIndex: answers[q.id],
          optionText: q.options[answers[q.id]! - 1],
        })),
      });
      setShowQualifier(false);
      setStatusNote(
        "Qualifier saved. Complete documents in full Klara if needed, then request matches.",
      );
      await loadQualifier();
    } catch (error) {
      setStatusNote(error instanceof Error ? error.message : "Could not save qualifier.");
    } finally {
      setMatchBusy(false);
    }
  }

  async function requestMatches() {
    setMatchBusy(true);
    setStatusNote(null);
    const assistantId = createUuid();
    setAiMessages((current) => [
      ...current,
      createAiChatMessage("user", "Ask Klara for Program Matches"),
      createAiChatMessage("assistant", "Finding your university matches…", {
        id: assistantId,
        isStreaming: true,
      }),
    ]);

    try {
      const data = await postApiJson<{
        programs?: MatchedProgram[];
        emailSent?: boolean;
      }>("/api/klara/matches/free", {});
      const programs = data.programs ?? [];
      setLatestMatches(programs);
      setMatchEmailSent(data.emailSent ?? null);
      const lines =
        programs.length === 0
          ? "I couldn't find close-fit programs yet. A counsellor can help refine your profile."
          : programs.length === 1
            ? "Based on your profile, here is your 1 close-fit university programme."
            : `Based on your profile, here are your ${programs.length} close-fit university programmes.`;

      await streamRevealText(lines, (partial, done) => {
        setAiMessages((current) =>
          current.map((item) =>
            item.id === assistantId
              ? { ...item, content: partial, isStreaming: !done }
              : item,
          ),
        );
      });
      await loadQualifier();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not fetch matches.";
      setAiMessages((current) =>
        current.map((item) =>
          item.id === assistantId
            ? { ...item, content: message, isStreaming: false }
            : item,
        ),
      );
    } finally {
      setMatchBusy(false);
    }
  }

  const remainingFaqs = SUPPORT_FAQ_PRESETS.filter(
    (preset) => !revealedFaqIds.includes(preset.id),
  );

  function renderBubble(content: string, isUser: boolean, key: string) {
    return (
      <View
        key={key}
        className={cn(
          "mb-3 max-w-[92%] rounded-2xl px-3.5 py-2.5",
          isUser ? "self-end bg-brand-mid" : "self-start border border-border bg-surface",
        )}
      >
        <Text className={cn("text-sm leading-5", isUser ? "text-white" : "text-text")}>
          {content}
        </Text>
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-bg"
        style={{ paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 8) }}
      >
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <View className="flex-row items-center gap-3">
            <KlaraAvatar size={36} alt="" />
            <View className="flex-1 pr-2">
              <Text className="text-base font-bold text-text">
                {aiOnly ? "Ask Klara" : "Workpunkt Support"}
              </Text>
              <Text className="text-xs text-muted">
                {aiOnly
                  ? "Chat about studying in Germany"
                  : "FAQs, Ask Klara & counsellor chat"}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityLabel="Close chat"
            className="h-9 w-9 items-center justify-center rounded-full bg-surface-end"
          >
            <Text className="text-lg text-text">✕</Text>
          </Pressable>
        </View>

        {!aiOnly ? (
          <View className="flex-row gap-2 border-b border-border px-3 py-2">
            {modes.map((item) => (
              <Pressable
                key={item}
                onPress={() => {
                  setMode(item);
                  setStatusNote(null);
                  setDraft("");
                }}
                className={cn(
                  "flex-1 rounded-xl px-2 py-2.5",
                  mode === item ? "bg-brand-mid/15" : "bg-transparent",
                )}
              >
                <Text
                  className={cn(
                    "text-center text-xs font-bold",
                    mode === item ? "text-brand-mid" : "text-muted",
                  )}
                >
                  {MODE_LABELS[item]}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {statusNote ? (
          <View className="mx-3 mt-2 rounded-xl border border-border bg-surface px-3 py-2">
            <Text className="text-xs text-muted">{statusNote}</Text>
          </View>
        ) : null}

        <View className="flex-1 px-3 pt-2">
          {mode === "faq" ? (
            <ScrollView contentContainerClassName="pb-4">
              {faqMessages.map((message) =>
                renderBubble(message.body, message.role === "user", message.id),
              )}
              {remainingFaqs.length > 0 ? (
                <View className="mt-2 gap-2">
                  <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    Quick questions
                  </Text>
                  {remainingFaqs.map((preset) => (
                    <Pressable
                      key={preset.id}
                      onPress={() => pickFaq(preset.id)}
                      className="rounded-2xl border border-border bg-surface px-3 py-3"
                    >
                      <Text className="text-sm font-medium text-text">{preset.question}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <View className="mt-4 flex-row gap-2">
                <Pressable
                  onPress={() => setMode("ai")}
                  className="flex-1 rounded-xl bg-brand-mid px-3 py-3"
                >
                  <Text className="text-center text-xs font-bold text-white">Ask Klara</Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode("counsellor")}
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-3"
                >
                  <Text className="text-center text-xs font-bold text-text">
                    Talk to a counsellor
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          ) : null}

          {mode === "ai" ? (
            <View className="flex-1">
              <FlatList
                ref={listRef}
                data={aiMessages}
                keyExtractor={(item) => item.id}
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                contentContainerClassName="pb-3"
                ListFooterComponent={
                  latestMatches.length > 0 ? (
                    <KlaraMatchResults
                      programs={latestMatches}
                      emailSent={matchEmailSent}
                      onBookCounselling={() => setMode("counsellor")}
                    />
                  ) : null
                }
                renderItem={({ item }) => (
                  <View
                    className={
                      item.role === "user"
                        ? "mb-3 max-w-[92%] self-end"
                        : "mb-3 max-w-[92%] flex-row items-end gap-2 self-start"
                    }
                  >
                    {item.role !== "user" ? <KlaraAvatar size={28} alt="" /> : null}
                    <View
                      className={
                        item.role === "user"
                          ? "rounded-2xl bg-brand-mid px-3.5 py-2.5"
                          : "rounded-2xl border border-border bg-surface px-3.5 py-2.5"
                      }
                    >
                      <Text
                        className={
                          item.role === "user"
                            ? "text-sm leading-5 text-white"
                            : "text-sm leading-5 text-text"
                        }
                      >
                        {item.content || "…"}
                        {item.isStreaming ? " ▍" : ""}
                      </Text>
                    </View>
                  </View>
                )}
              />

              <View className="mb-2 px-0.5">
                <KlaraPlanBadge plan={plan} />
              </View>

              {showMatching ? (
                <View className="mb-2 gap-2">
                  {qualifierLoading ? (
                    <ActivityIndicator color={colors.brandMid} />
                  ) : (
                    <>
                      {!qualifier?.completed || showQualifier ? (
                        <Pressable
                          onPress={() => setShowQualifier((v) => !v)}
                          className="rounded-xl border border-border bg-surface px-3 py-2.5"
                        >
                          <Text className="text-center text-xs font-semibold text-brand-mid">
                            {showQualifier ? "Hide qualifier" : "Start qualifier"}
                          </Text>
                        </Pressable>
                      ) : null}
                      {qualifier?.canRequestMatches ? (
                        <Pressable
                          disabled={matchBusy}
                          onPress={() => void requestMatches()}
                          className="rounded-xl bg-brand-mid px-3 py-2.5"
                        >
                          <Text className="text-center text-xs font-bold text-white">
                            {matchBusy ? "Matching…" : "Ask Klara for Program Matches"}
                          </Text>
                        </Pressable>
                      ) : null}
                      <Pressable
                        onPress={openFullKlara}
                        className="rounded-xl border border-border px-3 py-2"
                      >
                        <Text className="text-center text-[11px] font-medium text-muted">
                          Open full Klara · docs & detailed matching
                          {pathname?.includes("klara") ? "" : ""}
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              ) : null}

              {showQualifier && showMatching ? (
                <ScrollView className="mb-2 max-h-56 rounded-2xl border border-border bg-surface px-3 py-2">
                  {QUALIFIER_QUESTIONS.map((question) => (
                    <View key={question.id} className="mb-3">
                      <Text className="mb-1 text-xs font-semibold text-text">
                        {question.id}. {question.prompt}
                      </Text>
                      {question.options.map((option, optionIndex) => {
                        const selected = answers[question.id] === optionIndex + 1;
                        return (
                          <Pressable
                            key={`${question.id}-${optionIndex}`}
                            onPress={() =>
                              setAnswers((current) => ({
                                ...current,
                                [question.id]: optionIndex + 1,
                              }))
                            }
                            className={cn(
                              "mb-1 rounded-lg border px-2 py-2",
                              selected
                                ? "border-brand-mid bg-brand-mid/10"
                                : "border-border",
                            )}
                          >
                            <Text className="text-[11px] text-text">{option}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                  <GradientButton
                    text={matchBusy ? "Saving…" : "Submit qualifier"}
                    loading={matchBusy}
                    onPress={() => void submitQualifier()}
                  />
                </ScrollView>
              ) : null}
            </View>
          ) : null}

          {mode === "counsellor" ? (
            <ScrollView contentContainerClassName="pb-4">
                  {inboxLoading ? (
                <View className="mt-6 items-center">
                  <ActivityIndicator color={colors.brandMid} />
                </View>
              ) : (inbox?.messages?.length ?? 0) === 0 ? (
                <View className="rounded-2xl border border-border bg-surface px-4 py-6">
                  <Text className="text-sm text-muted">
                    No messages yet. Send a note and a Workpunkt counsellor will reply.
                  </Text>
                </View>
              ) : (
                inbox?.messages.map((item) => (
                  <View
                    key={item.id}
                    className="mb-2 rounded-2xl border border-border bg-surface px-3 py-3"
                  >
                    <Text className="text-[11px] font-semibold text-brand-mid">
                      {item.senderName} · {item.senderRole}
                    </Text>
                    <Text className="mt-1 text-sm text-text">{item.body}</Text>
                    <Text className="mt-1 text-[10px] text-muted">{item.createdAt}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          ) : null}
        </View>

        {mode !== "faq" ? (
          <View className="flex-row items-end gap-2 border-t border-border px-3 py-2">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={
                mode === "ai" ? "Ask Klara anything…" : "Message a counsellor…"
              }
              placeholderTextColor={colors.placeholder}
              multiline
              className="max-h-28 min-h-[44px] flex-1 rounded-2xl border border-border px-3 py-2.5 text-sm text-text"
              style={{
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text,
              }}
            />
            <Pressable
              disabled={
                mode === "ai"
                  ? sending || !draft.trim()
                  : inboxSending || !draft.trim()
              }
              onPress={() =>
                void (mode === "ai" ? sendAiMessage() : sendCounsellorMessage())
              }
              className="h-11 items-center justify-center rounded-2xl bg-brand-mid px-4"
            >
              <Text className="text-sm font-bold text-white">
                {mode === "ai"
                  ? sending
                    ? "…"
                    : "Send"
                  : inboxSending
                    ? "…"
                    : "Send"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}
