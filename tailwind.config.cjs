module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        'premium': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
};
