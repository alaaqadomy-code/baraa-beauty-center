// One-off: self-host Google Fonts (arabic + latin subsets) → src/fonts + src/fonts.css
import { writeFileSync } from 'node:fs';
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' };
const urls = [
  'https://fonts.googleapis.com/css2?family=El+Messiri:wght@500;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap',
  `https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@700&text=${encodeURIComponent('براءة')}&display=swap`,
];
let out = '';
for (const u of urls) {
  const css = await (await fetch(u, { headers: UA })).text();
  for (const m of css.matchAll(/(?:\/\* ([\w-]+) \*\/\s*)?(@font-face \{[^}]+\})/g)) {
    const subset = m[1] || 'text';
    if (!['arabic', 'latin', 'text'].includes(subset)) continue;
    let block = m[2];
    const fam = block.match(/font-family: '([^']+)'/)[1].toLowerCase().replace(/ /g, '-');
    const w = block.match(/font-weight: (\d+)/)[1];
    const src = block.match(/url\((https:[^)]+)\)/)[1];
    const name = `${fam}-${w}-${subset}.woff2`;
    writeFileSync(`src/fonts/${name}`, Buffer.from(await (await fetch(src, { headers: UA })).arrayBuffer()));
    out += block.replace(src, `fonts/${name}`) + '\n';
  }
}
writeFileSync('src/fonts.css', out);
console.log(out.match(/fonts\/[^)]+/g));
