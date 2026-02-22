# HEARTBEAT.md - Periodic Checks

## Rules
- Only alert Duxo on problems. If healthy → reply HEARTBEAT_OK
- Late night (23:00-08:00 CET): ALWAYS HEARTBEAT_OK unless critical
- Do NOT loop on completed tasks. Check `tasks.json` for what's active.
- Do NOT re-read old memory files looking for work. Trust the task tracker.

## Every Heartbeat (fast, cheap)
1. `df -h /data | tail -1` — alert if over 85%
2. `free -m | grep Mem` — alert if available < 500MB
3. If today's `memory/YYYY-MM-DD.md` doesn't exist, create it

## Rotation (pick ONE per heartbeat, cycle through)
Track which you last did in `memory/heartbeat-state.json` under `lastRotation`.

### A: Wallet + Price Alerts
- `node /data/tools/jupiter/swap.mjs balance` — alert if < 0.005 SOL
- `node /data/tools/jupiter/portfolio.mjs alerts` — report any triggered alerts

### B: Task Review
- Read `tasks.json` — report any blocked tasks or new items
- `git -C /data/.openclaw/workspace status --short` — note uncommitted changes
- Do NOT invent tasks. Only work on what's explicitly listed.

### C: Memory Maintenance
- `ls memory/` then read only the last 2-3 daily files
- Update MEMORY.md with distilled learnings if anything significant
- Remove outdated info from MEMORY.md

### D: Portfolio Check (daytime only, skip in quiet mode)
- `node /data/tools/jupiter/portfolio.mjs overview` — log total value
- Only alert Duxo if portfolio changes > 15% since last check

## Completed Projects (DO NOT revisit)
- pet-passport — deployed to devnet 2026-02-18
