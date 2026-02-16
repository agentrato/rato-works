# HEARTBEAT.md - Periodic Checks

Run these checks periodically. Report issues to Duxo via Telegram only if something is wrong.

## System Health
- Check disk usage: `df -h /data | tail -1` — alert if over 85%
- Check memory: `free -m | grep Mem` — alert if available < 500MB

## Wallet Monitor
- Check SOL balance: `node /data/tools/jupiter/swap.mjs balance`
- Alert if SOL balance drops below 0.005 SOL (not enough for tx fees)

## Quiet Mode
- Do NOT send routine "all good" messages — only alert on problems
- If everything is healthy, stay quiet
