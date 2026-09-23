"use server";

import { refresh } from "next/cache";
import { setEvaluationArchived } from "@/lib/mongo/evaluations-repo";
import { readSessionId } from "@/lib/session/session";

/** Archives (or restores) one of the current session's evaluations, then
 * refreshes the router so the sidebar lists update. Nothing is deleted. */
export async function setArchived(id: string, archived: boolean): Promise<void> {
  const sessionId = await readSessionId();
  if (!sessionId) return;
  await setEvaluationArchived(sessionId, id, archived);
  refresh();
}
