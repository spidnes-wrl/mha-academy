import type { Config } from 'tailwindcss';
const config: Config = {
 content:['./src/pages/**/*.{js,ts,jsx,tsx,mdx}','./src/components/**/*.{js,ts,jsx,tsx,mdx}','./src/app/**/*.{js,ts,jsx,tsx,mdx}'],
 theme:{extend:{colors:{primaryDark:'#050505',primaryGreen:'#f4b879',primaryLight:'#ffd09d',accentApricot:'#f4b879',primaryBlue:'#438bff',warningRed:'#ef5555',notificationGray:'#8b9099',neutralBg:'#050505',neutralCard:'#101010',neutralBorder:'#292929'},boxShadow:{glow:'0 10px 28px rgba(244,184,121,.16)'},backgroundImage:{hero:'radial-gradient(circle at top left, rgba(67,139,255,.13), transparent 55%), radial-gradient(circle at bottom right, rgba(244,184,121,.10), transparent 48%)'}}},
 plugins:[]
};
export default config;
