/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"]
      },
      colors: {
        ink: "#0f1f31",
        sand: "#f7f0e7",
        mist: "#edf4f7",
        terracotta: "#b86443",
        lagoon: "#1d667b",
        pine: "#2f6452"
      },
      boxShadow: {
        soft: "0 22px 58px rgba(15, 31, 49, 0.12)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 0% 0%, rgba(184,100,67,0.22), transparent 28%), radial-gradient(circle at 100% 0%, rgba(29,102,123,0.22), transparent 32%), radial-gradient(circle at 50% 100%, rgba(47,100,82,0.12), transparent 26%), linear-gradient(135deg, rgba(255,255,255,0.97), rgba(250,243,234,0.9) 52%, rgba(236,244,247,0.88))"
      }
    }
  },
  plugins: []
};
