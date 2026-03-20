import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabaseAdmin';
import { elevenWebhookSchema } from '@/lib/db/schema';
import { verifyElevenLabsWebhook } from '@/lib/telephony/elevenlabs';
import { runExtraction } from '@/lib/agents/extractor';
import { runSynthesizers } from '@/lib/agents/synthesizers';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-elevenlabs-secret');
  if (!verifyElevenLabsWebhook(secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = elevenWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { event_type, transcript, conversation_id, pin } = parsed.data;

  const { data: session } = await supabaseAdmin
    .from('interview_sessions')
    .select('id, engagement_id')
    .eq('pin', pin)
    .maybeSingle();

  if (!session) return NextResponse.json({ ok: true, ignored: true });

  if (event_type === 'conversation.started') {
    await supabaseAdmin
      .from('interview_sessions')
      .update({ status: 'in_progress', eleven_conversation_id: conversation_id, call_started_at: new Date().toISOString() })
      .eq('id', session.id);
  }

  if (event_type === 'conversation.ended') {
    await supabaseAdmin
      .from('interview_sessions')
      .update({ status: 'complete', call_completed_at: new Date().toISOString() })
      .eq('id', session.id);
  }

  if (event_type === 'transcript.ready' && transcript) {
    await supabaseAdmin.from('transcripts').upsert(
      {
        interview_session_id: session.id,
        transcript_text: transcript,
        raw_payload: body
      },
      { onConflict: 'interview_session_id' }
    );

    const extraction = await runExtraction(transcript);
    await supabaseAdmin.from('extractions').upsert(
      {
        engagement_id: session.engagement_id,
        ...extraction
      },
      { onConflict: 'engagement_id' }
    );

    const synth = await runSynthesizers(transcript);
    await supabaseAdmin.from('outputs').insert([
      { engagement_id: session.engagement_id, type: 'client_update', content_md: synth.client_update },
      { engagement_id: session.engagement_id, type: 'automation_memo', content_md: synth.automation_memo },
      { engagement_id: session.engagement_id, type: 'proposal_addon', content_md: synth.proposal_addon }
    ]);
  }

  return NextResponse.json({ ok: true });
}
