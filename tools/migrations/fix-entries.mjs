import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./src/data/seo/vocab-topics.json', 'utf8'));

// Fix kitchen-items - add more practice items
const kitchenEntry = data.find(d => d.slug === 'kitchen-items');
if (kitchenEntry) {
  kitchenEntry.practice.mcq.push(
    { question: 'What is "fridge" in Marathi?', options: ['फ्रिज', 'फ्रीजर', 'कूलर', 'आइस बॉक्स'], answer: 0, explanation: 'फ्रिज (phrij) — the standard Marathi word for refrigerator.' },
    { question: '"Roast on a griddle" in Marathi?', options: ['तवा भाजा', 'कढाई भाजा', 'पतीला भाजा', 'ओव्हन भाजा'], answer: 0, explanation: 'तवा भाजा — roast on a griddle (तवा = griddle, भाजणे = to roast).' }
  );
  kitchenEntry.practice.translate.push(
    { source: 'Mix the ingredients in a bowl.', answer: 'सामग्री कटोरीत मिश्रण करा.', note: 'कटोरीत = in the bowl (locative); मिश्रण करा = mix (imperative).' }
  );
  console.log('Fixed kitchen-items practice items');
}

// Fix health-symptoms - change Medical to valid category
const healthEntry = data.find(d => d.slug === 'health-symptoms');
if (healthEntry) {
  healthEntry.categories = ['Body', 'Health'];
  console.log('Fixed health-symptoms categories');
}

fs.writeFileSync('./src/data/seo/vocab-topics.json', JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Done!');