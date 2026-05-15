# Email Indicators

Gmail unread count indicators for tmux status bar.

## Setup

1. **Set up Gmail API credentials:**
   - Go to Google Cloud Console
   - Create a project with Gmail API enabled
   - Create OAuth 2.0 credentials (Desktop app)

2. **Run initial auth:**
   ```bash
   bun run src/auth-url.ts & bun run src/auth-complete.ts
   ```
   This opens a browser for you to consent. The refresh token is saved to `~/.config/email-indicators/`.

3. **Configure tmux-powerline:**
   - Add the `mailcount_gmail` segment to your theme

## Usage
```bash
bun run src/email-counts.ts
```
Outputs: `personal:3` (unread count) or empty if no unread mail.
