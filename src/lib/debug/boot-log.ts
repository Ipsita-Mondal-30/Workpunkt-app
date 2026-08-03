/**
 * Boot-step logger for diagnosing launch crashes.
 * Search logcat / Metro for the prefix `[wp-boot]`.
 */
const PREFIX = "[wp-boot]";

function stamp() {
  return new Date().toISOString();
}

export function bootLog(step: string, detail?: Record<string, unknown> | string) {
  if (detail === undefined) {
    console.log(`${PREFIX} ${stamp()} ${step}`);
    return;
  }

  if (typeof detail === "string") {
    console.log(`${PREFIX} ${stamp()} ${step} — ${detail}`);
    return;
  }

  console.log(`${PREFIX} ${stamp()} ${step}`, detail);
}

export function bootWarn(step: string, detail?: unknown) {
  console.warn(`${PREFIX} ${stamp()} WARN ${step}`, detail ?? "");
}

export function bootError(step: string, error: unknown) {
  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === "string"
        ? error
        : JSON.stringify(error);
  console.error(`${PREFIX} ${stamp()} ERROR ${step} — ${message}`, error);
}
