import { OutputVersion, OutputVersionStatus } from "@prisma/client";

type OutputEditorProps = {
  version: OutputVersion;
  engagementId: string;
  saveVersionEdits: (formData: FormData) => Promise<void>;
  approveVersion: (formData: FormData) => Promise<void>;
};

export function OutputEditor({
  version,
  engagementId,
  saveVersionEdits,
  approveVersion,
}: OutputEditorProps) {
  return (
    <article className="rounded-md border border-slate-200 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="font-medium text-slate-800">Version {version.versionNumber}</p>
        <StatusBadge status={version.status} />
      </div>
      <form action={saveVersionEdits} className="space-y-3">
        <input type="hidden" name="versionId" value={version.id} />
        <input type="hidden" name="engagementId" value={engagementId} />
        <textarea
          name="markdown"
          rows={12}
          defaultValue={version.markdown}
          className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            Save edits
          </button>
        </div>
      </form>

      {version.status !== "APPROVED" ? (
        <form action={approveVersion} className="mt-2">
          <input type="hidden" name="versionId" value={version.id} />
          <input type="hidden" name="engagementId" value={engagementId} />
          <button
            type="submit"
            className="rounded-md border border-green-600 px-3 py-2 text-sm font-medium text-green-700"
          >
            Approve version
          </button>
        </form>
      ) : (
        <p className="mt-2 text-xs text-green-700">
          Approved by {version.approvedByUserId ?? "unknown"} on{" "}
          {version.approvedAt?.toISOString() ?? "n/a"}.
        </p>
      )}
    </article>
  );
}

function StatusBadge({ status }: { status: OutputVersionStatus }) {
  if (status === "APPROVED") {
    return (
      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
        APPROVED
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      DRAFT
    </span>
  );
}
