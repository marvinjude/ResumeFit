"use server";

import { refresh } from "next/cache";
import { archiveEvaluation as archiveStoredEvaluation } from "@/lib/mongo/evaluations-repo";
import { readSessionId } from "@/lib/session/session";

/** Archives one of the current session's evaluations, then refreshes the
 * router so it drops out of the sidebar. Nothing is deleted. */
export async function archiveEvaluation(id: string): Promise<void> {
  const sessionId = await readSessionId();
  if (!sessionId) return;
  await archiveStoredEvaluation(sessionId, id);
  refresh();
}
