import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primaryDark: '#102d1f',
        primaryGreen: '#2d8a5b',
        primaryLight: '#53a97d',
        accentApricot: '#f4ad5a',
        neutralBg: '#0f1720',
        neutralCard: '#16212d',
        neutralBorder: '#253241',
      },
      boxShadow: {
        glow: '0 12px 30px rgba(45, 138, 91, 0.35)',
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top, rgba(83,169,125,0.18), transparent 55%)',
      },
    },
  },
  plugins: [],
};

export default config;
