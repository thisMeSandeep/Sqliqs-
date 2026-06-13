import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

// POC round-trip: NL → OpenRouter → streamed text. Phase 2 evolves this to
// run the query agent against a DatabaseAdapter; for now it just proves the
// OpenRouter wiring end to end.
const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openrouter(process.env.OPENROUTER_DEFAULT_MODEL ?? "openrouter/free"),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
  
}

