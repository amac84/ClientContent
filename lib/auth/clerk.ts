import 'server-only';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/db/supabaseAdmin';

export async function getClerkUserId() {
  const { userId } = await auth();
  return userId;
}

export async function ensureProfile() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        clerk_user_id: userId,
        email: user?.primaryEmailAddress?.emailAddress ?? null
      },
      { onConflict: 'clerk_user_id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
