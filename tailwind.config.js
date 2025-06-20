/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.html"],
  theme: {
    // screens: {
    //   sm: { min: "0", max: "639px" },
    //   md: { min: "640px", max: "850px" },
    //   lg: { min: "850px", max: "1024px" },
    //   xl: { min: "1024px", max: "1280px" },
    //   "2xl": { min: "1280px", max: "1536px" },
    // },
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
    },
  },
  plugins: [],
};
