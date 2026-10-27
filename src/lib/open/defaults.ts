import { OPEN_RULE_CADENCE } from "./constants";

export interface OpenScalingDefault {
  name: string;
  slug: string;
  rank: number;
}

export interface OpenRuleDefault {
  name: string;
  points: number;
  cadence: (typeof OPEN_RULE_CADENCE)[keyof typeof OPEN_RULE_CADENCE];
  coachAwardable: boolean;
}

// Seeded into every new event that has no previous event to copy from. Lower rank = better.
export const DEFAULT_OPEN_SCALINGS: readonly OpenScalingDefault[] = [
  { name: "Rx", slug: "rx", rank: 0 },
  { name: "Scaled", slug: "scaled", rank: 1 },
  { name: "Foundations", slug: "foundations", rank: 2 },
];

// Starter point rules offered when creating an event; admins edit freely afterwards.
export const DEFAULT_OPEN_RULES: readonly OpenRuleDefault[] = [
  { name: "Workout Completion", points: 1, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "Judging", points: 1, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "FNL Attendance", points: 1, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "Costume", points: 1, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "Personal Record", points: 1, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "Social Media Post", points: 1, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "Judges Course", points: 3, cadence: OPEN_RULE_CADENCE.ONCE_PER_EVENT, coachAwardable: true },
  { name: "Spirit of the Open", points: 5, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: false },
];
