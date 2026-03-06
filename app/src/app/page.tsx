import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/engagements");
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold text-slate-900">Treewalk Engagement Workflow</h1>
      <p className="mt-4 max-w-2xl text-slate-700">
        Sign in with Microsoft via Clerk to create client engagements, capture planning and
        research context, route Twilio interviews by PIN, ingest transcripts, and generate
        versioned client-facing drafts.
      </p>
      <div className="mt-6">
        <Link
          href="/sign-in"
          className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Sign in to continue
        </Link>
      </div>
    </div>
  );
}
