// Get auth URL
import { google } from "googleapis";

function getClientId(): string {
  const id = process.env.GMAIL_CLIENT_ID;
  if (!id) throw new Error("GMAIL_CLIENT_ID not set");
  return id;
}
function getClientSecret(): string {
  const secret = process.env.GMAIL_CLIENT_SECRET;
  if (!secret) throw new Error("GMAIL_CLIENT_SECRET not set");
  return secret;
}

const clientId = getClientId();
const clientSecret = getClientSecret();
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, "http://localhost");

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.readonly"],
});

console.log("Visit this URL to authorize:");
console.log(authUrl);
console.log("");
console.log("After authorizing, copy the code from the URL (after 'code=') and run:");
console.log("  echo 'CODE' | bun run src/auth-complete.ts");
console.log("");
console.log("Replace CODE with the code from the URL.");