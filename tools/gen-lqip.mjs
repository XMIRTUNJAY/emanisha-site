// Generate LQIP (Low Quality Image Placeholders) for all OG images
// Outputs src/data/lqip.json with base64 data URIs
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = 'public/og';
const outputFile = 'src/data/lqip.json';

async function generateLQIPs() {
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));
  const manifest = {};

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    try {
      const buf = await sharp(inputPath)
        .resize(20, 10, { fit: 'inside', withoutEnlargement: true })
        .blur(15)
        .jpeg({ quality: 25, mozjpeg: true })
        .toBuffer();
      const b64 = buf.toString('base64');
      manifest[file] = `data:image/jpeg;base64,${b64}`;
      console.log(`Generated LQIP for ${file} (${b64.length} chars)`);
    } catch (e) {
      console.error(`Failed to generate LQIP for ${file}:`, e.message);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
  console.log(`LQIP manifest written to ${outputFile} (${files.length} entries)`);
}

generateLQIPs();