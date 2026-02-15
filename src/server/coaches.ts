import "server-only";
import { getDB } from "@/db";
import { coachTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getAllCoaches() {
  const db = getDB();
  return db.query.coachTable.findMany({
    orderBy: [asc(coachTable.name)],
  });
}

export async function getCoachBySlug(slug: string) {
  const db = getDB();
  return db.query.coachTable.findFirst({
    where: eq(coachTable.slug, slug),
  });
}

export async function getCoachById(id: string) {
  const db = getDB();
  return db.query.coachTable.findFirst({
    where: eq(coachTable.id, id),
  });
}
