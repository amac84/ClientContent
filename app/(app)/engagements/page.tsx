import Link from 'next/link';

export default function EngagementsPage() {
  return (
    <main>
      <h2>Engagements</h2>
      <p>Create engagements and drive planning, research, interviews, and outputs.</p>
      <ul>
        <li>
          <Link href="/engagements/demo-engagement">Open demo engagement</Link>
        </li>
      </ul>
    </main>
  );
}
