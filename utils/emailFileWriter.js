import fs from "fs/promises";
import path from "path";

const EMAIL_DIR = "/tmp/emails";

export async function saveEmailToFile({
    type,        // "SUCCESS" | "FAILURE"
    action,
    content,     // LLM response
    bookingId
}) {
    console.log(`Saving email to file with parameters:`, { type, action, bookingId });
    console.log(" EMAIL_DIR:", EMAIL_DIR);
    console.log(" CWD:", process.cwd());
    try {
        await fs.mkdir(EMAIL_DIR, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `${type}_${action}_${bookingId || "N-A"}_${timestamp}.txt`;
        console.log(`Generated file name:`, fileName);
        const filePath = path.join(EMAIL_DIR, fileName);
        console.log(`Full file path:`, filePath);

        const emailText = `
Subject: ${type} – ${action}

${content}
`.trim();

        await fs.writeFile(filePath, emailText, "utf8");
        console.log(`Email saved to file: ${filePath}`);
        return filePath;
    } catch (err) {
        console.error(`Failed to save email file:`, err);
        throw err;
    }
}
