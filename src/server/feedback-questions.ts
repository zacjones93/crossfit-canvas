import "server-only"
import { getDB } from "@/db"
import { feedbackQuestionTable } from "@/db/schema"
import { eq, asc } from "drizzle-orm"

export async function getAllActiveFeedbackQuestions() {
  const db = getDB()
  return db.query.feedbackQuestionTable.findMany({
    where: eq(feedbackQuestionTable.isActive, true),
    orderBy: [asc(feedbackQuestionTable.sortOrder)],
  })
}

export async function getAllFeedbackQuestions() {
  const db = getDB()
  return db.query.feedbackQuestionTable.findMany({
    orderBy: [asc(feedbackQuestionTable.sortOrder)],
  })
}
