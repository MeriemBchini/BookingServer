import { llmGenerate } from "../llm/ollama.client.js";

export async function successMessage({ action, apartment, booking }) {
  const prompt = `
Write a short, friendly SUCCESS message.

Action: ${action}

Apartment info:
- name: ${apartment?.name}
- address: ${apartment?.address}
- floor: ${apartment?.floor}
- noise level: ${apartment?.noiseLevel}
- price per day: ${apartment?.pricePerDay}

Booking info:
- bookingId: ${booking?._id}
- startDate: ${booking?.startDate}
- endDate: ${booking?.endDate}

Rules:
- Mention the action clearly
- Be polite
- 3–5 lines max
`;

  return await llmGenerate(prompt);
}
