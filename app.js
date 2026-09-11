// ============================================
// 🎵 VIBEFY — Songs Library
// ============================================
const songs = [
  {
    title: "Chilling Caves",
    artist: "RibhavAgrawal",
    genre: "Lo-Fi Beats",
    year: "2024",
    src: "assets/songs/chilling-caves.mp3",
    cover: "assets/covers/coverpage1.jpg",
    color: "#4A7C8C",
    lyrics: `Echoes deep within the stone
Dripping water, all alone
Shadows dance on ancient walls
Silence answers when night calls

Beneath the earth the world slows down
No city lights, no city sounds
Just the breathing of the cave
Cold and quiet, dark and brave`
  },
  {
    title: "Early Morning",
    artist: "FASSounds",
    genre: "Lo-Fi Hip Hop",
    year: "2024",
    src: "assets/songs/early-morning.mp3",
    cover: "assets/covers/coverpage2.jpg",
    color: "#C4852A",
    lyrics: `Golden light through curtain lace
Slow and soft, a gentle pace
Coffee warm and steam that curls
The quiet before the world unfurls

Birds begin their morning song
The day is new, the night is gone
Breathe it in — this stillness rare
Dawn is painting gold the air`
  },
  {
    title: "Good Night",
    artist: "FASSounds",
    genre: "Lo-Fi",
    year: "2024",
    src: "assets/songs/good-night.mp3",
    cover: "assets/covers/coverpage3.jpg",
    color: "#2A4A7C",
    lyrics: `City lights below my window
Blinking soft like fallen stars
The world outside has hushed to whispers
Headlights tracing roads like scars

Pull the blanket, close the laptop
Let the playlist fade to low
Somewhere between awake and dreaming
Is the place I want to go`
  },
  {
    title: "Dreamy Lofi Nostalgic",
    artist: "Aventure",
    genre: "Lo-Fi Hip Hop",
    year: "2024",
    src: "assets/songs/dreamy-lofi-nostalgic-background.mp3",
    cover: "assets/covers/coverpage4.jpg",
    color: "#C06080",
    lyrics: `Cherry blossoms in the wind
Pages turning, where to begin
A photograph from years before
Someone's face I'm looking for

Nostalgia like a warm perfume
Drifts across a sunlit room
Time moves soft when music plays
Dreaming through the hazy days`
  },
];

// ============================================
// STATE
// ============================================
let currentIndex   = 0;
let isPlaying      = false;
let isShuffle      = false;
let isRepeat       = false;
let isLiked        = false;
let isCrossfade    = false;
let recentlyPlayed = [];
let likedSongs     = new Set();
let showingFavs    = false;
let sleepSeconds   = 0;
let sleepInterval  = null;
let contextTarget  = null;
let audioCtx       = null;
let analyser       = null;
let source         = null;
let lyricsOpen     = false;
const isMobile     = () => window.innerWidth <= 900;

// ============================================
// DOM REFS
// ============================================
const audio              = document.getElementById("audio");
const audioNext          = document.getElementById("audioNext");
const playBtn            = document.getElementById("playBtn");
const playIcon           = document.getElementById("playIcon");
const prevBtn            = document.getElementById("prevBtn");
const nextBtn            = document.getElementById("nextBtn");
const shuffleBtn         = document.getElementById("shuffleBtn");
const repeatBtn          = document.getElementById("repeatBtn");
const likeBtn            = document.getElementById("likeBtn");
const progressBar        = document.getElementById("progressBar");
const volumeBar          = document.getElementById("volumeBar");
const currentTimeEl      = document.getElementById("currentTime");
const durationEl         = document.getElementById("duration");
const playlistEl         = document.getElementById("playlist");
const appEl              = document.getElementById("app");
const searchInput        = document.getElementById("searchInput");
const noResults          = document.getElementById("noResults");
const themeBtn           = document.getElementById("themeBtn");
const dynamicBg          = document.getElementById("dynamicBg");
const coverShadow        = document.getElementById("coverShadow");
const recentlyList       = document.getElementById("recentlyList");
const recentlyWrap       = document.getElementById("recentlyWrap");
const sleepDisplay       = document.getElementById("sleepDisplay");
const tabAll             = document.getElementById("tabAll");
const tabFavs            = document.getElementById("tabFavs");
const contextMenu        = document.getElementById("contextMenu");
const crossfadeBtn       = document.getElementById("crossfadeBtn");
const canvas             = document.getElementById("waveformCanvas");
const ctx2d              = canvas.getContext("2d");
// Lyrics panel (shared desktop + mobile)
const lyricsPanel        = document.getElementById("lyricsPanel");
const lyricsPanelClose   = document.getElementById("lyricsPanelClose");
const lyricsPanelOverlay = document.getElementById("lyricsPanelOverlay");
const lyricsPanelText    = document.getElementById("lyricsPanelText");
const lyricsCover        = document.getElementById("lyricsCover");
const lyricsPanelTitle   = document.getElementById("lyricsPanelTitle");
const lyricsPanelArtist  = document.getElementById("lyricsPanelArtist");
// Two buttons — one in controls row (mobile), one in player-right (desktop)
const lyricsBtn          = document.getElementById("lyricsBtn");
const lyricsBtnDesktop   = document.getElementById("lyricsBtnDesktop");

