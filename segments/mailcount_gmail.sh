#!/bin/bash

# Gmail unread count segment for tmux-powerline
# Uses Bun-based email-indicators project

TMUX_POWERLINE_SEG_MAILCOUNT_GMAIL_INTERVAL_DEFAULT="2"
TMUX_POWERLINE_SEG_MAILCOUNT_PROJECT_DIR_DEFAULT="$HOME/Documents/projects/email-indicators-proj"

__process_settings() {
	if [ -z "$TMUX_POWERLINE_SEG_MAILCOUNT_GMAIL_INTERVAL" ]; then
		export TMUX_POWERLINE_SEG_MAILCOUNT_GMAIL_INTERVAL="${TMUX_POWERLINE_SEG_MAILCOUNT_GMAIL_INTERVAL_DEFAULT}"
	fi
	if [ -z "$TMUX_POWERLINE_SEG_MAILCOUNT_PROJECT_DIR" ]; then
		export TMUX_POWERLINE_SEG_MAILCOUNT_PROJECT_DIR="${TMUX_POWERLINE_SEG_MAILCOUNT_PROJECT_DIR_DEFAULT}"
	fi
}

generate_segmentrc() {
	read -d '' rccontents << EORC
# Path to email-indicators project
export TMUX_POWERLINE_SEG_MAILCOUNT_PROJECT_DIR="${TMUX_POWERLINE_SEG_MAILCOUNT_PROJECT_DIR_DEFAULT}"

# How often in minutes to check for new mails.
export TMUX_POWERLINE_SEG_MAILCOUNT_GMAIL_INTERVAL="${TMUX_POWERLINE_SEG_MAILCOUNT_GMAIL_INTERVAL_DEFAULT}"
EORC
	echo "${rccontents}"
}

run_segment() {
	__process_settings

	local project_dir="$TMUX_POWERLINE_SEG_MAILCOUNT_PROJECT_DIR"

	if [ ! -d "$project_dir" ]; then
		return 1
	fi

	# Find bun in PATH or common locations
	local bun_cmd
	if command -v bun &> /dev/null; then
		bun_cmd="bun"
	elif [ -f "$HOME/.bun/bin/bun" ]; then
		bun_cmd="$HOME/.bun/bin/bun"
	else
		return 1
	fi

	local cache_file="$HOME/.cache/email-indicators/counts.json"

	# Refresh mail count if cache is older than interval minutes
	local current_time
	current_time=$(date +"%s")
	local last_update=0

	if [ -f "$cache_file" ]; then
		if date --version 2>/dev/null | grep -q GNU; then
			last_update=$(stat -c "%Y" "$cache_file" 2>/dev/null || echo 0)
		else
			last_update=$(stat -f "%m" "$cache_file" 2>/dev/null || echo 0)
		fi
	fi

	if [ "$((current_time - last_update))" -gt "$((TMUX_POWERLINE_SEG_MAILCOUNT_GMAIL_INTERVAL * 60))" ] || [ ! -f "$cache_file" ]; then
		# Try to refresh cache
		$bun_cmd run "$project_dir/src/email-counts.ts" >/dev/null 2>&1
		# If bun failed but cache exists, that's okay - use stale cache
		# If bun failed and no cache, fall through to error handling below
	fi

	local count
	count=$(cat "$cache_file" 2>/dev/null | grep -oE '"count":[0-9]+' | cut -d: -f2)

	if [ -z "$count" ]; then
		return 1
	fi

	if [ "$count" -gt 0 ] 2>/dev/null; then
		echo "✉ ${count}"
	fi

	return 0
}
