import { env } from "@/lib/env";

type AiMessage = {
  role: "system" | "user";
  content: string;
};

export async function runAi(messages: AiMessage[]) {
  if (!env.AI_API_KEY) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      messages,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return json.choices?.[0]?.message?.content?.trim() ?? null;
}
