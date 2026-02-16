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

## GitHub

- **SSH key:** `/data/.ssh/id_ed25519` (configured for github.com)
- **Git identity:** Rato <rato@umbrel>
- **Workflow:** Build locally, commit, push. Always use SSH for GitHub.

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

## Infrastructure

- **Platform:** Raspberry Pi 5, 8GB RAM, aarch64
- **OS:** umbrelOS (Debian-based)
- **Container:** OpenClaw sandbox (Debian 13 trixie)
- **Brew:** Available at `/home/linuxbrew/.linuxbrew/bin/brew`
- **DNS:** Cloudflare (1.1.1.1) + Google (8.8.8.8)
