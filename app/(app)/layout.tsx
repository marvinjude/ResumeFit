import { cookies } from "next/headers";
import { HistorySidebar } from "@/components/history/history-sidebar";
import { listArchivedEvaluations, listRecentEvaluations } from "@/lib/mongo/evaluations-repo";
import { readSessionId } from "@/lib/session/session";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionId = await readSessionId();
  const [evaluations, archivedEvaluations] = sessionId
    ? await Promise.all([listRecentEvaluations(sessionId), listArchivedEvaluations(sessionId)])
    : [[], []];
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <HistorySidebar
        evaluations={evaluations}
        archivedEvaluations={archivedEvaluations}
        theme={theme}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
