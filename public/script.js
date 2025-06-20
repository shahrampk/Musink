console.log("hello");

const musicList = document.querySelector("#song-playlist"); // Make sure you don't use ".music-list" if it doesn't exist

const songs = {
  song1: {
    name: "Allah ho Allah ho",
    artist: "Shahram",
    duration: "3:45",
  },
  song2: {
    name: "Dil Dil Pakistan",
    artist: "Vital Signs",
    duration: "4:20",
  },
  song3: {
    name: "Afreen Afreen",
    artist: "Nusrat Fateh Ali Khan",
    duration: "5:10",
  },
  song4: {
    name: "Tajdar-e-Haram",
    artist: "Atif Aslam",
    duration: "6:00",
  },
};

const creatPlayCard = function ({ name, artist }) {
  const li = document.createElement("li");

  li.innerHTML = `
    <div class="flex items-center justify-between bg-gray-800 p-3 rounded-lg gap-2 hover:bg-gray-700 transition-colors">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        class="w-6 h-6 flex-shrink-0 fill-white"
      >
        <path
          d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7l0 72 0 264c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6L448 147 192 223.8 192 432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6L128 200l0-72c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z"
        />
      </svg>
      <div class="flex-1 min-w-0">
        <p class="text-sm text-white truncate">${name}</p>
        <p class="text-xs text-gray-400 truncate">${artist}</p>
      </div>
      <button
        aria-label="Play track"
        class="text-white text-sm hover:text-gray-300"
      >
        <i class="fa-solid fa-play"></i>
      </button>
    </div>`;

  musicList.appendChild(li);
};

for (const song in songs) {
  creatPlayCard(songs[song]);
}
