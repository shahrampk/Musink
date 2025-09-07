// ------------------------- //
// SELECTING ELEMENTS
// ------------------------- //
const themeToggle = document.getElementById("themeToggle");
const toggleSlider = document.getElementById("toggleSlider");
const head = document.documentElement;

// LocalStorage se theme check karo
let darkMode = localStorage.getItem("theme") === "dark";

// Load pe apply karo
if (darkMode) {
  head.classList.add("dark");
  toggleSlider.classList.add("-translate-x-9");
} else {
  head.classList.remove("dark");
  toggleSlider.classList.remove("-translate-x-9");
}

// Toggle button
themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;

  if (darkMode) {
    head.classList.add("dark");
    toggleSlider.classList.add("-translate-x-9");
    localStorage.setItem("theme", "dark");
  } else {
    head.classList.remove("dark");
    toggleSlider.classList.remove("-translate-x-9");
    localStorage.setItem("theme", "light");
  }
});
