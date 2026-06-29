// =============================
// BELÉPÉSI KÓD
// =============================
const ACCESS_CODE = "2004";

const lockScreen = document.getElementById("lockScreen");
const app = document.getElementById("app");
const accessInput = document.getElementById("accessCodeInput");
const accessBtn = document.getElementById("accessCodeBtn");
const accessError = document.getElementById("accessError");

accessBtn.addEventListener("click", () => {
  const value = accessInput.value.trim();
  if (value === ACCESS_CODE) {
    lockScreen.classList.add("hidden");
    app.classList.remove("hidden");
  } else {
    accessError.textContent = "Hibás kód. Próbáld újra!";
  }
});

// =============================
// PLAYER LOGIKA
// =============================

const audioPlayer = document.getElementById("audioPlayer");
const songListEl = document.getElementById("songList");
const playAllBtn = document.getElementById("playAllBtn");
const favoritesBtn = document.getElementById("favoritesBtn");
const playlistBtn = document.getElementById("playlistBtn");

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

let songs = [];
let currentQueue = [];
let currentIndex = 0;

// =============================
// KEDVENCEK MENTÉSE
// =============================
function saveFavorites() {
  const favs = songs
    .filter(s => s.favorite)
    .map(s => s.id);

  localStorage.setItem("favoriteSongs", JSON.stringify(favs));
}

// =============================
// songs.json BETÖLTÉSE
// =============================
fetch("songs.json")
  .then(res => res.json())
  .then(data => {

    const savedFavs = JSON.parse(localStorage.getItem("favoriteSongs")) || [];

    songs = data.map(song => {
      if (savedFavs.includes(song.id)) {
        song.favorite = true;
      }
      return song;
    });

    renderSongs();
  })
  .catch(err => {
    console.error("Hiba a songs.json betöltésekor:", err);
  });

// =============================
// LISTA KIRAJZOLÁSA
// =============================
function renderSongs() {
  songListEl.innerHTML = "";
  songs.forEach(song => {
    const li = document.createElement("li");
    li.className = "song-item";

    const info = document.createElement("div");
    info.className = "song-info";

    const title = document.createElement("span");
    title.className = "song-title";
    title.textContent = song.title;

    const artist = document.createElement("span");
    artist.className = "song-artist";
    artist.textContent = song.artist;

    info.appendChild(title);
    info.appendChild(artist);

    const actions = document.createElement("div");
    actions.className = "song-actions";

    // Kedvenc gomb
    const favBtn = document.createElement("button");
    favBtn.className = "favorite-btn";
    favBtn.innerHTML = song.favorite ? "★" : "☆";
    if (song.favorite) favBtn.classList.add("active");

    favBtn.addEventListener("click", () => {
      song.favorite = !song.favorite;
      favBtn.innerHTML = song.favorite ? "★" : "☆";
      favBtn.classList.toggle("active", song.favorite);
      saveFavorites();
    });

    // Playlist checkbox
    const playlistCheckbox = document.createElement("input");
    playlistCheckbox.type = "checkbox";
    playlistCheckbox.title = "Kijelölés";

    playlistCheckbox.addEventListener("change", () => {
      song.inPlaylist = playlistCheckbox.checked;
    });

    // Play gomb
    const playBtn = document.createElement("button");
    playBtn.className = "play-btn";
    playBtn.textContent = "▶";

    playBtn.addEventListener("click", () => {
      playQueue([song]);
      updatePlayButtons();
      highlightCurrentSong();
    });

    actions.appendChild(favBtn);
    actions.appendChild(playlistCheckbox);
    actions.appendChild(playBtn);

    li.appendChild(info);
    li.appendChild(actions);
    songListEl.appendChild(li);
  });
}

// =============================
// LEJÁTSZÁSI SOR
// =============================
function playQueue(queue) {
  if (!queue || queue.length === 0) return;
  currentQueue = queue;
  currentIndex = 0;
  playCurrent();
}

function playCurrent() {
  const song = currentQueue[currentIndex];
  if (!song) return;

  audioPlayer.src = song.src;

  setTimeout(() => {
    audioPlayer.play().catch(() => {});
  }, 50);

  document.getElementById("nowPlaying").textContent = "🎵 " + song.title;

  updatePlayButtons();
  highlightCurrentSong();
}

// Automatikus következő
audioPlayer.addEventListener("ended", () => {
  nextSong();
});

// =============================
// NEXT / PREV
// =============================
function nextSong() {
  if (currentIndex < currentQueue.length - 1) {
    currentIndex++;
  } else {
    currentIndex = 0;
  }
  playCurrent();
}

function prevSong() {
  if (currentIndex > 0) {
    currentIndex--;
  } else {
    currentIndex = currentQueue.length - 1;
  }
  playCurrent();
}

nextBtn.addEventListener("click", () => {
  nextSong();
});

prevBtn.addEventListener("click", () => {
  prevSong();
});

// =============================
// PLAY GOMBOK FRISSÍTÉSE
// =============================
function updatePlayButtons() {
  const items = document.querySelectorAll(".song-item");
  items.forEach((item, index) => {
    const btn = item.querySelector(".play-btn");
    if (currentQueue[currentIndex] && songs[index].id === currentQueue[currentIndex].id) {
      btn.textContent = "⏸";
    } else {
  btn.textContent = "▶";
}
  });
}

// =============================
// AKTUÁLIS ZENE KIEMELÉSE
// =============================
function highlightCurrentSong() {
  const items = document.querySelectorAll(".song-item");

  items.forEach((item, index) => {
    if (
      currentQueue[currentIndex] &&
      songs[index].id === currentQueue[currentIndex].id
    ) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}