import { llmGenerate } from "../llm/ollama.client.js";

export async function failureMessage({ action, reason, apartment, booking }) {
  const prompt = `
Write a polite FAILURE message.

Action attempted: ${action}
Reason: ${reason}

Apartment info:
${apartment ? `- id: ${apartment.id}\n- name: ${apartment.name}\n- address: ${apartment.address}` : "Not available"}

Booking info:
${booking ? `- bookingId: ${booking._id}\n- startDate: ${booking.startDate}\n- endDate: ${booking.endDate}` : "Not available"}

Rules:
- Brief apology
- Clear reason
- Suggest retry
- 3–4 lines max
`;

  return await llmGenerate(prompt);
}
