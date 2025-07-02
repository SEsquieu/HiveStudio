# Hive Studio

**Hive Studio** is the visual task builder for **HiveOS**, a modular autonomy orchestration platform for real-world agents.

This tool lets you:
- Build YAML task files visually with a node-based editor
- Export tasks directly to HiveOS
- Simulate logic flows, conditionals, and branching
- Define agent capabilities, TTLs, and task structure with no coding required

---

## 🧪 Tinker-Friendly Preview (Limited)

A soft preview is live! This is a working testbed for HiveOS runtime orchestration with session-based isolation. The core is running on my laptop, in my kitchen, so play nice!

⚠️ **Note:**  
Sessions automatically expire **after 1 hour** of uptime. If your session becomes stale, you may need to refresh and create a new one to resume testing.

---

## Live Demo

Try the web version at:  
[Studio App!](https://studio.hiveos.net)

---

## Run Locally

```bash
git clone https://github.com/SEsquieu/HiveStudio.git
cd HiveStudio
npm install
npm run dev
```

Then open: [localhost:5173](http://localhost:5173)

---

## Features

- Visual chunk editor with capability mapping
- Manual `depends_on` edge linking
- TTL + conditional logic support
- One-click chunk duplication
- YAML import/export for HiveOS-ready tasks

---
## Coming Soon 🚧

The following features are actively being developed and will be rolled out soon:

- **Local session export/import**: Save and reload your entire HiveOS session with agents, tasks, and zones.
- **Per-session history tracking**: Session logs and past task snapshots for persistent user experience.
- **Session continuity tools**: Seamless reconnection and continuation between runtime sessions.

---

## About HiveOS

HiveOS is a hardware-agnostic orchestration layer for autonomous systems. It breaks down complex behavior into composable, task-driven units and coordinates them across agents. 

Stay tuned for more!

[YouTube devlog series for HiveOS](https://www.youtube.com/playlist?list=PLJ9R5SOmEcaOtygdKkpfzxPtk8gYig0Hl)

---

## Contact

Built by [Seth Esquieu](https://github.com/SEsquieu)  
Got feedback? Drop an issue or email: `sesquieu@gmail.com`
