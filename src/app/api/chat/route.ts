import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, stepCountIs, UIMessage } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    stopWhen: stepCountIs(5),
    system: [
      "You are a helpful cooking assistant with access to the user's personal recipe book and shopping list.",
      `Current date and time: ${new Date()}. Location: Germany.`,
    ].join(" "),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
