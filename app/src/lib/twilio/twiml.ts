import twilio from "twilio";

export function gatherPinPromptTwiml() {
  const response = new twilio.twiml.VoiceResponse();
  const gather = response.gather({
    input: ["dtmf"],
    numDigits: 6,
    action: "/api/twilio/voice/validate-pin",
    method: "POST",
    timeout: 8,
  });

  gather.say(
    "Welcome to Treewalk interviewer. Please enter your six digit interview PIN.",
  );
  response.say("We did not receive a PIN. Goodbye.");
  response.hangup();
  return response.toString();
}

export function invalidPinTwiml() {
  const response = new twilio.twiml.VoiceResponse();
  response.say("The PIN was invalid. Please hang up and try again.");
  response.hangup();
  return response.toString();
}

export function successfulRoutingTwiml() {
  const response = new twilio.twiml.VoiceResponse();
  response.say(
    "Routing confirmed. You are now connected to the Treewalk interviewer context.",
  );
  response.pause({ length: 1 });
  response.say("Please begin by describing your workday yesterday, hour by hour.");
  return response.toString();
}
