import { redirect } from "next/navigation";
import { EvaluationWorkspace } from "@/components/evaluate/evaluation-workspace";
import { getEvaluationById } from "@/lib/mongo/evaluations-repo";
import { readSessionId } from "@/lib/session/session";

interface EvaluationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EvaluationDetailPage({ params }: EvaluationDetailPageProps) {
  const { id } = await params;
  const sessionId = await readSessionId();
  const record = sessionId ? await getEvaluationById(sessionId, id) : null;

  // Missing or from another session — skip the dead end and go straight to
  // a fresh input form.
  if (!record) redirect("/");

  return <EvaluationWorkspace key={record.id} initialRecord={record} />;
}
