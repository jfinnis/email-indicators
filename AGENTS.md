# Email Indicators - AGENTS.md

## Project Overview

This project provides **Gmail unread email count display for tmux status bars**. The ultimate goal is seamless
integration with tmux status bar plugins (specifically tmux-powerline) to show unread email counts.

## Core Purpose

Fetch unread Gmail count and output it in a format suitable for tmux status bar display. The output should be minimal
and clean:
- Outputs plain number to stdout (e.g., `3` for 3 unread emails)
- Shell wrapper (`segments/mailcount_gmail.sh`) formats for tmux: `✉ 3`
- Silent output when no unread emails (clean status bar)

## Tech Stack

- **Runtime**: Bun (not Node.js)
- **Language**: TypeScript
- **Key dependency**: `googleapis` for Gmail API access
- **Module resolution**: Bundler-style (see tsconfig.json)

## Running the Project

```bash
bun run start          # Runs src/email-counts.ts
bun run src/email-counts.ts  # Direct execution
```

## Tmux Integration

The project integrates with tmux status bars via:

1. **Direct output**: `bun run start` outputs unread count as plain number
2. **Shell wrapper**: `segments/mailcount_gmail.sh` formats output for tmux-powerline
3. **Cache**: Results cached for 2 minutes at `~/.cache/email-indicators/counts.json`

### Important for tmux plugin compatibility:
- Keep output minimal and parseable
- Respect the 2-minute cache to avoid API rate limits
- Shell scripts should use portable paths (avoid hardcoded `/Users/finnisj/...`)
- Exit cleanly with no stderr noise (tmux captures both stdout and stderr)

## Configuration

| Location | Purpose |
|----------|---------|
| `~/.config/email-indicators/token.json` | OAuth refresh token              |
| `~/.cache/email-indicators/counts.json` | Cached counts |
| `gmail-oauth.json` | OAuth credentials (gitignored) |

## Gmail API Setup

Required scopes: `https://www.googleapis.com/auth/gmail.readonly`

1. Google Cloud Console project with Gmail API enabled
2. OAuth 2.0 credentials (Desktop app)
3. Run auth flow: `src/auth-url.ts` → `src/auth-complete.ts`

## Development Conventions

- Use **Bun** for all script execution (not npm/node)
- Source files in `src/` directory
- TypeScript with bundler module resolution
- Cache unread counts to respect Gmail API rate limits
- Keep tmux integration as the primary output target
- Shell scripts in `segments/` directory

## Linting & Typechecking

- `bun run lint` - Run Biome and automatically fix style issues
- `bun run typecheck` - Run tsgo to typecheck the codebase

## Version Control

- Use **Jujutsu (jj)** for version control, not git
- Sensitive files (`gmail-oauth.json`, `token.json`) are gitignored

## Testing

When testing changes:
1. Verify `bun run start` outputs a plain number
2. Check `segments/mailcount_gmail.sh` formats correctly for tmux
3. Ensure cache works (second call should be faster)
4. Test with tmux status bar integration if possible
