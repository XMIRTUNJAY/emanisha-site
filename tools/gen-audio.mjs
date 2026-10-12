// Batch TTS for vocabulary audio (manual tool — NOT part of build).
// Provider: Azure Speech (env AZURE_SPEECH_KEY + AZURE_SPEECH_REGION,
// optional AZURE_SPEECH_VOICE default mr-IN-AarohiNeural).
//   1. Reads src/data/learn/vocab.json (word + exampleMarathi per entry).
//   2. Filename = sha1(text).mp3 under public/audio/ (cache by hash —
//      re-runs only fetch new/changed strings).
//   3. Writes src/data/audio-manifest.json {vocabId: file} consumed by
//      VocabTable (lazy <audio> per row; falls back to device TTS).
// Without credentials the script prints setup steps and writes an empty
// manifest — the site keeps working on device TTS.
// ALL output is flagged for native-speaker review (see REPORT.md).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const audioDir = join(root, 'public', 'audio');
mkdirSync(audioDir, { recursive: true });

const KEY = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION;
const VOICE = process.env.AZURE_SPEECH_VOICE ?? 'mr-IN-AarohiNeural';

if (!KEY || !REGION) {
  console.log('gen-audio: no credentials — nothing generated.');
  console.log('  1. Azure Portal → Speech resource → Keys and Endpoint.');
  console.log('  2. $env:AZURE_SPEECH_KEY="<key>"; $env:AZURE_SPEECH_REGION="<region>"');
  console.log('  3. Re-run: node ./tools/gen-audio.mjs');
  console.log('  4. Have a native Marathi speaker review public/audio/ before publishing.');
  writeFileSync(join(root, 'src', 'data', 'audio-manifest.json'), JSON.stringify({ _note: 'empty — no TTS credentials', files: {} }, null, 2) + '\n');
  process.exit(0);
}

const vocab = JSON.parse(readFileSync(join(root, 'src', 'data', 'learn', 'vocab.json'), 'utf8'));
const manifest = { files: {} };
const hash = (s) => createHash('sha1').update(s, 'utf8').digest('hex').slice(0, 16);

async function tts(text) {
  const file = `${hash(text)}.mp3`;
  if (existsSync(join(audioDir, file))) return file;
  const ssml = `<speak version="1.0" xml:lang="mr-IN"><voice name="${VOICE}">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</voice></speak>`;
  const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': KEY, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3' },
    body: ssml,
  });
  if (!res.ok) throw new Error(`TTS ${res.status} for ${JSON.stringify(text.slice(0, 30))}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error(`suspiciously small audio for ${JSON.stringify(text.slice(0, 30))}`);
  writeFileSync(join(audioDir, file), buf);
  await new Promise((r) => setTimeout(r, 200)); // be nice to the API
  return file;
}

let n = 0;
for (const w of vocab) {
  for (const text of [w.marathi, w.exampleMarathi]) {
    if (!text?.trim()) continue;
    const file = await tts(text.trim());
    manifest.files[w.id] = manifest.files[w.id] ?? {};
    if (text.trim() === w.marathi.trim()) manifest.files[w.id].word = file;
    else manifest.files[w.id].example = manifest.files[w.id].example ?? file;
    n++;
  }
  if (n % 50 === 0) console.log(`gen-audio: ${n} clips…`);
}
writeFileSync(join(root, 'src', 'data', 'audio-manifest.json'), JSON.stringify({ voice: VOICE, files: manifest.files }, null, 2) + '\n');
console.log(`gen-audio: done, ${n} clips. NATIVE REVIEW REQUIRED before publishing.`);
