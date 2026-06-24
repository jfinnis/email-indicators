// Core email count script - fetches unread count from Gmail API

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { google } from 'googleapis'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const CONFIG_DIR = join(homedir(), '.config', 'email-indicators')
const TOKEN_PATH = join(CONFIG_DIR, 'token.json')
const CACHE_DIR = join(homedir(), '.cache', 'email-indicators')
const CACHE_PATH = join(CACHE_DIR, 'counts.json')
const OAUTH_CREDS_PATH = join(__dirname, '..', 'gmail-oauth.json')

// Config
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getClientId(): string {
    const creds = JSON.parse(readFileSync(OAUTH_CREDS_PATH, 'utf-8'))
    return creds.installed.client_id
}
function getClientSecret(): string {
    const creds = JSON.parse(readFileSync(OAUTH_CREDS_PATH, 'utf-8'))
    return creds.installed.client_secret
}

interface CacheData {
    timestamp: number
    inbox: number
    'bb-email': number
    'bb-email-commented': number
}

interface TokenData {
    access_token?: string
    refresh_token?: string
    scope?: string
    token_type?: string
    expiry_date?: number
}

function loadToken(): TokenData {
    if (!existsSync(TOKEN_PATH)) {
        throw new Error('No token found. Run auth-url.ts first.')
    }
    return JSON.parse(readFileSync(TOKEN_PATH, 'utf-8'))
}

function loadCache(): CacheData | null {
    if (!existsSync(CACHE_PATH)) return null
    try {
        return JSON.parse(readFileSync(CACHE_PATH, 'utf-8'))
    } catch {
        return null
    }
}

function saveCache(inbox: number, bbLabel: number, bbCommented: number): void {
    mkdirSync(CACHE_DIR, { recursive: true })
    const data: CacheData = {
        timestamp: Date.now(),
        inbox,
        'bb-email': bbLabel,
        'bb-email-commented': bbCommented,
    }
    writeFileSync(CACHE_PATH, JSON.stringify(data))
}

async function getQueryCount(
    auth: InstanceType<typeof google.auth.OAuth2>,
    query: string
): Promise<number> {
    const gmail = google.gmail({ version: 'v1', auth })

    const result = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 100,
    })

    return result.data.resultSizeEstimate || 0
}

async function run() {
    // Check cache first
    const cached = loadCache()
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        console.log(`${cached.inbox} ${cached['bb-email']} ${cached['bb-email-commented'] ?? 0}`)
        return
    }

    // Load token and create authenticated client
    const token = loadToken()
    const clientId = getClientId()
    const clientSecret = getClientSecret()

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost')
    oauth2Client.credentials = token

    // Fetch counts
    const inbox = await getQueryCount(oauth2Client, 'is:unread in:inbox')
    const bbLabel = await getQueryCount(oauth2Client, 'is:unread label:bb-email')
    const bbCommented = await getQueryCount(oauth2Client, 'is:unread label:bb-email "commented on" | "mentioned you"')

    // Save cache
    saveCache(inbox, bbLabel, bbCommented)

    console.log(`${inbox} ${bbLabel} ${bbCommented}`)
}

run().catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
})
