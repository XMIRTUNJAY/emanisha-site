import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = 'public/og';
const outputDir = 'public/og';

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));
console.log(`Processing ${files.length} images...`);

const lqipEntries = {};

for (const file of files) {
  const inputPath = path.join(inputDir, file);
  const outputFile = file.replace('.png', '.webp');
  const outputPath = path.join(outputDir, outputFile);

  // Generate WebP (quality 80, good balance)
  await sharp(inputPath)
    .webp({ quality: 80, effort: 6 })
    .toFile(outputPath);

  // Generate LQIP (tiny 20px wide base64)
  const lqipBuffer = await sharp(inputPath)
    .resize(20, null, { withoutEnlargement: true })
    .webp({ quality: 20 })
    .toBuffer();
  
  const lqipBase64 = `data:image/webp;base64,${lqipBuffer.toString('base64')}`;
  lqipEntries[outputFile] = lqipBase64;
  
  const origKb = Math.round(fs.statSync(inputPath).size / 1024);
  const webpKb = Math.round(fs.statSync(outputPath).size / 1024);
  console.log(`${file}: ${origKb} KB -> ${outputFile}: ${webpKb} KB (${Math.round((1-webpKb/origKb)*100)}% smaller)`);
}

// Write updated LQIP manifest (merge with existing)
const existingLqip = JSON.parse(fs.readFileSync('src/data/lqip.json', 'utf8'));
const mergedLqip = { ...existingLqip, ...lqipEntries };

fs.writeFileSync('src/data/lqip.json', JSON.stringify(mergedLqip, null, 2));
console.log('\nLQIP manifest updated with', Object.keys(lqipEntries).length, 'new entries');