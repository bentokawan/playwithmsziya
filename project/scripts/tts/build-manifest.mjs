import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');

const NUMBERS_ID = [
  'nol',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
  'sepuluh',
  'sebelas',
  'dua belas',
  'tiga belas',
  'empat belas',
  'lima belas',
  'enam belas',
  'tujuh belas',
  'delapan belas',
  'sembilan belas',
  'dua puluh',
];

const NUMBERS_EN = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
];

const LETTERS_ID = {
  a: 'a',
  b: 'be',
  c: 'ce',
  d: 'de',
  e: 'e',
  f: 'ef',
  g: 'ge',
  h: 'ha',
  i: 'i',
  j: 'je',
  k: 'ka',
  l: 'el',
  m: 'em',
  n: 'en',
  o: 'o',
  p: 'pe',
  q: 'ki',
  r: 'er',
  s: 'es',
  t: 'te',
  u: 'u',
  v: 've',
  w: 'we',
  x: 'eks',
  y: 'ye',
  z: 'zet',
};

// Hijaiyyah letter names, short Indonesian iqro style (no final hamza), with harakat for TTS.
const HIJAIYYAH_AR = {
  alif: 'أَلِفْ',
  ba: 'بَا',
  ta: 'تَا',
  tsa: 'ثَا',
  jim: 'جِيمْ',
  hha: 'حَا',
  kha: 'خَا',
  dal: 'دَالْ',
  dzal: 'ذَالْ',
  ra: 'رَا',
  zai: 'زَايْ',
  sin: 'سِينْ',
  syin: 'شِينْ',
  shad: 'صَادْ',
  dhad: 'ضَادْ',
  tha: 'طَا',
  zha: 'ظَا',
  ain: 'عَيْنْ',
  ghain: 'غَيْنْ',
  fa: 'فَا',
  qaf: 'قَافْ',
  kaf: 'كَافْ',
  lam: 'لَامْ',
  mim: 'مِيمْ',
  nun: 'نُونْ',
  waw: 'وَاوْ',
  haa: 'هَا',
  ya: 'يَا',
};

const phrases = JSON.parse(fs.readFileSync(path.join(__dirname, 'phrases.json'), 'utf8'));
const wordsSrc = fs.readFileSync(path.join(projectRoot, 'src', 'content', 'words.ts'), 'utf8');

const wordsByLocale = { id: new Set(), en: new Set() };
for (const match of wordsSrc.matchAll(/locale:\s*'(id|en)'\s*,\s*word:\s*'([^']+)'/g)) {
  wordsByLocale[match[1]].add(match[2].toLowerCase());
}

const jobs = [];

for (const locale of ['id', 'en']) {
  const numWords = locale === 'id' ? NUMBERS_ID : NUMBERS_EN;
  for (let n = 0; n <= 20; n++) {
    jobs.push({
      kind: 'num',
      locale,
      key: String(n),
      text: numWords[n],
      out: `public/audio/speech/${locale}/num-${n}.mp3`,
    });
  }

  for (let i = 0; i < 26; i++) {
    const ch = String.fromCharCode(97 + i);
    jobs.push({
      kind: 'letter',
      locale,
      key: ch,
      text: locale === 'id' ? LETTERS_ID[ch] : ch.toUpperCase(),
      out: `public/audio/speech/${locale}/letter-${ch}.mp3`,
    });
  }

  for (const word of [...wordsByLocale[locale]].sort()) {
    jobs.push({
      kind: 'word',
      locale,
      key: word,
      text: word,
      out: `public/audio/speech/${locale}/word-${word}.mp3`,
    });
  }

  for (const phrase of phrases) {
    jobs.push({
      kind: 'phrase',
      locale,
      key: phrase.key,
      text: phrase[locale],
      out: `public/audio/speech/${locale}/phrase-${phrase.key}.mp3`,
    });
  }
}

for (const [key, text] of Object.entries(HIJAIYYAH_AR)) {
  jobs.push({
    kind: 'hija',
    locale: 'ar',
    key,
    text,
    out: `public/audio/speech/ar/hija-${key}.mp3`,
  });
}

const outPath = path.join(__dirname, 'tts-jobs.json');
fs.writeFileSync(outPath, JSON.stringify(jobs, null, 2) + '\n', 'utf8');
console.log(`Wrote ${jobs.length} TTS jobs to ${path.relative(projectRoot, outPath)}`);
