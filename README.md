# DISCORD // TAG SELECTION BALLOT (WEB APPLICATION)

A high-end, obsidian-styled web voting application built specifically for communities voting on what **Discord Server Tag / Clan Tag / Role Tag** to adopt.

Designed under strict aesthetics: **Zero Emoji, Zero AI boilerplate, Zero clutter**.

---

## CORE SYSTEM CAPABILITIES

- **Live Discord Interface Mockup**: Interactive preview showcasing exactly how any selected candidate tag looks inside the Discord chat UI (supports `[ CLAN TAG ]`, `[ ROLE BADGE ]`, and `[ FORUM TAG ]` modes).
- **Interactive Ballot Ledger**: Real-time vote tallying, dynamic progress percentage bars, and responsive toggle voting (`[ VOTE ]` / `[ VOTED ]`).
- **Quota & Anti-Spam Guards**: Enforces a per-user voting quota (default 3 selections) with LocalStorage persistence.
- **Candidate Submission Engine**: Members can directly propose new server tags with validation (character limits, duplicate checks, uppercase normalization).
- **Instant Result Export**: Formats the active leaderboard into clean plaintext/Markdown ready to paste into Discord announcement channels.

---

## PROJECT STRUCTURE

```text
discord-tag-poll-web/
├── index.html        # Semantic HTML5 layout with Discord UI previewer
├── style.css         # Dark brutalist typography, responsive grid, zero emoji
├── app.js            # Reactive state management, voting logic, local persistence
├── package.json      # Optional lightweight runner
└── README.md         # Documentation
```

---

## HOW TO RUN

### Option A: Direct Open (Zero Install)
Simply double-click `index.html` in Windows Explorer or open it with any web browser.

### Option B: Local Static Server
If you prefer running a local server:
```bash
cd C:\Users\ciciq\.gemini\antigravity\scratch\discord-tag-poll-web
npx serve .
```
Then navigate to `http://localhost:3000`.
