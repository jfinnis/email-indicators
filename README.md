# Email Indicators

Email unread count indicators for tmux status bar.

## Setup

1. **Set up Gmail API credentials:**
   - Go to Google Cloud Console
   - Create a project with Gmail API enabled
   - Create OAuth 2.0 credentials (Desktop app)
   - Add to your shell config:

```zsh
# ~/.zshenv or ~/.zshrc
export GMAIL_CLIENT_ID="your-client-id"
export GMAIL_CLIENT_SECRET="your-client-secret"
```

2. **Run initial auth:**
   ```bash
   bun run src/auth.ts
   ```
   This opens a browser for you to consent. The refresh token is saved to `~/.config/email-indicators/`.

3. **Configure tmux-powerline:**
   - Add the mailcount segment to your theme

## Usage

```bash
bun run src/email-counts.ts
```

Outputs: `personal:3` (unread count) or empty if no unread mail.