// Plain module: parse pasted roster text and plan which participants/entries an import creates.

export interface RosterRow {
  name: string;
  email: string | null;
}

export interface RosterLineError {
  line: number;
  text: string;
  message: string;
}

export interface RosterSkip {
  name: string;
  reason: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const ROSTER_NAME_MAX = 255;

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * One athlete per line: `Name` or `Name, email` (tab also separates, for spreadsheet pastes).
 * Blank lines and `#` comments are ignored; repeated names (case-insensitive) keep the first.
 */
export function parseRosterText(text: string): { rows: RosterRow[]; errors: RosterLineError[]; duplicates: RosterSkip[] } {
  const rows: RosterRow[] = [];
  const errors: RosterLineError[] = [];
  const duplicates: RosterSkip[] = [];
  const seen = new Set<string>();

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;

    const separator = line.search(/[,\t]/);
    const name = (separator === -1 ? line : line.slice(0, separator)).trim().replace(/\s+/g, " ");
    const emailRaw = separator === -1 ? "" : line.slice(separator + 1).trim();
    const fail = (message: string) => errors.push({ line: index + 1, text: line, message });

    if (!name) return fail("Missing name");
    if (name.length > ROSTER_NAME_MAX) return fail(`Name is longer than ${ROSTER_NAME_MAX} characters`);
    if (emailRaw && !EMAIL_RE.test(emailRaw)) return fail(`"${emailRaw}" is not a valid email`);

    const key = normalizeName(name);
    if (seen.has(key)) return duplicates.push({ name, reason: "Listed more than once" });
    seen.add(key);
    rows.push({ name, email: emailRaw ? emailRaw.toLowerCase() : null });
  });

  return { rows, errors, duplicates };
}

export interface RosterParticipant {
  id: string;
  name: string;
  email: string | null;
}

export interface RosterPlanItem extends RosterRow {
  /** Existing participant to enter into the event, or null to create a new one. */
  participantId: string | null;
}

export interface RosterReuse {
  /** Name as pasted. */
  name: string;
  /** Name on the existing participant record. */
  participantName: string;
  /** How many other events the participant is already entered in. */
  priorEvents: number;
}

/**
 * Skips names already entered in the event; reuses an existing participant (from earlier events)
 * matched by email, or by name when exactly one participant has it and the emails don't
 * contradict (either side missing, or equal); otherwise creates one.
 */
export function planRosterImport({
  rows,
  participants,
  enteredParticipantIds,
  eventCountByParticipant,
}: {
  rows: readonly RosterRow[];
  participants: readonly RosterParticipant[];
  enteredParticipantIds: ReadonlySet<string>;
  eventCountByParticipant: ReadonlyMap<string, number>;
}): { create: RosterPlanItem[]; skipped: RosterSkip[]; reused: RosterReuse[] } {
  const byEmail = new Map<string, RosterParticipant>();
  const byName = new Map<string, RosterParticipant[]>();
  for (const participant of participants) {
    if (participant.email) byEmail.set(participant.email.toLowerCase(), participant);
    const key = normalizeName(participant.name);
    byName.set(key, [...(byName.get(key) ?? []), participant]);
  }

  const enteredNames = new Set(
    participants.filter((participant) => enteredParticipantIds.has(participant.id)).map((participant) => normalizeName(participant.name)),
  );

  const create: RosterPlanItem[] = [];
  const skipped: RosterSkip[] = [];
  const reused: RosterReuse[] = [];
  const planned = new Set<string>();

  for (const row of rows) {
    if (enteredNames.has(normalizeName(row.name))) {
      skipped.push({ name: row.name, reason: "Already in this event" });
      continue;
    }

    const nameMatches = byName.get(normalizeName(row.name)) ?? [];
    const nameMatch = nameMatches.length === 1 ? nameMatches[0] : undefined;
    const emailsAgree = (candidate: RosterParticipant) =>
      !row.email || !candidate.email || candidate.email.toLowerCase() === row.email;
    const match =
      (row.email ? byEmail.get(row.email) : undefined) ?? (nameMatch && emailsAgree(nameMatch) ? nameMatch : undefined);

    if (match && (enteredParticipantIds.has(match.id) || planned.has(match.id))) {
      skipped.push({ name: row.name, reason: `Already in this event as ${match.name}` });
      continue;
    }
    if (match) {
      planned.add(match.id);
      reused.push({ name: row.name, participantName: match.name, priorEvents: eventCountByParticipant.get(match.id) ?? 0 });
    }
    create.push({ ...row, participantId: match?.id ?? null });
  }

  return { create, skipped, reused };
}
