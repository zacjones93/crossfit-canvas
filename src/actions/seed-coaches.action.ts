"use server";

import { getDB } from "@/db";
import { coachTable } from "@/db/schema";
import { coaches } from "@/constants/coaches";
import { eq } from "drizzle-orm";

function generateCoachSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function seedCoaches() {
  const db = getDB();
  let seeded = 0;
  let skipped = 0;

  for (const coach of coaches) {
    const slug = generateCoachSlug(coach.name);

    const existing = await db.query.coachTable.findFirst({
      where: eq(coachTable.slug, slug),
    });

    if (existing) {
      skipped++;
      continue;
    }

    await db.insert(coachTable).values({
      name: coach.name,
      slug,
      credentials: coach.credentials,
      bio: coach.bio,
    });

    seeded++;
  }

  return { seeded, skipped };
}