// ============================================
// 1. DARK / LIGHT MODE
// ============================================
let isDark = localStorage.getItem("vibefy-theme") === "dark";

const moonSVG = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`;
const sunSVG  = `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`;

function applyTheme() {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  const icon = document.getElementById("themeIcon");
  if (icon) icon.innerHTML = isDark ? sunSVG : moonSVG;
  localStorage.setItem("vibefy-theme", isDark ? "dark" : "light");
}

themeBtn.addEventListener("click", () => { isDark = !isDark; applyTheme(); });
applyTheme();

// ============================================
// 2. VOLUME (desktop only)
// ============================================
const savedVolume = localStorage.getItem("vibefy-volume");
if (savedVolume !== null) {
  audio.volume    = savedVolume / 100;
  volumeBar.value = savedVolume;
} else {
  audio.volume    = 0.8;
  volumeBar.value = 80;
}

volumeBar.addEventListener("input", () => {
  audio.volume = volumeBar.value / 100;
  localStorage.setItem("vibefy-volume", volumeBar.value);
  const volSVG = document.getElementById("volSVG");
  if (volSVG) {
    volSVG.innerHTML = parseInt(volumeBar.value) === 0
      ? `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><line x1="2" y1="2" x2="22" y2="22" stroke-width="2"/>`
      : `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`;
  }
});

// ============================================
// 3. MOBILE FADE BETWEEN SONGS
// ============================================
function mobileFadeToNext(nextIndex) {
  const startVol = audio.volume;
  const steps    = 20;
  const stepTime = 800 / steps;
  let step = 0;
  const fadeOut = setInterval(() => {
    step++;
    audio.volume = Math.max(0, startVol * (1 - step / steps));
    if (step >= steps) {
      clearInterval(fadeOut);
      loadSong(nextIndex, true);
      let inStep = 0;
      const fadeIn = setInterval(() => {
        inStep++;
        audio.volume = Math.min(startVol, startVol * (inStep / steps));
        if (inStep >= steps) clearInterval(fadeIn);
      }, stepTime);
    }
  }, stepTime);
}

// ============================================
// 4. DYNAMIC BACKGROUND
// ============================================
function updateDynamicBg(color) {
  if (dynamicBg) {
    dynamicBg.style.background = `
      radial-gradient(ellipse at 60% 40%, ${color}22 0%, transparent 65%),
      radial-gradient(ellipse at 20% 80%, ${color}15 0%, transparent 50%)`;
    dynamicBg.classList.add("active");
  }
  if (coverShadow) coverShadow.style.background = color;
}

// ============================================
// 5. WAVEFORM VISUALIZER
// ============================================
function initAudioContext() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  } catch (e) {}
}

function drawWaveform() {
  requestAnimationFrame(drawWaveform);
  const W = canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
  const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  ctx2d.clearRect(0, 0, W, H);
  if (!analyser) { drawIdleWaveform(W, H); return; }
  const buf = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(buf);
  const bw    = (W / buf.length) * 1.8;
  const color = songs[currentIndex]?.color || "#C0152A";
  let x = 0;
  for (let i = 0; i < buf.length; i++) {
    const bh    = (buf[i] / 255) * H * 0.85;
    const alpha = 0.4 + (buf[i] / 255) * 0.6;
    ctx2d.fillStyle = hexToRgba(color, alpha);
    ctx2d.beginPath();
    ctx2d.roundRect(x, H - bh, bw - 2, bh, bw / 2);
    ctx2d.fill();
    x += bw;
  }
}

function drawIdleWaveform(W, H) {
  const color = songs[currentIndex]?.color || "#C0152A";
  const bars  = 32;
  const bw    = W / bars;
  for (let i = 0; i < bars; i++) {
    const h = (Math.sin(i * 0.4 + Date.now() * 0.001) * 0.3 + 0.35) * H * 0.5;
    ctx2d.fillStyle = hexToRgba(color, 0.25);
    ctx2d.beginPath();
    ctx2d.roundRect(i * bw, H - h, bw - 3, h, (bw - 3) / 2);
    ctx2d.fill();
  }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

drawWaveform();

// ============================================
// 6. LYRICS PANEL (works on BOTH desktop + mobile)
// ============================================
function updateLyricsPanelContent(song) {
  if (lyricsPanelText)   lyricsPanelText.textContent   = song.lyrics || "No lyrics available.";
  if (lyricsCover)       lyricsCover.src               = song.cover;
  if (lyricsPanelTitle)  lyricsPanelTitle.textContent  = song.title;
  if (lyricsPanelArtist) lyricsPanelArtist.textContent = song.artist;
}

function openLyrics() {
  if (!lyricsPanel) return;
  updateLyricsPanelContent(songs[currentIndex]);
  lyricsPanel.style.display = "flex";
  lyricsPanelOverlay.style.display = "block";
  requestAnimationFrame(() => {
    lyricsPanel.classList.add("open");
    lyricsPanelOverlay.classList.add("active");
  });
  lyricsOpen = true;
  // Mark both buttons active
  if (lyricsBtn)        lyricsBtn.classList.add("active-ctrl");
  if (lyricsBtnDesktop) lyricsBtnDesktop.classList.add("active-ctrl");
}

function closeLyrics() {
  if (!lyricsPanel) return;
  lyricsPanel.classList.remove("open");
  lyricsPanelOverlay.classList.remove("active");
  lyricsOpen = false;
  if (lyricsBtn)        lyricsBtn.classList.remove("active-ctrl");
  if (lyricsBtnDesktop) lyricsBtnDesktop.classList.remove("active-ctrl");
  setTimeout(() => {
    lyricsPanel.style.display        = "none";
    lyricsPanelOverlay.style.display = "none";
  }, 400);
}

function toggleLyrics() {
  lyricsOpen ? closeLyrics() : openLyrics();
}

// Wire up both buttons to the same toggle
if (lyricsBtn)        lyricsBtn.addEventListener("click", toggleLyrics);
if (lyricsBtnDesktop) lyricsBtnDesktop.addEventListener("click", toggleLyrics);
if (lyricsPanelClose)   lyricsPanelClose.addEventListener("click", closeLyrics);
if (lyricsPanelOverlay) lyricsPanelOverlay.addEventListener("click", closeLyrics);

// ============================================
// 7. CROSSFADE (desktop)
// ============================================
crossfadeBtn.addEventListener("click", () => {
  isCrossfade = !isCrossfade;
  crossfadeBtn.classList.toggle("active-ctrl", isCrossfade);
});

function crossfadeTo(index) {
  const song = songs[index];
  audioNext.src    = song.src;
  audioNext.volume = 0;
  audioNext.play().catch(() => {});
  let vol = 0;
  const interval = setInterval(() => {
    vol = Math.min(1, vol + 0.05);
    audioNext.volume = vol * (volumeBar.value / 100);
    audio.volume     = Math.max(0, audio.volume - 0.05);
    if (vol >= 1) {
      clearInterval(interval);
      audio.pause();
      audio.src    = song.src;
      audio.volume = volumeBar.value / 100;
      audioNext.pause();
      audioNext.src = "";
      audio.play().catch(() => {});
      loadSong(index, false);
    }
  }, 80);
}

// ============================================
// 8. BUILD PLAYLIST
// ============================================
function buildPlaylist(filter = "") {
  playlistEl.innerHTML = "";
  const pool     = showingFavs ? songs.filter((_, i) => likedSongs.has(i)) : songs;
  const filtered = pool.filter(s =>
    s.title.toLowerCase().includes(filter.toLowerCase()) ||
    s.artist.toLowerCase().includes(filter.toLowerCase())
  );
  if (filtered.length === 0) { noResults.style.display = "block"; return; }
  noResults.style.display = "none";

  filtered.forEach((song) => {
    const ri = songs.indexOf(song);
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="playing-bars"><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>
      <span class="song-num">${ri + 1}</span>
      <img class="song-thumb" src="${song.cover}" alt="" />
      <div class="song-info-mini">
        <div class="song-title-mini">${song.title}</div>
        <div class="song-artist-mini">${song.artist}</div>
      </div>
      <span class="song-duration" id="dur-${ri}">—</span>
    `;
    if (ri === currentIndex) {
      li.classList.add("active");
      if (isPlaying) li.classList.add("is-playing");
    }
    li.addEventListener("click", () => { loadSong(ri, true); if (isMobile()) closeSidebar(); });
    li.addEventListener("contextmenu", (e) => showContextMenu(e, ri));
    playlistEl.appendChild(li);
  });

  loadDurations(filtered);
}

