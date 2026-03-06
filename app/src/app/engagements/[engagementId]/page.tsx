import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ engagementId: string }>;
};

export default async function EngagementWorkspacePage({ params }: Props) {
  const actor = await requireActor();
  const { engagementId } = await params;

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
    include: {
      planningArtifacts: true,
      researchBriefs: true,
      interviewSessions: true,
      extractionArtifacts: true,
      outputDocuments: {
        include: {
          versions: true,
        },
      },
    },
  });

  if (!engagement) {
    notFound();
  }

  const latestVersions = engagement.outputDocuments.reduce((acc, doc) => {
    const maxVersion = Math.max(...doc.versions.map((v) => v.versionNumber), 0);
    return acc + maxVersion;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{engagement.clientName}</h1>
        <p className="mt-2 text-slate-700">{engagement.objective ?? "No objective provided yet."}</p>
        <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
          Engagement ID: {engagement.id}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="Planning artifacts" value={engagement.planningArtifacts.length} />
        <StatCard label="Research briefs" value={engagement.researchBriefs.length} />
        <StatCard label="Interview sessions" value={engagement.interviewSessions.length} />
        <StatCard label="Extraction artifacts" value={engagement.extractionArtifacts.length} />
        <StatCard label="Output docs" value={engagement.outputDocuments.length} />
        <StatCard label="Output versions" value={latestVersions} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Workflow shortcuts</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href={`/engagements/${engagement.id}/planning`} className="text-blue-700 hover:underline">
            Planning
          </Link>
          <Link href={`/engagements/${engagement.id}/research`} className="text-blue-700 hover:underline">
            Research
          </Link>
          <Link href={`/engagements/${engagement.id}/interviews`} className="text-blue-700 hover:underline">
            Interviews
          </Link>
          <Link href={`/engagements/${engagement.id}/outputs`} className="text-blue-700 hover:underline">
            Outputs
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
