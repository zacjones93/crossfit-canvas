import { describe, expect, it } from "vitest";
import { parseRosterText, planRosterImport } from "./roster";

describe("parseRosterText", () => {
  it("parses names with optional email, ignoring blanks and comments", () => {
    const { rows, errors, duplicates } = parseRosterText(
      "Jane Doe, JANE@example.com\n\n# coaches below\n  John   Smith  \nAmy Lee\tamy@example.com\r\n",
    );
    expect(rows).toEqual([
      { name: "Jane Doe", email: "jane@example.com" },
      { name: "John Smith", email: null },
      { name: "Amy Lee", email: "amy@example.com" },
    ]);
    expect(errors).toEqual([]);
    expect(duplicates).toEqual([]);
  });

  it("reports invalid lines with line numbers", () => {
    const { rows, errors } = parseRosterText("Jane, not-an-email\n, bob@example.com\nOk Person");
    expect(rows).toEqual([{ name: "Ok Person", email: null }]);
    expect(errors.map((error) => error.line)).toEqual([1, 2]);
  });

  it("dedupes names case-insensitively, keeping the first", () => {
    const { rows, duplicates } = parseRosterText("Jane Doe\njane  doe, jane@example.com");
    expect(rows).toEqual([{ name: "Jane Doe", email: null }]);
    expect(duplicates).toEqual([{ name: "jane doe", reason: "Listed more than once" }]);
  });
});

describe("planRosterImport", () => {
  const participants = [
    { id: "p1", name: "Jane Doe", email: "jane@example.com" },
    { id: "p2", name: "Sam Twin", email: null },
    { id: "p3", name: "Sam Twin", email: null },
    { id: "p4", name: "Alex Prior", email: null },
  ];

  it("skips names already entered in the event", () => {
    const plan = planRosterImport({
      rows: [{ name: "jane doe", email: null }],
      participants,
      enteredParticipantIds: new Set(["p1"]),
      eventCountByParticipant: new Map(),
    });
    expect(plan.create).toEqual([]);
    expect(plan.skipped[0].reason).toBe("Already in this event");
  });

  it("reuses a participant by email, or by unique name; creates otherwise", () => {
    const plan = planRosterImport({
      rows: [
        { name: "Janie D", email: "jane@example.com" },
        { name: "Alex Prior", email: null },
        { name: "Sam Twin", email: null },
        { name: "New Person", email: null },
      ],
      participants,
      enteredParticipantIds: new Set(),
      eventCountByParticipant: new Map([["p1", 2], ["p4", 1]]),
    });
    expect(plan.create.map((item) => item.participantId)).toEqual(["p1", "p4", null, null]);
    expect(plan.skipped).toEqual([]);
    expect(plan.reused).toEqual([
      { name: "Janie D", participantName: "Jane Doe", priorEvents: 2 },
      { name: "Alex Prior", participantName: "Alex Prior", priorEvents: 1 },
    ]);
  });

  it("falls back to a name match only when the emails don't contradict", () => {
    const plan = planRosterImport({
      rows: [
        { name: "Jane Doe", email: "other@example.com" },
        { name: "Alex Prior", email: "alex@example.com" },
      ],
      participants,
      enteredParticipantIds: new Set(),
      eventCountByParticipant: new Map(),
    });
    // Jane's record has a different email → new person; Alex's record has none → reuse
    expect(plan.create.map((item) => item.participantId)).toEqual([null, "p4"]);
    expect(plan.reused.map((item) => item.name)).toEqual(["Alex Prior"]);
  });

  it("skips an email match that is already entered under another name", () => {
    const plan = planRosterImport({
      rows: [{ name: "Janie D", email: "jane@example.com" }],
      participants,
      enteredParticipantIds: new Set(["p1"]),
      eventCountByParticipant: new Map(),
    });
    expect(plan.create).toEqual([]);
    expect(plan.skipped[0].reason).toBe("Already in this event as Jane Doe");
  });
});
