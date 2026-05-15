// Complete OAuth flow - exchange code for token
import { google } from "googleapis";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".config", "email-indicators");
const TOKEN_PATH = join(CONFIG_DIR, "token.json");
const OAUTH_CREDS_PATH = join(process.cwd(), "gmail-oauth.json");

function getClientId(): string {
  const creds = JSON.parse(readFileSync(OAUTH_CREDS_PATH, "utf-8"));
  return creds.installed.client_id;
}
function getClientSecret(): string {
  const creds = JSON.parse(readFileSync(OAUTH_CREDS_PATH, "utf-8"));
  return creds.installed.client_secret;
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