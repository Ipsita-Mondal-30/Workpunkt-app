export type UnknownRecord = Record<string, unknown>;

export function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

export function asRecords(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) return value.map(asRecord).filter(Boolean) as UnknownRecord[];
  const record = asRecord(value);
  if (!record) return [];
  for (const key of ["applications", "items", "records", "matches", "programs", "documents"]) {
    if (Array.isArray(record[key])) return asRecords(record[key]);
  }
  return Object.keys(record).length ? [record] : [];
}

export function applicationRecords(value: unknown): UnknownRecord[] {
  const root = asRecord(value);
  if (!root) return asRecords(value);
  if (Array.isArray(root.applications)) return asRecords(root.applications);

  const application = asRecord(root.application);
  if (!application) return asRecords(value);
  return [{
    ...root,
    ...application,
    journey: application.journey ?? root.journey,
    currentPhase: application.currentPhase ?? root.currentPhase,
    quickStats: application.quickStats ?? root.quickStats,
  }];
}

export function textValue(record: UnknownRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

export function dateLabel(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function statusTone(status: string): "success" | "warning" | "muted" {
  const normalized = status.toLowerCase();
  if (/approved|accepted|granted|offered|complete|confirmed/.test(normalized)) return "success";
  if (/pending|review|waiting|submitted|progress|applied/.test(normalized)) return "warning";
  return "muted";
}

export function collectDocuments(value: unknown): UnknownRecord[] {
  const records = asRecords(value);
  const found: UnknownRecord[] = [];
  const seen = new Set<string>();

  function visit(candidate: unknown) {
    if (Array.isArray(candidate)) {
      candidate.forEach(visit);
      return;
    }
    const record = asRecord(candidate);
    if (!record) return;
    const looksLikeDocument = Boolean(
      textValue(record, "fileName", "filename", "storageKey", "downloadUrl", "documentId"),
    );
    if (looksLikeDocument) {
      const key = textValue(record, "id", "storageKey", "downloadUrl", "fileName", "filename");
      if (!seen.has(key)) {
        seen.add(key);
        found.push(record);
      }
    }
    Object.values(record).forEach(visit);
  }

  records.forEach(visit);
  return found;
}
