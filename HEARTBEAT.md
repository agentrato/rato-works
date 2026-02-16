# HEARTBEAT.md - Periodic Checks

Run these checks periodically. Report issues to Duxo via Telegram only if something is wrong.

## System Health
- Check disk usage: `df -h /data | tail -1` — alert if over 85%
- Check memory: `free -m | grep Mem` — alert if available < 500MB

## Wallet Monitor
- Check SOL balance: `node /data/tools/jupiter/swap.mjs balance`
- Alert if SOL balance drops below 0.005 SOL (not enough for tx fees)

## Memory Maintenance
- If today's `memory/YYYY-MM-DD.md` doesn't exist, create it with a brief status note
- Every few days: review recent daily files, update MEMORY.md with distilled learnings
- Remove outdated info from MEMORY.md

## Project Health (check every few heartbeats)
- Run `git -C /data/.openclaw/workspace status --short` — note uncommitted changes
- If pet-passport has unresolved build errors, note them for next work session

## Quiet Mode
- Do NOT send routine "all good" messages — only alert on problems
- If everything is healthy, reply HEARTBEAT_OK
- Late night (23:00-08:00 CET): always HEARTBEAT_OK unless critical
