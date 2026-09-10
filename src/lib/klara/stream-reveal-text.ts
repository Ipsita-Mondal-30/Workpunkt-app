/** Progressive text reveal for ChatGPT-style assistant bubbles. */

export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Reveals `fullText` into `onUpdate` in small chunks.
 * Returns early if `signal` is aborted.
 */
export async function streamRevealText(
  fullText: string,
  onUpdate: (partial: string, done: boolean) => void,
  options?: { signal?: AbortSignal; charsPerTick?: number; delayMs?: number },
): Promise<void> {
  const charsPerTick = options?.charsPerTick ?? 3;
  const delayMs = options?.delayMs ?? 14;
  const signal = options?.signal;

  if (!fullText) {
    onUpdate("", true);
    return;
  }

  let index = 0;
  while (index < fullText.length) {
    if (signal?.aborted) {
      onUpdate(fullText, true);
      return;
    }
    index = Math.min(fullText.length, index + charsPerTick);
    onUpdate(fullText.slice(0, index), index >= fullText.length);
    if (index < fullText.length) {
      await sleep(delayMs);
    }
  }
}
