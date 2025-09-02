const musicList = document.querySelector("#song-playlist");
const playIconPlaybar = document.querySelector("#play-icon-playbar");
const pauseIconPlaybar = document.querySelector("#pause-icon-playbar");
const playPauseBtn = document.querySelector(".play-pause-btn");
const prevBtn = document.querySelector('[aria-label="Previous track"]');
const nextBtn = document.querySelector('[aria-label="Next track"]');
const progressBar = document.querySelector("#progress-bar");
const volume = document.querySelector("#volumn_control");
const durationEl = document.querySelector("#duration");
const currentPlayedSong = document.querySelector("#current-playedSong p");

const addBtn = document.getElementById("add-playlist");
const albumInput = document.getElementById("albumInput");
const albumEl = document.getElementById("album");
albumEl.innerHTML = "";

///////////////////////////////////////
// HELPER FUNCTIONS...
///////////////////////////////////////

const resetBtn = function (musicList) {
  musicList.querySelectorAll(".play-btn").forEach((other) => {
    other.querySelector(".play-icon").classList.remove("hidden");
    other.querySelector(".pause-icon").classList.add("hidden");
  });
};

// Toggle play / pause per song
const togglePlayPause = function (songId, playIcon, pauseIcon) {
  if (audioPlayer.dataset.currentId === songId && !audioPlayer.paused) {
    audioPlayer.pause();
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");
    playIconPlaybar.classList.remove("hidden");
    pauseIconPlaybar.classList.add("hidden");
  } else {
    playSongFromDB(songId, "play");
    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");
    playIconPlaybar.classList.add("hidden");
    pauseIconPlaybar.classList.remove("hidden");
  }
};

// Save to localStorage
const setLocalStorage = function (itemName, item) {
  localStorage.setItem(itemName, JSON.stringify(item));
};

// Load from localStorage
const getLocalStorage = function (itemName) {
  return JSON.parse(localStorage.getItem(itemName)) || [];
};

let album = getLocalStorage("album");
setLocalStorage("album", album);

// Global audio player
const audioPlayer = new Audio();
let currentPlaylist = []; // store current playlist songs
let currentIndex = -1; // track which song is playing

// ------------------------- //
// IndexedDB setup
// ------------------------- //
let db;
const openRequest = indexedDB.open("music-app", 1);

openRequest.onsuccess = () => {
  db = openRequest.result;
  console.log("IndexedDB connected ✅");
};

openRequest.onerror = (e) => {
  console.error("Error opening IndexedDB ❌", e.target.error);
};

openRequest.onupgradeneeded = () => {
  db = openRequest.result;
  if (!db.objectStoreNames.contains("songs")) {
    let objectStore = db.createObjectStore("songs", { keyPath: "id" });
    objectStore.createIndex("playlistId", "playlistId", { unique: false });
  }
};

// ------------------------- //
// Save playlist + songs
// ------------------------- //
albumInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);

  // unique playlist id
  const id = Date.now().toString();

  // LocalStorage ke liye playlist metadata
  const newPlayList = files.map((file, i) => ({
    name: file.name,
    type: file.type,
    size: file.size,
    id: `${id}-${i}`,
  }));
  newPlayList.push(id);

  // save playlist in localStorage
  album.push(newPlayList);
  setLocalStorage("album", album);
  renderAlbum(album);

  // save songs in IndexedDB
  if (db) {
    const transaction = db.transaction("songs", "readwrite");
    const objectStore = transaction.objectStore("songs");

    files.forEach((file, i) => {
      const songData = {
        id: id + "-" + i,
        playlistId: id,
        name: file.name,
        type: file.type,
        size: file.size,
        file: file, // actual File object
      };

      const request = objectStore.put(songData);
      request.onsuccess = () => {
        console.log("Song saved to IndexedDB:", songData.name);
      };
      request.onerror = (e) => {
        console.error("Error saving song ❌", e.target.error);
      };
    });
  }

  // reset input
  albumInput.value = "";
});

// ------------------------- //
// Play Song From IndexedDB
// ------------------------- //
const playSongFromDB = function (songId, action) {
  if (!db) return;
  const transaction = db.transaction("songs", "readonly");
  const objectStore = transaction.objectStore("songs");
  const request = objectStore.get(songId);

  request.onsuccess = (e) => {
    const song = e.target.result;
    if (song && song.file) {
      // agar new song play ho raha hai to src set karo
      if (audioPlayer.dataset.currentId !== songId) {
        const url = URL.createObjectURL(song.file);
        audioPlayer.src = url;
        audioPlayer.dataset.currentId = songId; // track current song
        currentIndex = currentPlaylist.findIndex((s) => s.id === songId);
      }

      if (action === "play") {
        audioPlayer.play();
      }
    }
  };

  request.onerror = (e) => {
    console.error("Error fetching song ❌", e.target.error);
  };
};

