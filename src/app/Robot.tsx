import { pick } from '../i18n';
export const avatarNames = pick(['Chispa', 'Brújula', 'Luna', 'Rayo', 'Pixel', 'Nube', 'Órbita', 'Byte'], ['Spark', 'Compass', 'Luna', 'Bolt', 'Pixel', 'Cloud', 'Orbit', 'Byte']);
const HUES = [38, 200, 280, 50, 160, 215, 330, 120];

/** Avatares robot: cada uno con silueta y color propios. */
export function Robot({ variant = 0, mood = 'idle', size }: { variant?: number; mood?: 'idle' | 'happy' | 'think'; size?: number }) {
  const h = HUES[variant % 8];
  const shell = `hsl(${h} 70% 62%)`, shell2 = `hsl(${h} 70% 44%)`, glow = `hsl(${h} 95% 78%)`;
  const id = `rb${variant}`;
  const head = [
    <rect key="0" x="26" y="24" width="68" height="50" rx="18" />,
    <rect key="1" x="24" y="28" width="72" height="44" rx="8" />,
    <ellipse key="2" cx="60" cy="50" rx="38" ry="27" />,
    <path key="3" d="M36 26h48q12 0 12 12v22q0 12-12 12H36q-12 0-12-12V38q0-12 12-12Z" />,
    <rect key="4" x="30" y="24" width="60" height="52" rx="24" />,
    <path key="5" d="m38 25h44l14 15v20L82 75H38L24 60V40z" />,
    <ellipse key="6" cx="60" cy="50" rx="40" ry="25" />,
    <path key="7" d="M38 25h46q11 0 11 12v25q0 11-11 11H38q-11 0-11-11V37q0-12 11-12Z" />,
  ][variant % 8];
  const eyeR = variant === 2 ? 5 : 4;
  return (
    <svg className="robot" viewBox="0 0 120 126" width={size} height={size} role="img" aria-label={`Robot ${avatarNames[variant % 8]}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={shell} /><stop offset="1" stopColor={shell2} /></linearGradient>
      </defs>
      <g stroke={glow} strokeWidth="3" strokeLinecap="round" fill="none"><path d="M60 24V10" /><path d="M30 83 19 96m71-13 11 13M46 114v7m28-7v7" /></g>
      <circle cx="60" cy="8" r="4.5" fill={glow} />
      <rect x="35" y="80" width="50" height="34" rx="10" fill={`url(#${id})`} />
      <circle cx="60" cy="97" r="4" fill="#0b1230" opacity=".8" /><circle cx="60" cy="97" r="2" fill={glow} />
      <g fill={`url(#${id})`}>{head}</g>
      <rect x="35" y="39" width="50" height="24" rx="12" fill="#0b1230" opacity=".88" />
      <g className="robot-eyes" fill={glow}>
        <circle cx="48" cy="51" r={eyeR} /><circle cx="72" cy="51" r={eyeR} />
      </g>
      <path d={mood === 'think' ? 'M52 61h16' : 'M51 59q9 7 18 0'} stroke={glow} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
