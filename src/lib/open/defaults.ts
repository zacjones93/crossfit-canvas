import { OPEN_RULE_CADENCE } from "./constants";

export interface OpenScalingDefault {
  name: string;
  slug: string;
  rank: number;
  placementFirst: number;
  placementStep: number;
  placementMin: number;
  placementPerTeam: number;
}

export interface OpenRuleDefault {
  name: string;
  description?: string;
  points: number;
  cadence: (typeof OPEN_RULE_CADENCE)[keyof typeof OPEN_RULE_CADENCE];
  coachAwardable: boolean;
}

const NO_PLACEMENT = { placementFirst: 0, placementStep: 0, placementMin: 0, placementPerTeam: 0 };

// Seeded into every new event that has no previous event to copy from. Lower rank = better.
// Placement: Rx 100, 95, … (−5 per place, min 5) for each team's top 3 men and top 3 women; Scaled 50, 45, …
// (min 5) for each team's top 2.
export const DEFAULT_OPEN_SCALINGS: readonly OpenScalingDefault[] = [
  { name: "Rx", slug: "rx", rank: 0, placementFirst: 100, placementStep: 5, placementMin: 5, placementPerTeam: 3 },
  { name: "Scaled", slug: "scaled", rank: 1, placementFirst: 50, placementStep: 5, placementMin: 5, placementPerTeam: 2 },
  { name: "Foundations", slug: "foundations", rank: 2, ...NO_PLACEMENT },
];

// Starter point rules offered when creating an event; admins edit freely afterwards.
export const DEFAULT_OPEN_RULES: readonly OpenRuleDefault[] = [
  { name: "Sign Up for the Open", description: "Registered for the official CrossFit Open", points: 10, cadence: OPEN_RULE_CADENCE.ONCE_PER_EVENT, coachAwardable: true },
  { name: "Online Judges Course", description: "Complete the online course", points: 10, cadence: OPEN_RULE_CADENCE.ONCE_PER_EVENT, coachAwardable: true },
  { name: "Advanced Judges Course", description: "Complete the advanced course", points: 10, cadence: OPEN_RULE_CADENCE.ONCE_PER_EVENT, coachAwardable: true },
  { name: "Complete the Open Workout", description: "Each workout", points: 6, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "Friday Night Lights Attendance", points: 2, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "Wear Team Colors", points: 2, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "Bring a Friend to Cheer", points: 2, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "Judge Another Athlete", points: 2, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "Post on Social Media", description: "Team-related post & tag Canvas", points: 5, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: true },
  { name: "Weekly Spirit Challenge Winner", points: 25, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: false },
  { name: "Mystery Pizza Box Challenge", description: "Random bonus challenge", points: 25, cadence: OPEN_RULE_CADENCE.PER_WEEK, coachAwardable: false },
];
