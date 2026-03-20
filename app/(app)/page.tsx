import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main>
      <p>Welcome to Treewalk&apos;s phone interview workflow.</p>
      <Link href="/engagements">Go to engagements</Link>
    </main>
  );
}
