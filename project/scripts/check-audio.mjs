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
const onlyIdx = args.indexOf('--only');
const onlyFilter = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
const localeIdx = args.indexOf('--locale');
const localeFilter = localeIdx >= 0 ? args[localeIdx + 1] : null;

function readConstArray(filePath, constName) {
  if (!fs.existsSync(filePath)) return [];
  const src = fs.readFileSync(filePath, 'utf8');
  const re = new RegExp(`export const ${constName}\\s*=\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const match = src.match(re);
  if (!match) return [];
  return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

function readBundledWords(filePath) {
  if (!fs.existsSync(filePath)) return { id: [], en: [] };
  const src = fs.readFileSync(filePath, 'utf8');
  const byLocale = { id: new Set(), en: new Set() };
  const re = /locale:\s*'(id|en)'\s*,\s*word:\s*'([^']+)'/g;
  for (const m of src.matchAll(re)) {
    byLocale[m[1]].add(m[2].toLowerCase());
  }
  return { id: [...byLocale.id], en: [...byLocale.en] };
}

const audioTypesPath = path.join(projectRoot, 'src', 'lib', 'audio', 'types.ts');
const hijaiyyahPath = path.join(projectRoot, 'src', 'content', 'hijaiyyah.ts');
const wordsPath = path.join(projectRoot, 'src', 'content', 'words.ts');

const musicIds = readConstArray(audioTypesPath, 'MUSIC_IDS');
const ambientIds = readConstArray(audioTypesPath, 'AMBIENT_IDS');
const sfxIds = readConstArray(audioTypesPath, 'SFX_IDS');
const phraseIds = readConstArray(audioTypesPath, 'PHRASE_IDS');
const hijaiyyahIds = readConstArray(hijaiyyahPath, 'HIJAIYYAH_IDS');
const wordsByLocale = readBundledWords(wordsPath);

const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
const numbers = Array.from({ length: 21 }, (_, i) => String(i));
const speechLocales = localeFilter === 'id' || localeFilter === 'en' ? [localeFilter] : ['id', 'en'];

const categories = {
  music: musicIds.map((id) => `/audio/music/${id}.mp3`),
  ambient: ambientIds.map((id) => `/audio/ambient/${id}.mp3`),
  sfx: sfxIds.map((id) => `/audio/sfx/${id}.mp3`),
  'speech-num': speechLocales.flatMap((loc) =>
    numbers.map((n) => `/audio/speech/${loc}/num-${n}.mp3`),
  ),
  'speech-letter': speechLocales.flatMap((loc) =>
    letters.map((l) => `/audio/speech/${loc}/letter-${l}.mp3`),
  ),
  'speech-word': speechLocales.flatMap((loc) =>
    (wordsByLocale[loc] ?? []).map((w) => `/audio/speech/${loc}/word-${w}.mp3`),
  ),
  'speech-phrase': speechLocales.flatMap((loc) =>
    phraseIds.map((p) => `/audio/speech/${loc}/phrase-${p}.mp3`),
  ),
  'speech-hija': hijaiyyahIds.map((id) => `/audio/speech/ar/hija-${id}.mp3`),
};

const GAME_CATEGORIES = {
  'ayo-berhitung': ['music', 'ambient', 'sfx', 'speech-num', 'speech-phrase'],
  'menulis-angka': ['music', 'ambient', 'sfx', 'speech-num', 'speech-phrase'],
  'susun-kata': ['music', 'ambient', 'sfx', 'speech-letter', 'speech-word', 'speech-phrase'],
  'bunyi-awal': ['music', 'ambient', 'sfx', 'speech-letter', 'speech-word', 'speech-phrase'],
  'menulis-huruf': ['music', 'ambient', 'sfx', 'speech-letter', 'speech-phrase'],
  'dengar-temukan': ['music', 'ambient', 'sfx', 'speech-hija', 'speech-phrase'],
  'tebalkan-hijaiyyah': ['music', 'ambient', 'sfx', 'speech-hija', 'speech-phrase'],
  'kartu-kembar': ['music', 'ambient', 'sfx', 'speech-phrase'],
  'petualangan-labirin': ['music', 'ambient', 'sfx', 'speech-phrase'],
};

let activeCategories =
  gameFilter && GAME_CATEGORIES[gameFilter]
    ? GAME_CATEGORIES[gameFilter]
    : Object.keys(categories);

if (onlyFilter) {
  if (onlyFilter === 'speech') {
    activeCategories = activeCategories.filter(
      (cat) => cat.startsWith('speech-') && cat !== 'speech-hija',
    );
  } else {
    activeCategories = activeCategories.filter(
      (cat) => cat === onlyFilter || cat.startsWith(`${onlyFilter}-`),
    );
  }
}

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
  console.log(
    `[${cat}] ${expected.length - missing.length}/${expected.length} present (${missing.length} missing)`,
  );
}

if (writeIndex) {
  const allLocales = ['id', 'en'];
  const allCategories = {
    music: musicIds.map((id) => `/audio/music/${id}.mp3`),
    ambient: ambientIds.map((id) => `/audio/ambient/${id}.mp3`),
    sfx: sfxIds.map((id) => `/audio/sfx/${id}.mp3`),
    'speech-num': allLocales.flatMap((loc) =>
      numbers.map((n) => `/audio/speech/${loc}/num-${n}.mp3`),
    ),
    'speech-letter': allLocales.flatMap((loc) =>
      letters.map((l) => `/audio/speech/${loc}/letter-${l}.mp3`),
    ),
    'speech-word': allLocales.flatMap((loc) =>
      (wordsByLocale[loc] ?? []).map((w) => `/audio/speech/${loc}/word-${w}.mp3`),
    ),
    'speech-phrase': allLocales.flatMap((loc) =>
      phraseIds.map((p) => `/audio/speech/${loc}/phrase-${p}.mp3`),
    ),
    'speech-hija': hijaiyyahIds.map((id) => `/audio/speech/ar/hija-${id}.mp3`),
  };
  const allPresent = [];
  for (const expected of Object.values(allCategories)) {
    for (const rel of expected) {
      const full = path.join(projectRoot, 'public', rel.replace(/^\//, ''));
      if (fs.existsSync(full)) {
        allPresent.push(rel);
      }
    }
  }
  const payload = JSON.stringify({ files: [...new Set(allPresent)].sort() }, null, 2) + '\n';
  fs.mkdirSync(publicAudioDir, { recursive: true });
  const indexPath = path.join(publicAudioDir, 'bundled.json');
  fs.writeFileSync(indexPath, payload, 'utf8');
  const srcIndexPath = path.join(projectRoot, 'src', 'lib', 'audio', 'bundledFiles.json');
  fs.writeFileSync(srcIndexPath, payload, 'utf8');
  console.log(`Wrote ${indexPath} and ${srcIndexPath} (${allPresent.length} bundled files)`);
}

if (strict && totalMissing > 0) {
  process.exit(1);
}
