import { classifyBooking } from "./classifier.agent.js";
import { successMessage } from "./success.agent.js";
import { failureMessage } from "./failure.agent.js";
import { saveEmailToFile } from "../utils/emailFileWriter.js";

export async function handleAgentResponse({
  action,
  success,
  apartment,
  booking,
  errorReason
}) {
  const result = { action, success, apartment, booking, errorReason };
  const classification = await classifyBooking(result);

  let message;
  let type;

  if (classification.status === "SUCCESS") {
    type = "SUCCESS";
    message = await successMessage({ action, apartment, booking });
  } else {
    type = "FAILURE";
    message = await failureMessage({
      action,
      reason: errorReason,
      apartment,
      booking
    });
  }
 console.log("Generated message:", message);
  const filePath = await saveEmailToFile({
    type,
    action,
    content: message,
    bookingId: booking?._id
  });

  return {
    status: type,
    message,
    emailSavedAt: filePath
  };
}
