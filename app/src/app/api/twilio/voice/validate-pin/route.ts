import { NextResponse } from "next/server";
import { buildInterviewContext } from "@/lib/interview/contextBuilder";
import { hashPin } from "@/lib/pin/pinService";
import { prisma } from "@/lib/prisma";
import { invalidPinTwiml, successfulRoutingTwiml } from "@/lib/twilio/twiml";

export async function POST(request: Request) {
  const formData = await request.formData();
  const pin = String(formData.get("Digits") ?? "").trim();
  const callSid = String(formData.get("CallSid") ?? "").trim() || null;
  const fromNumber = String(formData.get("From") ?? "").trim() || null;

  if (!/^\d{6}$/.test(pin)) {
    return new NextResponse(invalidPinTwiml(), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  const pinHash = hashPin(pin);
  const session = await prisma.interviewSession.findUnique({
    where: { pinHash },
    include: { engagement: true },
  });

  if (!session) {
    return new NextResponse(invalidPinTwiml(), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  const interviewerContext = await buildInterviewContext(session.id);

  await prisma.$transaction([
    prisma.interviewSession.update({
      where: { id: session.id },
      data: { status: "ACTIVE" },
    }),
    prisma.interviewCall.create({
      data: {
        sessionId: session.id,
        twilioCallSid: callSid,
        fromNumber,
        routingStatus: "PIN_VALIDATED",
        interviewerContextJson: interviewerContext,
      },
    }),
  ]);

  return new NextResponse(successfulRoutingTwiml(), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Use POST from Twilio with DTMF Digits payload.",
    },
    { status: 405 },
  );
}
