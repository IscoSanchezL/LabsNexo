import type { Config } from 'tailwindcss';
export default { content: ['./index.html','./src/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#101310', paper:'#f1f0e9', line:'#353a34', accent:'var(--accent)' }, fontFamily: { display:['Space Grotesk','sans-serif'], body:['Inter','sans-serif'] } } }, plugins: [] } satisfies Config;
