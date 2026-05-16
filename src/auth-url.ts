// Get auth URL

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { google } from 'googleapis'

const OAUTH_CREDS_PATH = join(process.cwd(), 'gmail-oauth.json')

function getClientId(): string {
    const creds = JSON.parse(readFileSync(OAUTH_CREDS_PATH, 'utf-8'))
    return creds.installed.client_id
}
function getClientSecret(): string {
    const creds = JSON.parse(readFileSync(OAUTH_CREDS_PATH, 'utf-8'))
    return creds.installed.client_secret
}

const clientId = getClientId()
const clientSecret = getClientSecret()
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost')

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
})

console.log('Visit this URL to authorize:')
console.log(authUrl)
console.log('')
console.log("After authorizing, copy the code from the URL (after 'code=') and run:")
console.log("  echo 'CODE' | bun run src/auth-complete.ts")
console.log('')
console.log('Replace CODE with the code from the URL.')
