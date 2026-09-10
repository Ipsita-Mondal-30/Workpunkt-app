/**
 * Turn model replies into readable chat text — mirrors website
 * `formatKlaraReplyForDisplay` (no code fences / markdown chrome).
 */
export function formatKlaraReplyForDisplay(raw: string): string {
  let text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return "";

  text = text.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_, inner: string) => inner.trim());
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, "$1");
  text = text.replace(/(?<!\w)_([^_]+)_(?!\w)/g, "$1");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
  text = text.replace(/^\s*[-*+]\s+/gm, "• ");
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}
