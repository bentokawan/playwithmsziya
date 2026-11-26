import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicAudioDir = path.join(projectRoot, 'public', 'audio');

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const writeIndex = args.includes('--write-index');
const gameIdx = args.indexOf('--game');
const gameFilter = gameIdx >= 0 ? args[gameIdx + 1] : null;

function readConstArray(filePath, constName) {
  if (!fs.existsSync(filePath)) return [];
  const src = fs.readFileSync(filePath, 'utf8');
  const re = new RegExp(`export const ${constName}\\s*=\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const match = src.match(re);
  if (!match) return [];
  return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

const audioTypesPath = path.join(projectRoot, 'src', 'lib', 'audio', 'types.ts');
const hijaiyyahPath = path.join(projectRoot, 'src', 'content', 'hijaiyyah.ts');

const musicIds = readConstArray(audioTypesPath, 'MUSIC_IDS');
const ambientIds = readConstArray(audioTypesPath, 'AMBIENT_IDS');
const sfxIds = readConstArray(audioTypesPath, 'SFX_IDS');
const hijaiyyahIds = readConstArray(hijaiyyahPath, 'HIJAIYYAH_IDS');

const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
const numbers = Array.from({ length: 21 }, (_, i) => String(i));

const categories = {
  music: musicIds.map((id) => `/audio/music/${id}.mp3`),
  ambient: ambientIds.map((id) => `/audio/ambient/${id}.mp3`),
  sfx: sfxIds.map((id) => `/audio/sfx/${id}.mp3`),
  'speech-num': ['id', 'en'].flatMap((loc) => numbers.map((n) => `/audio/speech/${loc}/num-${n}.mp3`)),
  'speech-letter': ['id', 'en'].flatMap((loc) =>
    letters.map((l) => `/audio/speech/${loc}/letter-${l}.mp3`),
  ),
  'speech-hija': hijaiyyahIds.map((id) => `/audio/speech/ar/hija-${id}.mp3`),
};

const GAME_CATEGORIES = {
  'ayo-berhitung': ['music', 'ambient', 'sfx', 'speech-num'],
  'menulis-angka': ['music', 'ambient', 'sfx', 'speech-num'],
  'susun-kata': ['music', 'ambient', 'sfx', 'speech-letter'],
  'bunyi-awal': ['music', 'ambient', 'sfx', 'speech-letter'],
  'menulis-huruf': ['music', 'ambient', 'sfx', 'speech-letter'],
  'dengar-temukan': ['music', 'ambient', 'sfx', 'speech-hija'],
  'tebalkan-hijaiyyah': ['music', 'ambient', 'sfx', 'speech-hija'],
  'kartu-kembar': ['music', 'ambient', 'sfx'],
  'petualangan-labirin': ['music', 'ambient', 'sfx'],
};

const activeCategories =
  gameFilter && GAME_CATEGORIES[gameFilter]
    ? GAME_CATEGORIES[gameFilter]
    : Object.keys(categories);

let totalMissing = 0;
const present = [];

for (const cat of activeCategories) {
  const expected = categories[cat] ?? [];
  const missing = [];
  for (const rel of expected) {
    const full = path.join(projectRoot, 'public', rel.replace(/^\//, ''));
    if (fs.existsSync(full)) {
      present.push(rel);
    } else {
      missing.push(rel);
    }
  }
  totalMissing += missing.length;
  console.log(`[${cat}] ${expected.length - missing.length}/${expected.length} present (${missing.length} missing)`);
}

if (writeIndex) {
  fs.mkdirSync(publicAudioDir, { recursive: true });
  const indexPath = path.join(publicAudioDir, 'bundled.json');
  fs.writeFileSync(indexPath, JSON.stringify({ files: present.sort() }, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${indexPath} (${present.length} bundled files)`);
}

if (strict && totalMissing > 0) {
  process.exit(1);
}
