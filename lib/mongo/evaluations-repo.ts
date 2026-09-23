import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo/client";
import type { EvaluationRecord, EvaluationSummary } from "@/types/evaluation-record";

const COLLECTION = "evaluations";

type StoredEvaluation = Omit<EvaluationRecord, "id" | "persisted">;

let indexEnsured = false;

async function ensureIndexes(): Promise<void> {
  if (indexEnsured) return;
  const db = await getDb();
  await db.collection(COLLECTION).createIndex({ sessionId: 1, createdAt: -1 });
  indexEnsured = true;
}

export async function insertEvaluation(record: StoredEvaluation): Promise<string> {
  await ensureIndexes();
  const db = await getDb();
  const result = await db.collection<StoredEvaluation>(COLLECTION).insertOne(record);
  return result.insertedId.toString();
}

function guessTitle(text: string): string {
  const trimmed = text.trim().slice(0, 80);
  if (trimmed.length === text.trim().length) return trimmed;
  const lastSpace = trimmed.lastIndexOf(" ");
  return `${lastSpace > 40 ? trimmed.slice(0, lastSpace) : trimmed}…`;
}

export async function listRecentEvaluations(
  sessionId: string,
  limit = 15,
): Promise<EvaluationSummary[]> {
  const db = await getDb();
  const docs = await db
    .collection<StoredEvaluation & { _id: ObjectId }>(COLLECTION)
    .find({ sessionId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .project<{
      _id: ObjectId;
      createdAt: string;
      overallScore: number;
      jobDescription: string;
      resume: string;
    }>({
      jobDescription: 1,
      resume: 1,
      createdAt: 1,
      overallScore: 1,
    })
    .toArray();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    createdAt: doc.createdAt,
    overallScore: doc.overallScore,
    jobTitleGuess: guessTitle(doc.jobDescription),
    resumeTitleGuess: guessTitle(doc.resume),
  }));
}

export async function getEvaluationById(
  sessionId: string,
  id: string,
): Promise<EvaluationRecord | null> {
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return null;
  }
  const db = await getDb();
  const doc = await db
    .collection<StoredEvaluation & { _id: ObjectId }>(COLLECTION)
    .findOne({ _id: objectId, sessionId });
  if (!doc) return null;

  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString(), persisted: true };
}
