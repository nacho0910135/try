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
        ink: "#102132",
        sand: "#f6f0e7",
        mist: "#eef3f6",
        terracotta: "#b65f3a",
        lagoon: "#1d5f74",
        pine: "#295c4f"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(16, 33, 50, 0.08)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(182,95,58,0.18), transparent 28%), radial-gradient(circle at top right, rgba(29,95,116,0.16), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.94), rgba(246,240,231,0.82))"
      }
    }
  },
  plugins: []
};
