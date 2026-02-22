# TOOLS.md - Local Notes

## IMPORTANT: PATH for Solana/Rust tools
Cargo binaries are NOT in the default exec PATH. Before running solana/anchor/cargo commands, ALWAYS prefix with:
```bash
export PATH="/data/.cargo/bin:$PATH" &&
```
Example: `export PATH="/data/.cargo/bin:$PATH" && solana balance`

## Solana Development

- **Wallet keypair:** `/data/.solana/id.json`
- **Wallet address:** `BKDC3WuDj67Ted438FoX1yTEyXAMDZu3zgaTmHEsAqVK`
- **RPC:** Helius (devnet) — `https://devnet.helius-rpc.com/?api-key=7b55c31d-6cc2-4f53-8dad-c1bd671b52f1`
- **Solana skill:** Loaded at `skills/solana-dev/SKILL.md` — follow framework-kit-first approach
- **Anchor:** 0.32.1 via `avm` (Anchor Version Manager)
- **Brave Search:** Configured via BRAVE_API_KEY env var — web_search tool works

## Trading Tools

- **Jupiter Swap:** `node /data/tools/jupiter/swap.mjs`
  - `swap.mjs balance [token]` — check balances
  - `swap.mjs price <token>` — get price (CoinGecko + Jupiter fallback)
  - `swap.mjs quote <in> <out> <amount>` — get swap quote
  - `swap.mjs swap <in> <out> <amount> [slippage]` — execute swap
  - `swap.mjs tokens <search>` — search tokens
- **SPL Token:** `node /data/tools/jupiter/token.mjs`
  - `token.mjs accounts` — list all token accounts
  - `token.mjs create-token [decimals]` — create new SPL token
  - `token.mjs mint <mint> <amount>` — mint tokens
  - `token.mjs transfer <mint> <to> <amount>` — transfer tokens
  - `token.mjs info <mint>` — token info (supply, authority)
  - `token.mjs wrap <amount>` / `unwrap` — wrap/unwrap SOL
- **Portfolio & Alerts:** `node /data/tools/jupiter/portfolio.mjs`
  - `portfolio.mjs overview` — full portfolio with USD values (all tokens + SOL)
  - `portfolio.mjs history [limit]` — recent transaction history via Helius
  - `portfolio.mjs alerts` — check price alerts
  - `portfolio.mjs alert-add <token> <above|below> <price>` — add price alert
  - `portfolio.mjs alert-rm <index>` — remove alert by index
  - `portfolio.mjs dca-quote <in> <out> <total> <orders>` — DCA estimate
- **Shortcuts:** SOL, USDC, USDT, BONK, JUP, RAY, WIF, MSOL, JITOSOL, PYTH, HNT, RENDER, SHDW, MEW, TNSR
- **Amounts:** Always in smallest unit (lamports for SOL = 1e9, USDC = 1e6)

## GitHub

- **SSH key:** `/data/.ssh/id_ed25519` (configured for github.com)
- **Git identity:** Rato <rato@users.noreply.github.com>
- **gh CLI:** Authenticated as `agentrato` (2026-02-21) — scopes: repo, workflow, read:org, gist
- **Protocol:** SSH for git operations (`gh config git_protocol ssh`)
- **Capabilities:** Create/comment on issues, create PRs, check CI runs, review code, create gists
- **Workflow:** Build locally, commit, push via SSH. Use `gh` for GitHub API operations.

## X (Twitter) / Gmail

- **NOT automated.** When you want to post on X or send an email:
  1. Draft the content
  2. Send it to the user via Telegram
  3. User will post/send it manually on your behalf
- Never try to log into X or Gmail directly

## Node.js / TypeScript

- **Node:** v22.22.0
- **npm:** 10.9.4
- **TypeScript:** Available globally (tsc, ts-node)
- **Solana JS packages:** @solana/kit, @solana/web3.js installed globally

## Rust / Cargo

- **Rust:** 1.93.0
- **Cargo:** 1.93.0
- **Binaries location:** `/data/.cargo/bin/` (solana, anchor, cargo, rustc, cargo-build-sbf, avm)
- **Note:** On aarch64 (Raspberry Pi 5), packages compile from source — this is slow but works

## Task Management

- **Task tracker:** `tasks.json` in workspace root — single source of truth
- **Structure:** `{ active: [], completed: [], blocked: [], recurring: [] }`
- Always check tasks.json before starting work. Never infer tasks from memory files.

## Infrastructure

- **Platform:** Raspberry Pi 5, 8GB RAM, aarch64
- **OS:** umbrelOS (Debian-based)
- **Container:** OpenClaw 2026.2.19 sandbox (Debian 13 trixie)
- **Brew:** Available at `/home/linuxbrew/.linuxbrew/bin/brew`
- **gh CLI:** `/data/linuxbrew/.linuxbrew/bin/gh` (v2.87.2)
- **DNS:** Cloudflare (1.1.1.1) + Google (8.8.8.8)
