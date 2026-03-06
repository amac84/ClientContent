import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { buildResearchBrief } from "@/lib/agents/researchAgent";
import { requireActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ engagementId: string }>;
};

async function runResearch(formData: FormData) {
  "use server";

  const actor = await requireActor();
  const engagementId = String(formData.get("engagementId") ?? "");

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
  });

  if (!engagement) {
    throw new Error("Engagement not found.");
  }

  const briefMarkdown = buildResearchBrief(
    engagement.clientName,
    engagement.objective ?? undefined,
  );

  await prisma.researchBrief.create({
    data: {
      engagementId,
      createdByUserId: actor.userId,
      briefMarkdown,
      sourceNotesJson: {
        mode: "auto-brief",
        sourceType: "public_info_stub",
      },
    },
  });

  revalidatePath(`/engagements/${engagementId}/research`);
}

export default async function ResearchPage({ params }: Props) {
  const actor = await requireActor();
  const { engagementId } = await params;

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
  });

  if (!engagement) {
    notFound();
  }

  const latestBrief = await prisma.researchBrief.findFirst({
    where: { engagementId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Company research brief</h1>
      <p className="mt-2 text-sm text-slate-600">
        Generate or refresh interviewer context based on the client name and objective.
      </p>

      <form action={runResearch} className="mt-4">
        <input type="hidden" name="engagementId" value={engagementId} />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Run research
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        {latestBrief ? (
          <pre className="whitespace-pre-wrap text-sm text-slate-800">{latestBrief.briefMarkdown}</pre>
        ) : (
          <p className="text-sm text-slate-600">No research brief saved yet.</p>
        )}
      </div>
    </div>
  );
}