// ============================================
// 9. SONG DURATIONS
// ============================================
const durationCache = {};

function loadDurations(list) {
  list.forEach((song) => {
    const ri = songs.indexOf(song);
    const el = document.getElementById(`dur-${ri}`);
    if (!el) return;
    if (durationCache[ri]) { el.textContent = durationCache[ri]; return; }
    const t = new Audio();
    t.src = song.src;
    t.addEventListener("loadedmetadata", () => {
      durationCache[ri] = formatTime(t.duration);
      const e2 = document.getElementById(`dur-${ri}`);
      if (e2) e2.textContent = durationCache[ri];
    });
  });
}

// ============================================
// 10. SEARCH
// ============================================
searchInput.addEventListener("input", () => buildPlaylist(searchInput.value));

// ============================================
// 11. TABS
// ============================================
tabAll.addEventListener("click", () => {
  showingFavs = false;
  tabAll.classList.add("active"); tabFavs.classList.remove("active");
  document.getElementById("playlistLabel").textContent = "Songs";
  buildPlaylist(searchInput.value);
});

tabFavs.addEventListener("click", () => {
  showingFavs = true;
  tabFavs.classList.add("active"); tabAll.classList.remove("active");
  document.getElementById("playlistLabel").textContent = "Favourites";
  buildPlaylist(searchInput.value);
});