// ------------------------- //
// Render songs with play/pause
// ------------------------- //
function renderSongs(songs) {
  musicList.innerHTML = "";
  currentPlaylist = songs.filter((s) => typeof s === "object");

  currentPlaylist.forEach((song) => {
    const songName =
      song.name.slice(-4) === ".mp3" ? song.name.slice(0, -4) : song.name;
    const card = `
      <div id ="${song.id}" 
        class="song-card flex items-center justify-between cursor-pointer bg-gray-800 p-3 rounded-lg gap-4 hover:bg-backGround transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" 
          class="flex-shrink-0" height="30" fill="white">
          <path d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7l0 72 0 264c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6L448 147 192 223.8 192 432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6L128 200l0-72c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z" />
        </svg>
        <div class="flex-1">
          <p class="song-name text-white text-sm line-clamp-2">${songName}</p>
        </div>
      </div>`;
    musicList.insertAdjacentHTML("beforeend", card);
  });

  // Attach click listener on song-card
  musicList.querySelectorAll(".song-card").forEach((card) => {
    card.addEventListener("click", () => {
      const songId = card.id;
      const songName = card.querySelector(".song-name").textContent;

      if (audioPlayer.dataset.currentId === songId && !audioPlayer.paused) {
        // Agar wahi song play ho raha hai to pause karo
        audioPlayer.pause();
        playIconPlaybar.classList.remove("hidden");
        pauseIconPlaybar.classList.add("hidden");
      } else {
        // Naya song ya resume play
        playSongFromDB(songId, "play");
        playIconPlaybar.classList.add("hidden");
        pauseIconPlaybar.classList.remove("hidden");
      }

      currentPlayedSong.textContent = songName;
    });
  });
}

// ------------------------- //
// Render one Playlist
// ------------------------- //
function renderAlbum(album) {
  if (album.length < 0) return;
  albumEl.innerHTML = "";
  album.forEach((playlist, i) => {
    const card = `
       <div class="play-card rounded-md h-fit hover:bg-backGround p-1 transition-all duration-200" id ='${
         playlist[playlist.length - 1]
       }'>
          <div>
            <img src="./playlist-image.jpg" alt="Playlist cover"
              class="w-full object-cover rounded-md" />
          </div>
          <div class="p-3">
            <p class="text-sm playlist-description line-clamp-2">Playlist ${
              i + 1
            }</p>
          </div>
        </div>`;
    albumEl.insertAdjacentHTML("beforeend", card);
  });
}

// ------------------------- //
// Open file dialog on click
// ------------------------- //
addBtn.addEventListener("click", () => {
  albumInput.click();
});

// ------------------------- //
// Load albums on page refresh
// ------------------------- //
document.addEventListener("DOMContentLoaded", () => {
  renderAlbum(album);
});

// ------------------------- //
// creating the song list...
// ------------------------- //
const createSongList = function () {
  albumEl.addEventListener("click", function (e) {
    const playCard = e.target.closest(".play-card");
    if (!playCard) return;
    album.forEach((playlist) => {
      if (playlist[playlist.length - 1] === playCard.id) {
        renderSongs(playlist);
      }
    });
  });
};
createSongList();

///////////////////////////////////////
// PLAYBAR CONTROLS
///////////////////////////////////////

// Common play/pause toggle function
function togglePlayPauseBar() {
  if (audioPlayer.src) {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playIconPlaybar.classList.add("hidden");
      pauseIconPlaybar.classList.remove("hidden");
    } else {
      audioPlayer.pause();
      playIconPlaybar.classList.remove("hidden");
      pauseIconPlaybar.classList.add("hidden");
    }
    return;
  }
  alert("Audio is not select! Please select...");
}

// Button click se
playPauseBtn.addEventListener("click", togglePlayPauseBar);

// Keyboard se (Space ya Enter)
document.addEventListener("keydown", (e) => {
  // prevent scrolling on space
  if (e.code === "Space" || e.code === "Enter") {
    e.preventDefault();
    togglePlayPauseBar();
  }
});

// Previous button
prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    playSongFromDB(currentPlaylist[currentIndex].id, "play");
    currentPlayedSong.textContent = currentPlaylist[currentIndex].name;
    resetBtn(musicList);
  }
});

// Next button
nextBtn.addEventListener("click", () => {
  if (currentIndex < currentPlaylist.length - 1) {
    currentIndex++;
    playSongFromDB(currentPlaylist[currentIndex].id, "play");
    currentPlayedSong.textContent = currentPlaylist[currentIndex].name;
    resetBtn(musicList);
  }
});

// Progress bar update
audioPlayer.addEventListener("timeupdate", () => {
  if (!audioPlayer.duration) return;
  progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  const cur = formatTime(audioPlayer.currentTime);
  const dur = formatTime(audioPlayer.duration);
  durationEl.textContent = `${cur} / ${dur}`;
});

// Seek on progress bar input
progressBar.addEventListener("input", () => {
  if (audioPlayer.duration) {
    audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
    console.log((audioPlayer.volume = Math.random()));
  }
});

// Volumn progress
volume.addEventListener("input", () => {
  console.log(volume.value / 100);
  console.log(audioPlayer.volume);
  audioPlayer.volume = volume.value / 100;
});

// Helper: format seconds → mm:ss
function formatTime(sec) {
  const m = Math.floor(sec / 60) || 0;
  const s = Math.floor(sec % 60) || 0;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
