# LUMINARY_TERM :: v2.7.4

> **Retro-futuristic developer terminal & portfolio system**
> No frameworks. No build pipelines. Raw engineering.

---

## 🔴 SYSTEM ARCHITECTURE

```
┌──────────────────────────────────────────────────┐
│                    CLIENT                        │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Terminal UI │  │ Particles│  │ CRT Effects│  │
│  │   Engine    │  │  System  │  │  Overlay   │  │
│  └──────┬──────┘  └──────────┘  └────────────┘  │
│         │ WebSocket / HTTP                       │
├─────────┼────────────────────────────────────────┤
│         ▼               BACKEND                  │
│  ┌─────────────┐  ┌──────────────────────────┐  │
│  │   FastAPI   │  │   Java HttpServer         │  │
│  │  (Python)   │  │   (Virtual Threads)       │  │
│  └─────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

## 🟢 QUICK START

### Frontend Only
```bash
git clone https://github.com/luminary-dev/luminary-term.git
cd luminary-term
python3 -m http.server 8000
# Navigate to http://localhost:8000
```

### Full Stack
```bash
# Terminal 1: Python backend
pip install fastapi uvicorn
python3 server.py

# Terminal 2: Java backend (requires JDK 21+)
javac LuminaryServer.java
java LuminaryServer

# Terminal 3: Static server
python3 -m http.server 8000
```

## 🟡 COMMANDS REFERENCE

| Command | Arguments | Description |
|---------|-----------|-------------|
| `help` | - | Display all commands |
| `about` | - | Terminal information |
| `projects` | - | Featured work showcase |
| `contact` | - | PGP key and contact |
| `matrix` | - | Activate matrix rain |
| `clear` | - | Clear terminal |
| `echo` | `[text]` | Print text |
| `hash` | `[input]` | SHA-256 generation |
| `uuid` | - | Generate UUIDv4 |
| `timestamp` | - | Current UTC time |
| `sysinfo` | - | Server metrics |

## 🔵 TECHNICAL SPECIFICATIONS

### Frontend
- **Zero dependencies** — Pure ES6, CSS3, HTML5
- **Canvas particle system** — 80-particle ambient background
- **CRT scanline overlay** — CSS repeating-linear-gradient
- **Command history** — 50-entry circular buffer
- **Responsive** — Breakpoints at 768px
- **Accessible** — ARIA labels, semantic HTML, keyboard navigation

### Backend (Python)
- **FastAPI** async WebSocket server
- **Session management** — token-based, auto-expiry
- **CORS enabled** — configurable origins
- **JSON protocol** — typed request/response cycle

### Backend (Java)
- **Virtual threads** — Java 21+ `Executors.newVirtualThreadPerTaskExecutor()`
- **Sealed class responses** — `SuccessResponse` | `ErrorResponse`
- **SHA-256 hashing** — `java.security.MessageDigest`
- **Concurrent sessions** — `ConcurrentHashMap` with atomic updates

### TypeScript Types
- Full type coverage for all interfaces
- Strict mode compatible
- Exported for external consumption

## 🟣 CREDITS & INSPIRATION

- **Typography**: IBM Plex Mono — SIL Open Font License
- **Design language**: Bloomberg Terminal, Alien (1979), r/unixporn
- **ASCII art**: Generated with `figlet` and manual kerning
- **Architecture pattern**: CQRS-lite command dispatch

## ⚫ LICENSE

MIT — Do what you want. Ship it. Break it. Fix it.

---

*Built with caffeine and phosphor glow.*
