import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primaryDark: '#000000',
        primaryBlue: '#2563EB',
        primaryPressed: '#1D4ED8',
        primaryLight: '#BFD2FF',
        accentApricot: '#2563EB',
        primaryGreen: '#2563EB',
        neutralBg: '#000000',
        neutralCard: '#0A0D14',
        neutralBorder: '#1B2437',
        mutedText: '#9AA7C2',
      },
      boxShadow: {
        glow: '0 12px 34px rgba(37, 99, 235, 0.18)',
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at 80% 0%, rgba(37,99,235,.20), transparent 52%)',
      },
    },
  },
  plugins: [],
};
export default config;
