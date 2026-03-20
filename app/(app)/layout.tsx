import type { ReactNode } from 'react';
import { auth, UserButton } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ensureProfile } from '@/lib/auth/clerk';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  await ensureProfile();

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Treewalk Interview Console</h1>
        <UserButton />
      </header>
      {children}
    </div>
  );
}