// ============================================
// 12. RECENTLY PLAYED
// ============================================
function updateRecentlyPlayed(index) {
  recentlyPlayed = recentlyPlayed.filter(i => i !== index);
  recentlyPlayed.unshift(index);
  if (recentlyPlayed.length > 4) recentlyPlayed = recentlyPlayed.slice(0, 4);
  recentlyList.innerHTML = "";
  if (!recentlyPlayed.length) { recentlyWrap.style.display = "none"; return; }
  recentlyWrap.style.display = "block";
  recentlyPlayed.forEach(i => {
    const li = document.createElement("li");
    li.innerHTML = `<img src="${songs[i].cover}" alt="" /><span>${songs[i].title}</span>`;
    li.addEventListener("click", () => loadSong(i, true));
    recentlyList.appendChild(li);
  });
}

// ============================================
// 13. SLEEP TIMER
// ============================================
const timerBtn    = document.getElementById("timerBtn");
const timerModal  = document.getElementById("timerModal");
const closeTimer  = document.getElementById("closeTimer");
const cancelTimer = document.getElementById("cancelTimer");
const timerOpts   = document.querySelectorAll(".timer-opt[data-mins]");

timerBtn.addEventListener("click", () => timerModal.classList.add("open"));
closeTimer.addEventListener("click", () => timerModal.classList.remove("open"));
timerModal.addEventListener("click", e => { if (e.target === timerModal) timerModal.classList.remove("open"); });

timerOpts.forEach(btn => {
  btn.addEventListener("click", () => {
    startSleepTimer(parseInt(btn.dataset.mins));
    timerOpts.forEach(b => b.classList.remove("active-timer"));
    btn.classList.add("active-timer");
    cancelTimer.style.display = "block";
    timerModal.classList.remove("open");
  });
});

cancelTimer.addEventListener("click", () => { clearSleepTimer(); timerModal.classList.remove("open"); });

function startSleepTimer(mins) {
  clearSleepTimer();
  sleepSeconds = mins * 60;
  sleepDisplay.style.display = "inline";
  updateSleepDisplay();
  sleepInterval = setInterval(() => {
    sleepSeconds--;
    updateSleepDisplay();
    if (sleepSeconds <= 0) { clearSleepTimer(); pause(); }
  }, 1000);
}

function clearSleepTimer() {
  clearInterval(sleepInterval); sleepSeconds = 0;
  sleepDisplay.style.display = "none";
  timerOpts.forEach(b => b.classList.remove("active-timer"));
  cancelTimer.style.display = "none";
}

