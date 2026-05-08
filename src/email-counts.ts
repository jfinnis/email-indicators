// Core email count script - fetches unread count from Gmail API
import { google } from "googleapis";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".config", "email-indicators");
const TOKEN_PATH = join(CONFIG_DIR, "token.json");
const CACHE_DIR = join(homedir(), ".cache", "email-indicators");
const CACHE_PATH = join(CACHE_DIR, "counts.json");

// Config
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

interface CacheData {
  timestamp: number;
  count: number;
}

function loadToken(): any {
  if (!existsSync(TOKEN_PATH)) {
    throw new Error("No token found. Run auth-url.ts first.");
  }
  return JSON.parse(readFileSync(TOKEN_PATH, "utf-8"));
}

function loadCache(): CacheData | null {
  if (!existsSync(CACHE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function saveCache(count: number): void {
  mkdirSync(CACHE_DIR, { recursive: true });
  const data: CacheData = { timestamp: Date.now(), count };
  writeFileSync(CACHE_PATH, JSON.stringify(data));
}

async function getUnreadCount(auth: any): Promise<number> {
  const gmail = google.gmail({ version: "v1", auth });
  
  const result = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread in:inbox",
    maxResults: 100,
  });
  
  const total = result.data.resultSizeEstimate || 0;
  return total;
}

async function run() {
  // Check cache first
  const cached = loadCache();
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(cached.count);
    return;
  }

  // Load token and create authenticated client
  const token = loadToken();
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, "http://localhost");
  oauth2Client.credentials = token;

  // Fetch count
  const count = await getUnreadCount(oauth2Client);

  // Save cache
  saveCache(count);

  console.log(count);
}

run().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});