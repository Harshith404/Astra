const fs = require('fs');
const path = require('path');

const dirs = [
  'public/assets/player',
  'public/assets/enemies',
  'public/assets/environment/mars',
  'public/assets/environment/lab',
  'public/assets/environment/buried-signal',
  'public/assets/effects',
  'public/assets/ui'
];

dirs.forEach(d => {
  const p = path.join(process.cwd(), d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

function writeSvg(filepath, content, width, height) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${content}</svg>`;
  fs.writeFileSync(path.join(process.cwd(), filepath), svg);
}

// PLAYER
writeSvg('public/assets/player/player.svg', 
  `<ellipse cx="32" cy="56" rx="24" ry="8" fill="#0f172a" opacity="0.6"/>
   <rect x="16" y="8" width="32" height="40" rx="8" fill="#1e293b" stroke="#475569" stroke-width="4"/>
   <rect x="20" y="16" width="24" height="12" rx="2" fill="#22d3ee"/>
   <rect x="12" y="12" width="8" height="24" rx="4" fill="#0f172a"/>
   <rect x="44" y="12" width="8" height="24" rx="4" fill="#0f172a"/>`, 
  64, 64);

// ENEMIES
writeSvg('public/assets/enemies/scout.svg',
  `<ellipse cx="32" cy="56" rx="20" ry="8" fill="#000" opacity="0.5"/>
   <polygon points="32,8 56,48 8,48" fill="#475569" stroke="#94a3b8" stroke-width="3"/>
   <circle cx="32" cy="32" r="8" fill="#ef4444"/>
   <circle cx="32" cy="32" r="4" fill="#fca5a5"/>`,
  64, 64);

writeSvg('public/assets/enemies/gunner.svg',
  `<ellipse cx="32" cy="56" rx="24" ry="8" fill="#000" opacity="0.5"/>
   <rect x="12" y="12" width="40" height="40" rx="4" fill="#334155" stroke="#cbd5e1" stroke-width="3"/>
   <rect x="44" y="28" width="20" height="8" fill="#64748b"/>
   <rect x="20" y="24" width="16" height="8" fill="#ef4444"/>`,
  64, 64);

writeSvg('public/assets/enemies/heavy.svg',
  `<ellipse cx="48" cy="80" rx="40" ry="12" fill="#000" opacity="0.6"/>
   <rect x="16" y="16" width="64" height="64" rx="12" fill="#1e293b" stroke="#94a3b8" stroke-width="6"/>
   <circle cx="48" cy="48" r="16" fill="#ef4444"/>
   <circle cx="48" cy="48" r="8" fill="#fca5a5"/>
   <rect x="8" y="32" width="12" height="32" fill="#475569"/>
   <rect x="76" y="32" width="12" height="32" fill="#475569"/>`,
  96, 96);

// L1 MARS PROPS
writeSvg('public/assets/environment/mars/habitat.svg',
  `<ellipse cx="100" cy="140" rx="90" ry="20" fill="#000" opacity="0.4"/>
   <rect x="10" y="20" width="180" height="120" rx="16" fill="#c2410c" stroke="#7c2d12" stroke-width="6"/>
   <rect x="30" y="40" width="140" height="40" rx="8" fill="#0f172a"/>
   <rect x="40" y="45" width="120" height="30" fill="#22d3ee" opacity="0.2"/>
   <circle cx="160" cy="110" r="10" fill="#f59e0b"/>`,
  200, 160);

writeSvg('public/assets/environment/mars/crate.svg',
  `<rect x="8" y="8" width="48" height="48" rx="4" fill="#d97706" stroke="#78350f" stroke-width="4"/>
   <line x1="8" y1="8" x2="56" y2="56" stroke="#78350f" stroke-width="4"/>
   <line x1="56" y1="8" x2="8" y2="56" stroke="#78350f" stroke-width="4"/>`,
  64, 64);

// L2 LAB PROPS
writeSvg('public/assets/environment/lab/terminal.svg',
  `<rect x="8" y="8" width="64" height="48" rx="4" fill="#1e293b" stroke="#cbd5e1" stroke-width="2"/>
   <rect x="12" y="12" width="56" height="30" rx="2" fill="#0ea5e9"/>
   <rect x="16" y="16" width="20" height="4" fill="#fff"/>
   <rect x="16" y="24" width="40" height="4" fill="#fff"/>`,
  80, 64);

writeSvg('public/assets/environment/lab/specimen.svg',
  `<rect x="8" y="8" width="48" height="16" fill="#94a3b8"/>
   <rect x="8" y="104" width="48" height="16" fill="#94a3b8"/>
   <rect x="12" y="24" width="40" height="80" fill="#38bdf8" opacity="0.4"/>
   <circle cx="32" cy="64" r="16" fill="#ef4444" opacity="0.8"/>`,
  64, 128);

// L3 BURIED SIGNAL PROPS
writeSvg('public/assets/environment/buried-signal/pillar.svg',
  `<polygon points="16,0 48,0 64,128 0,128" fill="#020617"/>
   <polygon points="24,16 40,16 48,112 16,112" fill="#a855f7" opacity="0.8"/>
   <line x1="32" y1="16" x2="32" y2="112" stroke="#d8b4fe" stroke-width="4"/>`,
  64, 128);

writeSvg('public/assets/environment/buried-signal/anomaly.svg',
  `<polygon points="32,0 64,32 32,64 0,32" fill="#7e22ce" stroke="#d8b4fe" stroke-width="4"/>
   <circle cx="32" cy="32" r="12" fill="#f3e8ff"/>
   <circle cx="32" cy="32" r="6" fill="#a855f7"/>`,
  64, 64);

// EFFECTS
writeSvg('public/assets/effects/projectile.svg',
  `<rect x="4" y="4" width="24" height="8" rx="4" fill="#38bdf8"/>
   <rect x="8" y="6" width="16" height="4" rx="2" fill="#fff"/>`,
  32, 16);

writeSvg('public/assets/effects/spark.svg',
  `<circle cx="16" cy="16" r="8" fill="#f59e0b"/>
   <circle cx="16" cy="16" r="4" fill="#fff"/>`,
  32, 32);

console.log('SVGs generated successfully.');
