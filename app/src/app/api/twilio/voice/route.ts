import { NextResponse } from "next/server";
import { gatherPinPromptTwiml } from "@/lib/twilio/twiml";

export async function POST() {
  return new NextResponse(gatherPinPromptTwiml(), {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
