/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      screens: {
        "3xl": "1920px",
      },
      backgroundColor: {
        backGround: "rgba(255,255,255,0.1)",
        header: "#121212",
      },
      fontFamily: {
        poppins: '"poppins", "sans-serif"',
      },
      animation: {
        rotate: "rotate 1.5s infinite linear ",
      },
      keyframes: {
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      width: { slider: "500px" },
      fontSize: {
        none: "0px",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".scrollbar-hide::-webkit-scrollbar": {
          display: "none",
        },
      });
    },
  ],
};
