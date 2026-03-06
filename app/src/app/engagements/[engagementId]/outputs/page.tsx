import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { requireActor } from "@/lib/auth";
import { OutputEditor } from "@/components/outputs/OutputEditor";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ engagementId: string }>;
};

async function saveVersionEdits(formData: FormData) {
  "use server";

  const actor = await requireActor();
  const versionId = String(formData.get("versionId") ?? "");
  const engagementId = String(formData.get("engagementId") ?? "");
  const markdown = String(formData.get("markdown") ?? "");

  const version = await prisma.outputVersion.findFirst({
    where: {
      id: versionId,
      document: {
        engagement: {
          id: engagementId,
          orgId: actor.orgId,
        },
      },
    },
  });

  if (!version) {
    throw new Error("Output version not found.");
  }

  await prisma.outputVersion.update({
    where: { id: versionId },
    data: { markdown },
  });

  revalidatePath(`/engagements/${engagementId}/outputs`);
}

async function createNewVersion(formData: FormData) {
  "use server";

  const actor = await requireActor();
  const documentId = String(formData.get("documentId") ?? "");
  const engagementId = String(formData.get("engagementId") ?? "");

  const document = await prisma.outputDocument.findFirst({
    where: {
      id: documentId,
      engagement: {
        id: engagementId,
        orgId: actor.orgId,
      },
    },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!document) {
    throw new Error("Output document not found.");
  }

  const latest = document.versions[0];

  await prisma.outputVersion.create({
    data: {
      outputDocumentId: documentId,
      versionNumber: (latest?.versionNumber ?? 0) + 1,
      markdown: latest?.markdown ?? "",
      status: "DRAFT",
      createdByUserId: actor.userId,
      generatedFromJson: {
        source: "manual_version_clone",
        sourceVersionId: latest?.id ?? null,
      },
    },
  });

  revalidatePath(`/engagements/${engagementId}/outputs`);
}

async function approveVersion(formData: FormData) {
  "use server";

  const actor = await requireActor();
  const versionId = String(formData.get("versionId") ?? "");
  const engagementId = String(formData.get("engagementId") ?? "");

  const version = await prisma.outputVersion.findFirst({
    where: {
      id: versionId,
      document: {
        engagement: {
          id: engagementId,
          orgId: actor.orgId,
        },
      },
    },
  });

  if (!version) {
    throw new Error("Output version not found.");
  }

  await prisma.outputVersion.update({
    where: { id: versionId },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedByUserId: actor.userId,
    },
  });

  revalidatePath(`/engagements/${engagementId}/outputs`);
}

export default async function OutputsPage({ params }: Props) {
  const actor = await requireActor();
  const { engagementId } = await params;

  const engagement = await prisma.engagement.findFirst({
    where: {
      id: engagementId,
      orgId: actor.orgId,
    },
    include: {
      outputDocuments: {
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!engagement) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Outputs</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review, edit, version, and approve generated drafts.
        </p>
      </section>

      {engagement.outputDocuments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            No outputs generated yet. Ingest a transcript to trigger extraction and draft generation.
          </p>
        </div>
      ) : (
        engagement.outputDocuments.map((document) => (
          <section key={document.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-slate-900">{document.type}</h2>
              <form action={createNewVersion}>
                <input type="hidden" name="documentId" value={document.id} />
                <input type="hidden" name="engagementId" value={engagementId} />
                <button
                  type="submit"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800"
                >
                  New version
                </button>
              </form>
            </div>

            <div className="mt-4 space-y-4">
              {document.versions.map((version) => (
                <OutputEditor
                  key={version.id}
                  version={version}
                  engagementId={engagementId}
                  saveVersionEdits={saveVersionEdits}
                  approveVersion={approveVersion}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
