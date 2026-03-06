import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { buildPlanningSuggestion } from "@/lib/agents/planningAgent";
import { requireActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { planningSchema } from "@/lib/schemas/planning";

type Props = {
  params: Promise<{ engagementId: string }>;
};

async function savePlanningArtifact(formData: FormData) {
  "use server";

  const actor = await requireActor();
  const engagementId = String(formData.get("engagementId") ?? "");
  const chatNotes = String(formData.get("chatNotes") ?? "").trim();
  const planJsonRaw = String(formData.get("planJson") ?? "{}");

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
    select: { id: true },
  });

  if (!engagement) {
    throw new Error("Engagement not found.");
  }

  const parsed = planningSchema.parse(JSON.parse(planJsonRaw));

  await prisma.planningArtifact.create({
    data: {
      engagementId,
      createdByUserId: actor.userId,
      chatNotes: chatNotes || null,
      planJson: parsed,
    },
  });

  revalidatePath(`/engagements/${engagementId}/planning`);
}

export default async function PlanningPage({ params }: Props) {
  const actor = await requireActor();
  const { engagementId } = await params;

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
  });

  if (!engagement) {
    notFound();
  }

  const latestPlanning = await prisma.planningArtifact.findFirst({
    where: { engagementId },
    orderBy: { createdAt: "desc" },
  });

  const suggestedPlan = buildPlanningSuggestion(engagement.objective ?? undefined);
  const initialPlan = latestPlanning?.planJson
    ? JSON.stringify(latestPlanning.planJson, null, 2)
    : JSON.stringify(suggestedPlan, null, 2);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Planning assistant</h1>
      <p className="mt-2 text-sm text-slate-600">
        Capture planning chat notes and save a structured plan JSON with deliverables, metrics,
        systems to probe, interview outline, and downstream jobs.
      </p>

      <form action={savePlanningArtifact} className="mt-6 space-y-4">
        <input type="hidden" name="engagementId" value={engagementId} />

        <div>
          <label htmlFor="chatNotes" className="block text-sm font-medium text-slate-700">
            Planning chat summary
          </label>
          <textarea
            id="chatNotes"
            name="chatNotes"
            rows={5}
            defaultValue={latestPlanning?.chatNotes ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
            placeholder="Outcome needed, evidence required, and interview discovery goals..."
          />
        </div>

        <div>
          <label htmlFor="planJson" className="block text-sm font-medium text-slate-700">
            Structured plan JSON
          </label>
          <textarea
            id="planJson"
            name="planJson"
            rows={18}
            defaultValue={initialPlan}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Save planning output
        </button>
      </form>
    </div>
  );
}
