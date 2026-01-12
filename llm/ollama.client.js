import fetch from "node-fetch";

const LLM_URL = "http://10.12.203.1:8080/v1/chat/completions";
const API_TOKEN = "aab1db4e-4c24-4bcb-9e91-de464cc35df2";

export async function llmGenerate(prompt) {
  try {
    console.log(" Calling hosted LLM...");

    const response = await fetch(LLM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        model: "llama3:latest",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      }),
      timeout: 60000
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LLM error ${response.status}: ${text}`);
    }

    const data = await response.json();

    return data?.choices?.[0]?.message?.content
      || "LLM returned empty response";

  } catch (error) {
    console.error("LLM not reachable:", error.message);
    return "AI service unavailable. Please try again later.";
  }
}
