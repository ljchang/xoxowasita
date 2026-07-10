# Wasita's Public Dissertation Defense Commentary — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a QR-joinable, name-only, real-time audience chat (threads, emoji reactions, typing dots) persisted to Firebase RTDB, dark-themed in Wasita's palette, deployed on Firebase Hosting.

**Architecture:** Svelte 5 + Vite SPA; browser talks directly to Firebase Realtime Database (no backend). One `child_added` subscription on `/messages` feeds derived views (top-level list, per-parent threads). Ephemeral state (`/typing`) cleans itself via debounce + `onDisconnect`.

**Tech Stack:** Svelte 5 (runes), Vite, Tailwind CSS v4, firebase JS SDK (modular), Firebase Hosting + RTDB, Vitest (pure logic), Playwright (smoke), python `qrcode`/`segno` for the QR deliverable.

## Global Constraints

- App title everywhere: **"Wasita's Public Dissertation Defense Commentary"**.
- Message shape: `{name: 1–30 chars, text: 1–500 chars, ts: ServerValue.TIMESTAMP, parentId: string|null}` — append-only.
- Palette: bg `#0f0a1a`, surface `#1b1230`, own bubble indigo-500 `#6366f1`, other bubble fuchsia-400 `#e879f9` (text `#3b0764` for contrast on it), accents violet-500 `#8b5cf6` / pink-400 `#f472b6`, gradient violet-500→fuchsia-500. `#f9a8d4` decoration only.
- Typing debounce 500 ms (her shared-reality-chat convention).
- No auth; identity = `{clientId, name}` in localStorage.
- Node project lives at repo root `defense-chat/`.

---

### Task 1: Scaffold + theme + name entry

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/app.css`, `src/App.svelte`, `src/lib/identity.js`, `src/lib/identity.test.js`, `.gitignore`
- Test: `npm test` (Vitest) + `npm run dev` renders name screen

**Interfaces:**
- Produces: `identity.js` → `getIdentity(): {clientId, name|null}`, `saveName(name: string): void` (trims, caps 30 chars, throws on empty); `App.svelte` shows `Join` screen when `name === null`, else `Room` placeholder.

- [ ] Steps: `npm create vite@latest . -- --template svelte`, add Tailwind v4 (`@tailwindcss/vite`), dark palette as CSS `@theme` tokens, write failing identity tests (empty name rejected; roundtrip persists; clientId stable across calls), implement, `npm test` green, name-entry screen with gradient Join button, commit.

### Task 2: Firebase project + database + rules + hosting config

**Files:**
- Create: `firebase.json`, `.firebaserc`, `database.rules.json`, `src/lib/firebase.js`, `.env.local` (SDK config; gitignored), `.env.example`

**Interfaces:**
- Consumes: Firebase MCP tools (`firebase_create_project`, `firebase_create_app`, `firebase_get_sdk_config`, `firebase_init`/CLI).
- Produces: `firebase.js` → exports `db` (RTDB handle). `database.rules.json` enforcing spec shapes (messages create-only with validated name/text/ts/parentId; reactions per-emoji/clientId string ≤ 30; typing open; everything world-readable).

- [ ] Steps: create project `wasita-defense-chat` (or nearest free id), web app, RTDB instance (us-central1), write rules JSON exactly per spec, `firebase.json` hosting → `dist` + database rules, deploy rules, commit (no secrets — SDK config is public-safe but kept in env for tidiness).

### Task 3: Data layer

**Files:**
- Create: `src/lib/chat.js` (Firebase I/O), `src/lib/derive.js` (pure), `src/lib/derive.test.js`

**Interfaces:**
- Produces (chat.js): `sendMessage({name, text, parentId})` → push with optimistic local echo hook; `onMessages(cb)` (child_added stream); `toggleReaction(msgId, emoji, clientId, name)`; `setTyping(scope, {clientId,name}, isTyping)` with `onDisconnect().remove()`; `onTyping(scope, cb)`; `onConnected(cb)`.
- Produces (derive.js, pure & unit-tested): `topLevel(messages)`, `replies(messages, parentId)`, `replyCount(messages)` → Map, `typingLabel(entries, selfClientId)` → `"" | "X is typing" | "X and Y are typing" | "N people are typing"`, `groupReactions(raw, selfClientId)` → `[{emoji, count, mine}]`.

- [ ] Steps: failing Vitest specs for every derive fn (ordering by ts, parent filtering, self-exclusion in typingLabel, mine-flag in reactions), implement, green, implement chat.js against SDK, commit.

### Task 4: Chat room UI

**Files:**
- Create: `src/components/Room.svelte`, `src/components/MessageBubble.svelte`, `src/components/Composer.svelte`, `src/components/TypingDots.svelte`
- Modify: `src/App.svelte`

**Interfaces:**
- Consumes: chat.js + derive.js from Task 3.
- Produces: `MessageBubble` props `{message, reactions, replyCount, mine, onReact, onOpenThread}`; `Composer` props `{scope, onSend}` (handles typing pings + emoji picker); `TypingDots` props `{label}`.

- [ ] Steps: bubble styling per Global Constraints (asymmetric radii tails, name+time meta), composer (Enter to send, 500-char cap, quick emoji row 💜 😂 👏 🔥 😮 + native keyboard), optimistic send (pending opacity until server echo), auto-scroll pinned unless scrolled up → "↓ new messages" pill, typing indicator wired, connection toast via `.info/connected`, commit.

### Task 5: Reactions + threads

**Files:**
- Create: `src/components/ReactionBar.svelte`, `src/components/EmojiPicker.svelte`, `src/components/ThreadPanel.svelte`
- Modify: `Room.svelte`, `MessageBubble.svelte`

**Interfaces:**
- Consumes: `toggleReaction`, `replies`, `replyCount`, Composer with `scope=parentId`.
- Produces: reaction chips under bubbles (tap toggles own), "N replies →" opens `ThreadPanel` (slide-over: parent + replies + scoped composer + scoped typing dots, ✕/swipe-back close).

- [ ] Steps: implement, verify two-browser manual check via `npm run dev`, commit.

### Task 6: Playwright smoke test

**Files:**
- Create: `e2e/smoke.spec.js`, `playwright.config.js`

**Interfaces:**
- Consumes: dev server + live RTDB (isolated by writing under a test-run message prefix is NOT possible with append-only rules → instead assert on own unique message strings).

- [ ] Steps: two browser contexts join with distinct names; A sends unique text; B sees it; B reacts 💜 → A sees chip count 1; B replies in thread → A sees "1 reply"; A focuses composer and types → B sees "A is typing"; run `npx playwright test`, green, commit.

### Task 7: Deploy + QR + README + export

**Files:**
- Create: `qr/defense-chat-qr.png`, `qr/defense-chat-qr.svg`, `README.md`, `scripts/export_chat.sh`

**Interfaces:**
- Produces: live URL `https://<project>.web.app`; QR (violet on near-white, quiet zone, ~2000 px PNG + SVG); `export_chat.sh` = authenticated `curl` of `/.json` REST export documented in README.

- [ ] Steps: `npm run build`, `firebase deploy`, load URL on desktop, verify Playwright against prod URL once, generate QR via `uv run --with segno`, write README (run/deploy/export/plot pointers), commit.

## Self-review

Spec coverage: join flow (T1), persistence+rules (T2/T3), bubbles/typing/responsiveness (T4), reactions+threads (T5), testing (T6), QR/export/deploy (T7). Types consistent across task interfaces. No placeholders — code-level detail lives in interfaces; executor is this session with full spec in context.
