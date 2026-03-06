import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { requireActor } from "@/lib/auth";
import { generateUniquePin } from "@/lib/pin/pinService";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ engagementId: string }>;
};

async function createInterviewSession(formData: FormData) {
  "use server";

  const actor = await requireActor();
  const engagementId = String(formData.get("engagementId") ?? "");
  const participantName = String(formData.get("participantName") ?? "").trim();

  if (!participantName) {
    throw new Error("Participant name is required.");
  }

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
    select: { id: true },
  });

  if (!engagement) {
    throw new Error("Engagement not found.");
  }

  const { pin, pinHash, pinPreview } = await generateUniquePin();

  await prisma.interviewSession.create({
    data: {
      engagementId,
      participantName,
      pinCode: pin,
      pinHash,
      pinPreview,
      status: "PENDING",
    },
  });

  revalidatePath(`/engagements/${engagementId}/interviews`);
}

export default async function InterviewsPage({ params }: Props) {
  const actor = await requireActor();
  const { engagementId } = await params;

  const engagement = await prisma.engagement.findFirst({
    where: { id: engagementId, orgId: actor.orgId },
    include: {
      interviewSessions: {
        orderBy: { createdAt: "asc" },
        include: {
          transcripts: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!engagement) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Interview sessions</h1>
        <p className="mt-2 text-sm text-slate-600">
          Twilio number:{" "}
          <span className="font-medium">{process.env.TWILIO_NUMBER ?? "+1-000-000-0000"}</span>
        </p>
        <form action={createInterviewSession} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="engagementId" value={engagementId} />
          <input
            name="participantName"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Staff member name"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Create interview session + PIN
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Sessions</h2>
        <div className="mt-4 space-y-4">
          {engagement.interviewSessions.length === 0 ? (
            <p className="text-sm text-slate-600">No interview sessions yet.</p>
          ) : (
            engagement.interviewSessions.map((session) => (
              <div key={session.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{session.participantName}</p>
                    <p className="text-xs text-slate-500">Session ID: {session.id}</p>
                  </div>
                  <div className="text-sm text-slate-700">
                    PIN: <span className="font-semibold">{session.pinCode}</span>
                  </div>
                </div>
                <div className="mt-3 rounded-md bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Latest transcript
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                    {session.transcripts[0]?.transcriptText ?? "No transcript received yet."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
