const mobileMusicList = document.querySelector("#mobile-song-playlist");
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
const volumeBtnContainer = document.querySelector(".volumn__control_btn");
const addBtn = document.getElementById("add-playlist");
const albumInput = document.getElementById("albumInput");
const albumEl = document.getElementById("album");
const aside = document.querySelector("#desktop-aside");
const mobileAside = document.querySelector("#mobile-aside");
const hamBurger = document.querySelector("#hamburger-menu");
const xMark = document.querySelector(".X-mark");
const mainApp = document.querySelector("#main-app");
console.log(aside);

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

// toggleClasses...
const toggleClasses = (el, add = [], remove = []) => {
  if (!el) return;
  console.log(add, el);
  if (add.length) el.classList.add(...add);

  if (remove.length) el.classList.remove(...remove);
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
// Render songs
// ------------------------- //
function renderSongs(songs) {
  musicList.innerHTML = "";
  mobileMusicList.innerHTML = "";

  currentPlaylist = songs.filter((s) => typeof s === "object");

  currentPlaylist.forEach((song) => {
    const songName =
      song.name.slice(-4) === ".mp3" ? song.name.slice(0, -4) : song.name;
    const card = `
      <div id ="${song.id}" 
        class="song-card flex items-center justify-between cursor-pointer bg-gray-800 p-3 rounded-lg gap-4 hover:bg-backGround transition-all mb-2">
        <div class="w-30">
          🎵
        </div>
        <div class="flex-1">
          <p class="song-name text-white text-sm line-clamp-2">${
            songName[0].toUpperCase() + songName.slice(1)
          }</p>
        </div>
      </div>`;

    if (window.innerWidth >= 990) {
      musicList.insertAdjacentHTML("beforeend", card);
    } else {
      mobileMusicList.insertAdjacentHTML("beforeend", card);
      mobileAside.classList.remove("translate-x-aside-closed");
      mobileAside.classList.add("shadow-aside");
    }
  });

  // Ab dono lists ke liye listener lagao
  [
    ...musicList.querySelectorAll(".song-card"),
    ...mobileMusicList.querySelectorAll(".song-card"),
  ].forEach((card) => {
    card.addEventListener("click", () => {
      const songId = card.id;
      const songName = card.querySelector(".song-name").textContent;

      if (audioPlayer.dataset.currentId === songId && !audioPlayer.paused) {
        audioPlayer.pause();
        playIconPlaybar.classList.remove("hidden");
        pauseIconPlaybar.classList.add("hidden");
      } else {
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
       
<div class="relative play-card rounded-md h-fit cursor-pointer bg-backGround p-1 transition-all duration-200 group" id='${
      playlist[playlist.length - 1]
    }'>
  <div></div>

  <div class="sm:block hidden">
    <img src="/public/assets/playlist-image.jpg" alt="Playlist cover" class="w-full object-cover rounded-md" />
  </div>

  <div class="p-3 flex justify-between items-center">
    <p class="text-sm playlist-description line-clamp-2">Playlist ${i + 1}</p>
    
    <!-- delete-btn: hidden by default, visible on card hover -->
    <div class="delete-btn w-fit md:absolute top-4 right-4 transition-all duration-500 bg-red-800 p-1 pl-0 rounded flex justify-center items-center cursor-pointer opacity-0 group-hover:opacity-100 group/delete">
      
      <!-- delete text: hidden by default, visible on icon hover -->
      <p class=" opacity-0 transition-all duration-200 group-hover/delete:opacity-100 group-hover/delete:text-sm text-none ml-1">
        Delete
      </p>
      
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="20">
        <path fill-rule="evenodd"
          d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
          clip-rule="evenodd" />
      </svg>
    </div>
  </div>
</div>


`;
    albumEl.insertAdjacentHTML("beforeend", card);
  });
}

// ------------------------- //
// creating the song list...
// ------------------------- //
const createSongList = function () {
  albumEl.addEventListener("click", function (e) {
    const playCard = e.target.closest(".play-card");
    if (!playCard) return;
    album.forEach((playlist) => {
      if (
        playlist[playlist.length - 1] === playCard.id &&
        !e.target.closest(".delete-btn")
      ) {
        renderSongs(playlist);
      }
    });
  });
};
createSongList();

albumEl.addEventListener("click", function (e) {
  const target = e.target.closest(".play-card");
  if (!target) return;
  console.log(target);

  if (aside.classList.contains("hidden")) {
    // aside.classList.remove("hidden");
    // aside.classList.add("");
    toggleClasses(aside, "w-1/3", "w-0");
  }
  // if (!aside.classList.contains("hidden")) aside.classList.add("hidden");
});

// ------------------------- //
// Hamburger Menu //
// ------------------------- //
document.addEventListener("keydown", function (e) {
  if (
    e.key === "Escape" &&
    !mobileAside.classList.contains("translate-x-aside-closed")
  )
    mobileAside.classList.add("translate-x-aside-closed");
  mobileAside.classList.remove("shadow-aside");
});
xMark.addEventListener("click", function (e) {
  if (!mobileAside.classList.contains("translate-x-aside-closed"))
    mobileAside.classList.add("translate-x-aside-closed");
  mobileAside.classList.remove("shadow-aside");
});
hamBurger.addEventListener("click", () => {
  // Agar aside already hidden hai to open karo
  if (mobileAside.classList.contains("translate-x-aside-closed")) {
    mobileAside.classList.remove("translate-x-aside-closed");
    mobileAside.classList.add("shadow-aside");
  }
});
// END...

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

///////////////////////////////////////
// PLAYBAR CONTROLS
///////////////////////////////////////
// Helper: format seconds → mm:ss
function formatTime(sec) {
  const m = Math.floor(sec / 60) || 0;
  const s = Math.floor(sec % 60) || 0;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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
    console.log(currentPlaylist);

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
  }
});
const volumeBtns = function (btn) {
  if (btn === "mute")
    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        height= '30'
        >
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
        </svg>`;

  if (btn === "low")
    return `<svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          height="30"
          fill="currentColor"
        >
          <path d="M144 416L192 416L326.1 535.2C332.5 540.9 340.7 544 349.2 544C368.4 544 384 528.4 384 509.2L384 130.8C384 111.6 368.4 96 349.2 96C340.7 96 332.5 99.1 326.1 104.8L192 224L144 224C117.5 224 96 245.5 96 272L96 368C96 394.5 117.5 416 144 416zM476.6 245.5C466.3 237.1 451.2 238.7 442.8 249C434.4 259.3 436 274.4 446.3 282.8C457.1 291.6 464 305 464 320C464 335 457.1 348.4 446.3 357.3C436 365.7 434.5 380.8 442.8 391.1C451.1 401.4 466.3 402.9 476.6 394.6C498.1 376.9 512 350.1 512 320C512 289.9 498.1 263.1 476.5 245.5z" />
        </svg>`;

  if (btn === "medium")
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height= '30'>
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
          <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
        </svg>`;
  if (btn === "full")
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"  height= '30' fill="currentColor">
          <path d="M533.6 96.5C523.3 88.1 508.2 89.7 499.8 100C491.4 110.3 493 125.4 503.3 133.8C557.5 177.8 592 244.8 592 320C592 395.2 557.5 462.2 503.3 506.3C493 514.7 491.5 529.8 499.8 540.1C508.1 550.4 523.3 551.9 533.6 543.6C598.5 490.7 640 410.2 640 320C640 229.8 598.5 149.2 533.6 96.5zM473.1 171C462.8 162.6 447.7 164.2 439.3 174.5C430.9 184.8 432.5 199.9 442.8 208.3C475.3 234.7 496 274.9 496 320C496 365.1 475.3 405.3 442.8 431.8C432.5 440.2 431 455.3 439.3 465.6C447.6 475.9 462.8 477.4 473.1 469.1C516.3 433.9 544 380.2 544 320.1C544 260 516.3 206.3 473.1 171.1zM412.6 245.5C402.3 237.1 387.2 238.7 378.8 249C370.4 259.3 372 274.4 382.3 282.8C393.1 291.6 400 305 400 320C400 335 393.1 348.4 382.3 357.3C372 365.7 370.5 380.8 378.8 391.1C387.1 401.4 402.3 402.9 412.6 394.6C434.1 376.9 448 350.1 448 320C448 289.9 434.1 263.1 412.6 245.5zM80 416L128 416L262.1 535.2C268.5 540.9 276.7 544 285.2 544C304.4 544 320 528.4 320 509.2L320 130.8C320 111.6 304.4 96 285.2 96C276.7 96 268.5 99.1 262.1 104.8L128 224L80 224C53.5 224 32 245.5 32 272L32 368C32 394.5 53.5 416 80 416z"/>
        </svg>
        `;
};

// Volume progress
volume.addEventListener("input", () => {
  audioPlayer.volume = volume.value / 100;
  if (audioPlayer.volume === 0)
    volumeBtnContainer.innerHTML = volumeBtns("mute");

  if (audioPlayer.volume > 0 && audioPlayer.volume < 0.5)
    volumeBtnContainer.innerHTML = volumeBtns("low");

  if (audioPlayer.volume > 0.5 && audioPlayer.volume < 1)
    volumeBtnContainer.innerHTML = volumeBtns("medium");

  if (audioPlayer.volume === 1)
    volumeBtnContainer.innerHTML = volumeBtns("full");
});
// Deleting a Playlist...
albumEl.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".delete-btn");
  if (!deleteBtn) return;

  const id = deleteBtn.closest(".play-card").id; // playlistId
  console.log("Deleting playlist:", id);

  // 1) LocalStorage se delete
  const index = album.findIndex(
    (playlist) => playlist[playlist.length - 1] === id
  );
  if (index > -1) {
    album.splice(index, 1);
    setLocalStorage("album", album);
    renderAlbum(album);
  }

  // 2) IndexedDB se delete
  if (db) {
    const transaction = db.transaction("songs", "readwrite");
    const objectStore = transaction.objectStore("songs");
    const indexStore = objectStore.index("playlistId");
    const request = indexStore.openCursor(IDBKeyRange.only(id));

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        objectStore.delete(cursor.primaryKey); // ✅ delete song
        console.log("Deleted song from DB:", cursor.value.name);
        cursor.continue();
      }
    };

    request.onerror = (e) => {
      console.error("Error deleting songs ❌", e.target.error);
    };
  }
});
