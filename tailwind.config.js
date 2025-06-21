/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.html"],
  theme: {
    extend: {
      backgroundColor: {
        backGround: "#161719",
        header: "#121212",
      },
      fontFamily: {
        poppins: ["Roboto", "sans-serif"],
      },

      minWidth: {
        1170: "73vw",
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
    },
  },
  plugins: [],
};
