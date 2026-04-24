#!/bin/bash
set -x

# Email count segment for tmux-powerline
output=$(cd /Users/finnisj/Documents/projects/email-indicators-proj && /Users/finnisj/.bun/bin/bun start)
count=$(echo "$output" | grep -E '^[0-9]+$' | tail -1)

if [ -n "$count" ] && [ "$count" -gt 0 ] 2>/dev/null; then
    echo "✉ ${count}"
fi
