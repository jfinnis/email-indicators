// Complete OAuth flow - exchange code for token
import { google } from "googleapis";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".config", "email-indicators");
const TOKEN_PATH = join(CONFIG_DIR, "token.json");

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

async function run() {
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, "http://localhost");

  const code = process.argv[2];
  if (!code) {
    console.error("Usage: bun run src/auth-complete.ts CODE");
    process.exit(1);
  }

  const { tokens } = await oauth2Client.getToken(code);

  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log("Token saved to", TOKEN_PATH);
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});