function updateSleepDisplay() {
  const m = Math.floor(sleepSeconds / 60);
  const s = sleepSeconds % 60;
  sleepDisplay.textContent = `${m}:${s.toString().padStart(2, "0")}`;
}

// ============================================
// 14. SHORTCUTS MODAL
// ============================================
const shortcutsBtn   = document.getElementById("shortcutsBtn");
const shortcutsModal = document.getElementById("shortcutsModal");
const closeShortcuts = document.getElementById("closeShortcuts");

shortcutsBtn.addEventListener("click", () => shortcutsModal.classList.add("open"));
closeShortcuts.addEventListener("click", () => shortcutsModal.classList.remove("open"));
shortcutsModal.addEventListener("click", e => { if (e.target === shortcutsModal) shortcutsModal.classList.remove("open"); });

// ============================================
// 15. RIGHT-CLICK CONTEXT MENU
// ============================================
function showContextMenu(e, index) {
  e.preventDefault();
  contextTarget = index;
  document.getElementById("ctxLike").textContent = likedSongs.has(index) ? "♥ Unlike" : "♥ Like";
  contextMenu.style.display = "block";
  contextMenu.style.left    = `${Math.min(e.clientX, window.innerWidth - 200)}px`;
  contextMenu.style.top     = `${Math.min(e.clientY, window.innerHeight - 160)}px`;
}

document.addEventListener("click", () => { contextMenu.style.display = "none"; });

document.getElementById("ctxPlay").addEventListener("click", () => {
  if (contextTarget !== null) loadSong(contextTarget, true);
});

document.getElementById("ctxLike").addEventListener("click", () => {
  if (contextTarget === null) return;
  if (likedSongs.has(contextTarget)) likedSongs.delete(contextTarget);
  else likedSongs.add(contextTarget);
  if (contextTarget === currentIndex) {
    isLiked = likedSongs.has(contextTarget);
    likeBtn.classList.toggle("liked", isLiked);
  }
  if (showingFavs) buildPlaylist(searchInput.value);
});

document.getElementById("ctxNext").addEventListener("click", () => {
  if (contextTarget !== null) loadSong(contextTarget, isPlaying);
});

document.getElementById("ctxInfo").addEventListener("click", () => {
  if (contextTarget === null) return;
  const song = songs[contextTarget];
  document.getElementById("infoBody").innerHTML = `
    <div class="info-row"><span class="info-key">Title</span><span class="info-val">${song.title}</span></div>
    <div class="info-row"><span class="info-key">Artist</span><span class="info-val">${song.artist}</span></div>
    <div class="info-row"><span class="info-key">Genre</span><span class="info-val">${song.genre}</span></div>
    <div class="info-row"><span class="info-key">Year</span><span class="info-val">${song.year}</span></div>
    <div class="info-row"><span class="info-key">Duration</span><span class="info-val">${durationCache[contextTarget] || "—"}</span></div>
  `;
  document.getElementById("infoModal").classList.add("open");
});

document.getElementById("closeInfo").addEventListener("click", () => {
  document.getElementById("infoModal").classList.remove("open");
});

