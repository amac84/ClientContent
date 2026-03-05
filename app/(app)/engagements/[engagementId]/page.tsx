import Link from 'next/link';

export default async function EngagementOverview({ params }: { params: Promise<{ engagementId: string }> }) {
  const { engagementId } = await params;

  return (
    <main>
      <h2>Engagement {engagementId}</h2>
      <ul>
        <li><Link href={`/engagements/${engagementId}/plan`}>Run planning</Link></li>
        <li><Link href={`/engagements/${engagementId}/research`}>Run research</Link></li>
        <li><Link href={`/engagements/${engagementId}/interviews`}>Create interview sessions</Link></li>
        <li><Link href={`/engagements/${engagementId}/outputs`}>View outputs</Link></li>
      </ul>
    </main>
  );
}
