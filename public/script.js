const musicList = document.querySelector("#song-playlist");
// musicList.innerHTML = "";
const playIconPlaybar = document.querySelector("#play-icon-playbar");
const pauseIconPlaybar = document.querySelector("#pause-icon-playbar");
const playPauseBtn = document.querySelectorAll(".play-pause-btn .btn");

///////////////////////////////////////
// HELPER FUNCTIONS...
///////////////////////////////////////

const switchBtn = function (target) {
  target.parentNode
    .querySelector(
      `${
        target.id === "play-icon-playbar"
          ? "#pause-icon-playbar"
          : "#play-icon-playbar"
      }`
    )
    .classList.remove("hidden");
};

//////////////////////////////////////
// MAIN FUNCTIONALLITY
//////////////////////////////////////

async function getSongs() {
  let a = await fetch("http://127.0.0.1:5502/public/assets/songs/");
  let response = await a.text();
  const div = document.createElement("div");
  div.innerHTML = response;
  const as = div.querySelectorAll("a");
  const songs = [];
  as.forEach((a) => {
    if (a.href.endsWith(".mp3")) {
      songs.push(a);
    }
  });
  return songs;
}

async function main() {
  const songs = await getSongs();
  const audio = new Audio();
  audio.src = songs[0].href;
  playPauseBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = e.currentTarget;
      target.classList.add("hidden");
      switchBtn(target);
      if (btn.id === "play-icon-playbar") audio.play();

      if (btn.id === "pause-icon-playbar") audio.pause();
    });
  });
}
main();
/*
musicList.innerHTML = "";
const creatPlayCard = function ({ name, artist }) {
  const li = document.createElement("li");
  li.innerHTML = `
        <div class="song-card flex items-center justify-between cursor-pointer bg-gray-800 p-3 rounded-lg gap-3 hover:bg-gray-700 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            class="flex-shrink-0 "
            height ='30px'
            fill = 'white'
          >
            <path
              d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7l0 72 0 264c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6L448 147 192 223.8 192 432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6L128 200l0-72c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z"
            />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="song-name text-sm text-white truncate">${name}</p>
            <p class="artist-name text-xs text-gray-400 truncate">${artist}</p>
          </div>
          <button
            aria-label="Play track"
            class="text-white text-sm hover:text-gray-300"
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height='25'>
             <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
          </svg>


          </button>
        </div>`;

  musicList.appendChild(li);
};

for (const song in songs) {
  creatPlayCard(songs[song]);
}

const addRemoveClass = function (elName, addClass, removeClass) {
  if (elName.classList.contains(addClass)) {
    elName.classList.add(removeClass);
    elName.classList.remove(addClass);
  } else {
    elName.classList.remove(removeClass);
    elName.classList.add(addClass);
  }
};

const playBtn = document.querySelectorAll(".play-icon");
const playBtnPlaybar = document.querySelector("#play-icon-playbar");

const songCard = document.querySelectorAll(".song-card");
const currentPlayedSong = document.querySelector("#current-playedSong");
songCard.forEach((song) => {
  song.addEventListener("click", () => {
    const songName = song.querySelector(".song-name");
    console.log(currentPlayedSong.textContent);
    currentPlayedSong.textContent = songName.textContent;
    playBtnPlaybar.classList.remove("fa-circle-play");
    playBtnPlaybar.classList.add("fa-circle-pause");
  });
});

// ---------------------------- //

// Adding clciking the play button functionlity...
playBtnPlaybar.addEventListener("click", () => {
  addRemoveClass(playBtnPlaybar, "fa-circle-play", "fa-circle-pause");
});
console.log(playBtnPlaybar);

playBtn.forEach((e) => {
  e.addEventListener("click", () => {
    addRemoveClass(e, "fa-circle-pause", "fa-circle-play");
    if (e.classList.contains("fa-circle-pause")) {
      e.classList.add("animate-rotate");
    } else {
      e.classList.remove("animate-rotate");
    }
  });
});
 */