// ============================================
// 16. MOBILE SIDEBAR
// ============================================
const hamburgerBtn   = document.getElementById("hamburgerBtn");
const sidebarEl      = document.querySelector(".sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function openSidebar()  { sidebarEl.classList.add("mobile-open");    sidebarOverlay.classList.add("active"); }
function closeSidebar() { sidebarEl.classList.remove("mobile-open"); sidebarOverlay.classList.remove("active"); }

if (hamburgerBtn) {
  hamburgerBtn.addEventListener("click", openSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);
}

// ============================================
// LOAD SONG
// ============================================
function loadSong(index, autoplay = false) {
  currentIndex = index;
  const song   = songs[index];

  audio.src = song.src;
  document.getElementById("track-name").textContent  = song.title;
  document.getElementById("artist-name").textContent = song.artist;
  document.getElementById("genre-tag").textContent   = song.genre  || "Music";
  document.getElementById("year-tag").textContent    = song.year   || "2024";
  document.getElementById("cover").src               = song.cover;
  document.getElementById("bar-title").textContent   = song.title;
  document.getElementById("bar-artist").textContent  = song.artist;
  document.getElementById("bar-cover").src           = song.cover;

  updateDynamicBg(song.color || "#C0152A");

  // Update lyrics panel content live if open
  if (lyricsOpen) updateLyricsPanelContent(song);

  document.title = `♫ ${song.title} — Vibefy`;

  isLiked = likedSongs.has(index);
  likeBtn.classList.toggle("liked", isLiked);

  progressBar.value         = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent    = "0:00";

  // Restore volume (mobile fade may have changed it)
  const sv = localStorage.getItem("vibefy-volume");
  audio.volume = sv !== null ? sv / 100 : 0.8;

  document.querySelectorAll("#playlist li").forEach(li => {
    li.classList.remove("active", "is-playing");
    const num = li.querySelector(".song-num");
    if (num && parseInt(num.textContent) - 1 === index) {
      li.classList.add("active");
      li.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  updateRecentlyPlayed(index);
  if (autoplay) play();
}

// ============================================
// PLAY / PAUSE
// ============================================
function play() {
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  initAudioContext();
  audio.play().catch(() => {});
  isPlaying = true;
  playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  appEl.classList.add("is-playing-global");
  document.title = `▶ ${songs[currentIndex].title} — Vibefy`;
  document.querySelectorAll("#playlist li").forEach(li => {
    const num = li.querySelector(".song-num");
    if (num && parseInt(num.textContent) - 1 === currentIndex) li.classList.add("is-playing");
  });
}

function pause() {
  audio.pause(); isPlaying = false;
  playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  appEl.classList.remove("is-playing-global");
  document.title = `♫ ${songs[currentIndex].title} — Vibefy`;
  document.querySelectorAll("#playlist li").forEach(li => li.classList.remove("is-playing"));
}

playBtn.addEventListener("click", () => isPlaying ? pause() : play());

// ============================================
// PREV / NEXT
// ============================================
prevBtn.addEventListener("click", () => {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  const prev = (currentIndex - 1 + songs.length) % songs.length;
  if (isMobile() && isPlaying) mobileFadeToNext(prev);
  else loadSong(prev, isPlaying);
});

nextBtn.addEventListener("click", () => {
  const next = getNextIndex();
  if (isMobile() && isPlaying) mobileFadeToNext(next);
  else if (isCrossfade && isPlaying) crossfadeTo(next);
  else loadSong(next, isPlaying);
});

function getNextIndex() {
  if (isShuffle) {
    let r;
    do { r = Math.floor(Math.random() * songs.length); } while (r === currentIndex && songs.length > 1);
    return r;
  }
  return (currentIndex + 1) % songs.length;
}

// ============================================
// PROGRESS
// ============================================
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressBar.value         = pct;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent    = formatTime(audio.duration);
  if (!isMobile() && isCrossfade && audio.duration - audio.currentTime < 4 && !audioNext.src) {
    crossfadeTo(getNextIndex());
  }
});

progressBar.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (progressBar.value / 100) * audio.duration;
});

audio.addEventListener("ended", () => {
  if (isRepeat) { audio.currentTime = 0; play(); }
  else {
    const next = getNextIndex();
    if (isMobile()) mobileFadeToNext(next);
    else loadSong(next, true);
  }
});

// ============================================
// SHUFFLE / REPEAT / LIKE
// ============================================
shuffleBtn.addEventListener("click", () => { isShuffle = !isShuffle; shuffleBtn.classList.toggle("active-ctrl", isShuffle); });
repeatBtn.addEventListener("click",  () => { isRepeat  = !isRepeat;  repeatBtn.classList.toggle("active-ctrl",  isRepeat); });

likeBtn.addEventListener("click", () => {
  isLiked = !isLiked;
  likeBtn.classList.toggle("liked", isLiked);
  if (isLiked) likedSongs.add(currentIndex);
  else likedSongs.delete(currentIndex);
  if (showingFavs) buildPlaylist(searchInput.value);
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT") return;
  if (e.code === "Space")      { e.preventDefault(); isPlaying ? pause() : play(); }
  if (e.code === "ArrowRight") nextBtn.click();
  if (e.code === "ArrowLeft")  prevBtn.click();
  if (e.code === "KeyS")       shuffleBtn.click();
  if (e.code === "KeyR")       repeatBtn.click();
  if (e.code === "KeyD")       themeBtn.click();
  if (e.code === "KeyL")       toggleLyrics();
  if (e.code === "KeyM") {
    volumeBar.value = volumeBar.value > 0 ? 0 : 80;
    volumeBar.dispatchEvent(new Event("input"));
  }
  if (e.key === "?") shortcutsModal.classList.toggle("open");
});

// ============================================
// HELPERS
// ============================================
function formatTime(secs) {
  if (isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ============================================
// INIT
// ============================================
recentlyWrap.style.display = "none";
buildPlaylist();
loadSong(0);
