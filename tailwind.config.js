/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      screens: {
        sx: "440px",
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
        showMsg: "showmsg 2s ease-in-out forwards",
      },
      keyframes: {
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        showmsg: {
          "0%": {
            opacity: "0",
            transform: 'translateX("10px")',
          },

          "20%": {
            opacity: "1",
            transform: 'translateX("0px")',
          },
          "80%": {
            opacity: "0",
            transform: 'translateX("10px")',
          },
          "100%": {
            opacity: "0",
            visibility: "hidden",
          },
        },
      },
      width: { slider: "500px" },
      fontSize: {
        none: "0px",
      },
      boxShadow: {
        aside: "3px 4px 20px 8px rgba(0, 0, 0, 0.4)",
      },
      translate: {
        "aside-closed": "-105%",
        "aside-open": "105%",
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
