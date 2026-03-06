import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function createEngagement(formData: FormData) {
  "use server";

  const actor = await requireActor();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const objective = String(formData.get("objective") ?? "").trim();

  if (!clientName) {
    throw new Error("Client name is required.");
  }

  await prisma.engagement.create({
    data: {
      orgId: actor.orgId,
      createdByUserId: actor.userId,
      clientName,
      objective: objective || null,
    },
  });

  revalidatePath("/engagements");
}

export default async function EngagementsPage() {
  const actor = await requireActor();
  const engagements = await prisma.engagement.findMany({
    where: { orgId: actor.orgId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create engagement</h1>
        <form action={createEngagement} className="mt-4 space-y-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-slate-700">
              Client name
            </label>
            <input
              id="clientName"
              name="clientName"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Quarterhill"
            />
          </div>
          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-slate-700">
              Objective (optional)
            </label>
            <textarea
              id="objective"
              name="objective"
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Surface workload and automation opportunities..."
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Create engagement
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Engagements</h2>
        <div className="mt-4 space-y-3">
          {engagements.length === 0 ? (
            <p className="text-sm text-slate-600">No engagements yet.</p>
          ) : (
            engagements.map((engagement) => (
              <div
                key={engagement.id}
                className="flex items-center justify-between rounded-md border border-slate-200 p-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{engagement.clientName}</p>
                  <p className="text-sm text-slate-600">{engagement.objective ?? "No objective"}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Link className="text-blue-700 hover:underline" href={`/engagements/${engagement.id}`}>
                    Workspace
                  </Link>
                  <Link
                    className="text-blue-700 hover:underline"
                    href={`/engagements/${engagement.id}/planning`}
                  >
                    Planning
                  </Link>
                  <Link
                    className="text-blue-700 hover:underline"
                    href={`/engagements/${engagement.id}/research`}
                  >
                    Research
                  </Link>
                  <Link
                    className="text-blue-700 hover:underline"
                    href={`/engagements/${engagement.id}/interviews`}
                  >
                    Interviews
                  </Link>
                  <Link
                    className="text-blue-700 hover:underline"
                    href={`/engagements/${engagement.id}/outputs`}
                  >
                    Outputs
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
