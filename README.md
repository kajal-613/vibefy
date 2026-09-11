# 🎵 Vibefy

A sleek, feature-rich music player web app built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies. Designed to feel like a mini Spotify, with a focus on smooth UI, thoughtful details, and clean code.

 **[Screenshots](#screenshots)**

---

## ✨ Features

- **Full playback controls** — play/pause, next/previous, shuffle, and repeat
- **Seek bar & volume control** with persistent volume across sessions
- **Live audio waveform visualizer** rendered from the actual track via the Web Audio API
- **Dynamic background color** that adapts to each track's cover art
- **Crossfade & fade transitions** between tracks for a smoother listening experience
- **Search** across song titles and artists
- **Favourites** tab to save and quickly access liked tracks
- **Recently Played** history
- **Lyrics panel** for the currently playing track
- **Sleep timer** to auto-pause playback after a set duration
- **Dark / light theme toggle** with saved preference
- **Keyboard shortcuts** for hands-free control (see below)
- **Fully responsive** — collapsible sidebar and mobile-optimized layout with fade transitions

## ⌨️ Keyboard Shortcuts

| Key           | Action           |
|---------------|------------------|
| `Space`       | Play / Pause     |
| `→`           | Next track       |
| `←`           | Previous track   |
| `S`           | Toggle shuffle   |
| `R`           | Toggle repeat    |

## 🛠️ Tech Stack

- **HTML5** — semantic structure and audio elements
- **CSS3** — custom properties (CSS variables) for theming, flexbox/grid layout, responsive design
- **JavaScript (ES6+)** — DOM manipulation, Web Audio API for waveform visualization, localStorage for persistence
- No external JS frameworks or build tools — 100% vanilla, deployable as a static site

## 📁 Project Structure

```
vibefy/
├── index.html          # App markup
├── style.css            # All styling, themes, and responsive rules
├── app.js                # Player logic, UI interactions, audio handling
└── assets/
    ├── songs/            # MP3 audio files
    └── covers/           # Album/track cover art
```

## Screenshots

<img width="1439" height="814" alt="image" src="https://github.com/user-attachments/assets/90298050-0b1e-4508-91e5-f02994b15e19" />
<img width="1438" height="814" alt="image" src="https://github.com/user-attachments/assets/79ca378f-10f8-4891-917d-505fb9eae5af" />


## 🎧 Credits

Sample tracks used for demo purposes:
- "Chilling Caves" — RibhavAgrawal
- "Early Morning" & "Good Night" — FASSounds
- "Dreamy Lofi Nostalgic" — Aventure

## 📌 Notes

This project was built to practice and showcase front-end fundamentals: responsive layout, DOM manipulation, browser APIs (Web Audio, localStorage), and building a polished UI without relying on a framework.


