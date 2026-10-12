const fs = require('fs');

const newEntry = {
  slug: 'kitchen-items',
  title: 'Marathi Kitchen Items: Cooking, Utensils & Appliances',
  description: '40 Marathi kitchen words — rooms, utensils, appliances, cooking verbs — with Hindi meanings, pronunciation and examples from Unit 03 and Food category.',
  h1: 'Marathi Kitchen Words (स्वयंपाकघर आणि साधन)',
  searchIntent: 'vocabulary',
  level: 'beginner',
  languagePaths: ['hindi', 'english'],
  topics: ['home', 'cooking', 'daily-life'],
  primaryKeyword: 'marathi kitchen items',
  secondaryKeywords: ['kitchen words in marathi', 'marathi cooking vocabulary', 'utensils in marathi'],
  intro: [
    'Forty Marathi kitchen words covering rooms (स्वयंपाकघर, भोजनकक्ष), utensils (कढाई, तवा, चमचा), appliances (मिक्सर, फ्रिज, स्टोव), and cooking verbs (उकळणे, तळणे, भाजणे). Every entry has Hindi and English meanings, pronunciation and a real example sentence.',
    'Unit 03 introduces the kitchen as a room (स्वयंपाकघर) and the Food category adds ingredients and cooking verbs. Together they form a complete kitchen vocabulary for daily use and recipes.'
  ],
  tip: 'Pair nouns with cooking verbs: कढाई + तळणे (fry in a wok), तवा + भाजणे (roast on a griddle), पतीला + उकळणे (boil in a pot).',
  categories: ['Home', 'Food'],
  units: ['03'],
  sections: [
    {
      heading: 'Rooms & big appliances',
      paragraphs: [
        'स्वयंपाकघर (kitchen), भोजनकक्ष (dining room), फ्रिज (fridge), मिक्सर (mixer), स्टोव (stove), ओव्हन (oven). These are the nouns you will see on rental listings and appliance manuals.'
      ]
    },
    mistakes: [
      { wrong: 'Using किचन for kitchen', right: 'स्वयंपाकघर = kitchen (Marathi)', why: 'किचन is an English loan; स्वयंपाकघर is the standard Marathi word used in daily speech and real estate.' }
    ],
    practice: {
      mcq: [
        { question: 'Kitchen in Marathi?', options: ['किचन', 'स्वयंपाकघर', 'रसोई', 'भोजनकक्ष'], answer: 1, explanation: 'स्वयंपाकघर (svayampākghar) — self-cooking-house, the standard Marathi word.' }
      ],
      translate: [
        { source: 'Fry the onions in a wok.', answer: 'कांदा कढाईत तळा.', note: 'कढाईत = in the wok (locative); तळा = fry (imperative).' }
      ]
    },
    relatedPages: ['/vocabulary/food/', '/vocabulary/household-items/', '/lessons/03/'],
    faq: [
      { question: 'How many kitchen words are on this page?', answer: '40 — rooms, appliances, utensils and cooking verbs, each with Hindi meaning and example sentence.' },
      { question: 'What is the Marathi word for "kitchen"?', answer: 'स्वयंपाकघर (svayampākghar) — literally "self-cooking-house".' }
    ],
    appCtaVariant: 'vocabulary',
    status: 'published'
  };

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/seo/vocab-topics.json', 'utf8'));
console.log('Current entries:', data.length);
data.push(newEntry);
fs.writeFileSync('src/data/seo/vocab-topics.json', JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Done! Total entries:', data.length);