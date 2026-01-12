import { llmGenerate } from "../llm/ollama.client.js";

export async function classifyBooking(result) {
  const prompt = `
You are a STRICT JSON classifier.

Rules:
- If success === true → SUCCESS
- If success === false → FAILURE

Input:
${JSON.stringify(result, null, 2)}

Reply ONLY with valid JSON:
{ "status": "SUCCESS" | "FAILURE" }
`;

  const response = await llmGenerate(prompt);

  // 🔒 SAFE JSON extraction
  const match = response.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Invalid classifier response: " + response);
  }

  return JSON.parse(match[0]);
}
