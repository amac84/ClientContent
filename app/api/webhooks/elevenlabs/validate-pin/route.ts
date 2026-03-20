import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabaseAdmin';

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  if (!pin) return NextResponse.json({ valid: false }, { status: 400 });

  const { data } = await supabaseAdmin
    .from('interview_sessions')
    .select('id,staff_name,engagement_id,engagements(client_name,objective,research_brief_md)')
    .eq('pin', pin)
    .maybeSingle();

  return NextResponse.json({ valid: Boolean(data), session: data ?? null });
}
