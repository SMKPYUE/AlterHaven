# AlterHaven — Plural & DID System Management Hub

> **A private, local-first workspace designed for Dissociative Identity Disorder (DID), OSDD, and Plural Systems to collaborate, switch, organize, and thrive. This was made to assist my partner in day to day life others useing it is a bonus**

---

## Core Philosophy: 100% Local-First & Private
- **Zero Third-Party Cloud Tracking:** All alter profiles, private journals, logs, and communication stay safely inside your device's `localStorage` and offline database.
- **Zero App Store Fees:** Built as a standalone installable Progressive Web App (PWA) for Android, iPhone, iPad, Windows, macOS, and Linux.
- **Direct P2P Device Sync:** Transfer your system data between phone and computer over your local network using QR codes without uploading to any remote server.

---

## Features

### 1. Alter & System Member Directory
- Comprehensive alter profiles: name, pronouns, roles, signature color, avatars, and age appearance.
- **Positive Sensory Anchors & Distress Triggers:** Log co-regulation items (scents, weighted blankets, grounding playlists) and triggers to avoid.
- **Private Vaults:** 4-digit PIN lock for private alter journals and boards.

### 2. Interactive Corkboards & Spatial Pinboards
- Multi-board management with customizable themes (**Cork Texture**, **Slate Grid**, **Whiteboard**).
- Pin **Sticky Notes**, **Checklists**, **Urgent Ribbons**, and **Voice Memos**.
- Full touch pinch-to-zoom and auto-arrangement grid tidy tools.

### 3. Front Tracker & Switch Handoff Briefings
- 1-tap logging for **Primary Front**, **Co-Fronting**, and **Co-Consciousness**.
- Energy & clarity level tracking (1–10 scale).
- **Switch-In Briefing Modal:** Instantly alerts the incoming alter about urgent tasks, pending handoffs, and body vitals upon taking the front.

### 4. Inner Chat & Channels
- Topic channels (`#general`, `#finances`, `#therapy`) and private 1-on-1 direct messages between alters.
- Pin chat messages directly onto the Corkboard with 1 click.
- Full-screen list-and-select flow optimized for mobile devices.

### 5. Body Care, Medications & Sensory Grounding
- **Daily Medication Schedule:** Log prescriptions and vitamins with dosages, times of day, and 1-tap taken toggles.
- **4-4-4-4 Box Breathing Sanctuary:** Visual breathing pulse ring with soothing audio chimes.
- **5-4-3-2-1 Sensory Grounding Countdown:** Grounding countdown for grounding during dissociation or panic.
- **Embedded Audio Playlists:** YouTube and Spotify ambient streams tailored for switches.

### 6. System Codex & Constitution
- Establish agreed-upon house rules, spending limits, masking rules, and little protection protocols.
- Track individual alter acknowledgements and comments.

### 7. Internal Consensus & Polls Engine
- Propose group decisions, weekend activities, or body appearance changes with multi-option voting.
- Built-in **Safety / Protector Veto** with explanation support.

### 8. External Contacts & Masking Matrix
- Track external friends, coworkers, doctors, and family members.
- Define disclosure levels (*Fully Out*, *Partially Out*, *Covert Only*) and alter-specific comfort ratings.

### 9. Clinical & Therapy Session Report Generator
- Generate clinical summaries for therapists and psychiatrists with front switches, body vitals, and therapy notes.
- Export as clean printable **PDF** or formatted **Markdown**.

### 10. Direct Local QR Sync & Offline PWA
- Export encrypted offline `.json` backups.
- Scan QR code on your phone to instantly mirror or restore system data from your PC.

---

## Instant Deployment to GitHub Pages (Free Hosting)

1. Go to your repository **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
3. Push to `main` (or trigger the workflow under the **Actions** tab).
4. Your live app will be accessible at:
   ```
   https://smkpyue.github.io/AlterHaven/
   ```
5. Anyone can open the link in Chrome/Safari and tap **"Install App"** to add it to their home screen as a standalone app.

---

## Local Development Setup

```bash
# Clone the repository
git clone https://github.com/SMKPYUE/AlterHaven.git

# Navigate into project directory
cd AlterHaven

# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## Privacy Notice
AlterHaven is designed for maximum privacy and safety. No personal data, health data, or system logs are ever transmitted to third-party tracking servers.

---

## License
This project is licensed under the **GNU General Public License v3.0 (GPLv3)**. You are free to use, modify, and distribute this software, provided all modifications remain open source under the same license.
