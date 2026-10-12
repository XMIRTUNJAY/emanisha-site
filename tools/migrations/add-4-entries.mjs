import fs from 'fs';

const newEntries = [
  {
    slug: 'pronunciation-sounds',
    title: 'Hindi to Marathi Pronunciation: Sounds, Shifts & Alphabet',
    description: 'Sound shifts and pronunciation mapped Hindi to Marathi -- vowel/consonant changes, transliteration rules, the Devanagari alphabet -- from Unit 06.',
    h1: 'Hindi to Marathi: Pronunciation & Sounds',
    searchIntent: 'comparison',
    level: 'beginner',
    languagePaths: ['hindi'],
    topics: ['pronunciation', 'alphabet', 'comparison'],
    primaryKeyword: 'hindi to marathi pronunciation',
    secondaryKeywords: ['marathi alphabet', 'hindi to marathi sound shifts', 'marathi phonetics'],
    intro: [
      'Pronunciation and sound shifts from Unit 06 mapped Hindi to Marathi -- the Devanagari alphabet, vowel signs, consonant shifts, and the systematic sound changes that turn Hindi into Marathi. Each row maps the Hindi sound to the Marathi equivalent with a clear example.',
      'The shifts are regular and learnable: Hindi ड/ड → Marathi त/ट, Hindi nasal ँ → Marathi ँ, Hindi आ → Marathi अ. Once you internalize these 3-4 patterns, you can predict the Marathi form of most Sanskrit-derived words.'
    ],
    tip: 'Focus on the 3 big shifts: 1) द/ड → त/ट (मदद→मदत, चाबी→चावी), 2) nasal drop (महँगा→महाग), 3) आ → अ (तयार, आरसा). These cover 80% of vocabulary shifts.',
    bridgeUnits: ['06'],
    units: ['06'],
    sections: [
      { heading: 'The Devanagari alphabet -- shared with twists', paragraphs: ['Marathi uses the same Devanagari script as Hindi, but with a few extra signs: the eyelash ँ (candrabindu) for nasalization, the eyelash ़ (nukta) for loanword sounds (क़, ख़, ग़, ज़, फ़), and the vowel sign ॅ (short e) for English loans (प्लॅटफॉर्म). The core consonants and vowels are identical.'] },
      { heading: 'The 3 systematic sound shifts', paragraphs: ['1) Hindi द/ड → Marathi त/ट: मदद→मदत, चाबी→चावी, बड़ी→बडी, कड़वा→कटवा. 2) Hindi nasal ँ drop: महँगा→महाग, गंगा→गंगा (same), झाँसी→झांसी. 3) Hindi आ → Marathi अ: तयार, आरसा, बाजार→बाजार (same), नमस्ते→नमस्कार. These are not exceptions -- they are rules.'] }
    ],
    mistakes: [
      { wrong: 'Pronouncing ड as ड in Marathi', right: 'Say ट: बड़ी→बडी, कड़वा→कटवा', why: 'The retroflex ड shifts to ट systematically. This is the single most consistent shift.' },
      { wrong: 'Keeping nasal ँ in all words', right: 'Drop it: महँगा→महाग, गंगा→गंगा (same), झाँसी→झांसी', why: 'Marathi often drops the nasal ँ where Hindi keeps it. Not random -- follows phonological rules.' },
      { wrong: 'Writing तयार as तयार', right: 'तयार -- with अ, not आ', why: 'Hindi तैयार → Marathi तयार. The final आ shortens to अ in many loans.' }
    ],
    practice: {
      mcq: [
        { question: 'Marathi for चाबी?', options: ['चाबी', 'चावी', 'चाबि', 'चाबे'], answer: 1, explanation: 'चावी -- Hindi चाबी shifts द→व, आ→अ.' },
        { question: 'Marathi for बड़ी?', options: ['बड़ी', 'बडी', 'बदी', 'बडे'], answer: 1, explanation: 'बडी -- ड shifts to ट.' },
        { question: 'Marathi for महँगा?', options: ['महँगा', 'महाग', 'महग', 'महँग'], answer: 1, explanation: 'महाग -- nasal ँ drops.' }
      ],
      translate: [
        { source: 'बड़ी खुशी की बात है।', sourceLang: 'hi', answer: 'बडी खुशी बात आहे.', note: 'बड़ी→बडी, है→आहे -- standard shifts.' }
      ]
    },
    relatedPages: ['/hindi-to-marathi/questions/', '/hindi-to-marathi/daily-conversation/', '/lessons/06/'],
    faq: [
      { question: 'How many sound shifts are there between Hindi and Marathi?', answer: 'Three major systematic shifts cover 80% of vocabulary: 1) द/ड→त/ट, 2) nasal drop, 3) आ→अ. The rest are word-specific.' },
      { question: 'Is the Devanagari alphabet the same?', answer: 'Yes, the core alphabet is identical. Marathi adds candrabindu (ँ), nukta (़), and ॅ for English loans.' }
    ],
    appCtaVariant: 'phrase',
    status: 'published'
  },
  {
    slug: 'school-and-study',
    title: 'Hindi to Marathi School & Study: Classroom, Subjects, Exams',
    description: 'Education vocabulary mapped Hindi to Marathi -- classroom, subjects, exams, grades -- from Unit 11 (education half).',
    h1: 'Hindi to Marathi: School & Study',
    searchIntent: 'comparison',
    level: 'beginner',
    languagePaths: ['hindi'],
    topics: ['education', 'school', 'conversation'],
    primaryKeyword: 'hindi to marathi school words',
    secondaryKeywords: ['marathi classroom vocabulary', 'hindi to marathi education', 'study words marathi'],
    intro: [
      'School and study vocabulary from Unit 11 (education half) mapped Hindi to Marathi -- classroom (कक्षा→वर्ग), exams (परीक्षा→परीक्षा), subjects (गणित→गणित, विज्ञान→विज्ञान), grades (अंक→गुण). Each row maps the Hindi word to the Marathi equivalent with the grammar note.',
      'Much of the vocabulary is shared Sanskrit loans (गणित, विज्ञान, इतिहास, भूगोल, परीक्षा, अध्यापक) -- the shifts are in the functional words and the classroom-specific terms (कॉपी→वही, रबड़→खोडरबर, पैमाना→पट्टी).'
    ],
    tip: 'Subject names are your free vocabulary -- गणित, विज्ञान, इतिहास, भूगोल, परीक्षा, अध्यापक are identical. The new words are the classroom objects: वही, खोडरबर, पट्टी, टिफिन.',
    bridgeUnits: ['11'],
    units: ['11'],
    sections: [
      { heading: 'Classroom objects -- the shifts', paragraphs: ['कॉपी → वही (notebook), रबड़ → खोडरबर (eraser), पैमाना → पट्टी (ruler), टिफिन → टिफिन (same), बस्ता → दप्तर (schoolbag), स्याही → शाई (ink), पेंसिल → पेन्सिल (same), पाठ → धडा (lesson). The shifts are systematic: Hindi ब→व (कॉपी→वही), ड→ड (खोडरबर), म→ट (पैमाना→पट्टी).'] },
      { heading: 'Subjects -- mostly free vocabulary', paragraphs: ['गणित, विज्ञान, इतिहास, भूगोल, नागरिकशास्त्र, शारीरिक शिक्षण -- these are identical in both languages. The course sentences like मी गणित शिकत आहे use the same words. Learn the functional words around them: धडा (lesson), परीक्षा (exam), गुण (marks), गुणपत्रक (report card).'] }
    ],
    mistakes: [
      { wrong: 'Using कॉपी for notebook', right: 'वही = notebook', why: 'कॉपी is the Hindi/English loan; वही is the standard Marathi word used in schools.' },
      { wrong: 'Saying रबड़ for eraser', right: 'खोडरबर = eraser', why: 'रबड़ is the Hindi/English loan; खोडरबर is the standard Marathi word.' },
      { wrong: 'Saying पैमाना for ruler', right: 'पट्टी = ruler', why: 'पैमाना is Hindi/Urdu; पट्टी is the Marathi word used in schools.' }
    ],
    practice: {
      mcq: [
        { question: 'Notebook in Marathi?', options: ['कॉपी', 'वही', 'पुस्तक', 'पत्र'], answer: 1, explanation: 'वही (vahī) -- the standard Marathi word for notebook/copy.' },
        { question: 'Eraser in Marathi?', options: ['रबड़', 'खोडरबर', 'मिटाने वाला', 'मिट्टी'], answer: 1, explanation: 'खोडरबर (khoḍarbar) = eraser.' },
        { question: 'Ruler in Marathi?', options: ['पैमाना', 'पट्टी', 'स्केल', 'रूलर'], answer: 1, explanation: 'पट्टी (paṭṭī) = ruler/scale.' }
      ],
      translate: [
        { source: 'मेरा इंटरव्यू कल है।', sourceLang: 'hi', answer: 'माझं इंटरव्यू उद्या आहे.', note: 'Unit 11 sentence -- इंटरव्यू (loan) + उद्या (tomorrow) + आहे.' }
      ]
    },
    relatedPages: ['/vocabulary/education/', '/hindi-to-marathi/sentence-patterns/', '/lessons/11/'],
    faq: [
      { question: 'How do you say exam in Marathi?', answer: 'परीक्षा (parīkṣā) -- identical to Hindi परीक्षा.' },
      { question: 'What is the Marathi word for classroom?', answer: 'वर्ग (varg) -- not कक्षा (that\'s Hindi). वर्ग also means class/grade.' }
    ],
    appCtaVariant: 'phrase',
    status: 'published'
  },
  {
    slug: 'technology',
    title: 'Hindi to Marathi Technology: Phone, Internet, Apps',
    description: 'Technology vocabulary mapped Hindi to Marathi -- phone, internet, apps, social media, devices -- from Unit 12.',
    h1: 'Hindi to Marathi: Technology & Internet',
    searchIntent: 'comparison',
    level: 'intermediate',
    languagePaths: ['hindi'],
    topics: ['technology', 'internet', 'daily-life'],
    primaryKeyword: 'hindi to marathi technology words',
    secondaryKeywords: ['marathi tech vocabulary', 'phone internet marathi', 'digital marathi vocabulary'],
    intro: [
      'Technology vocabulary from Unit 12 mapped Hindi to Marathi -- phone (फोन→फोन, मोबाइल→मोबाईल), internet (इंटरनेट→इंटरनेट, वाईफाई→व्हायफाय), apps (ऐप→ऐप, व्हाट्सएप→व्हाट्सअॅप), actions (कॉल करना→फोन करा, मेसेज भेजना→मेसेज पाठवा). Each row maps the Hindi term to the Marathi equivalent with the grammar note.',
      'Most tech vocabulary is English loans written in Devanagari -- the shifts are in the verb frames and spelling conventions (मोबाइल→मोबाईल, व्हाट्सएप→व्हाट्सअॅप, चार्ज→चार्ज). The grammar is the same; only the spelling conventions differ.'
    ],
    tip: 'मोबाईल, इंटरनेट, चार्ज, ऐप, बैटरी -- these are the same words, just Devanagari. Learn the verbs (फोन करा, मेसेज पाठवा, चार्ज करा) and you have the full tech kit.',
    bridgeUnits: ['12'],
    units: ['12'],
    sections: [
      { heading: 'Loanwords you already know', paragraphs: ['फोन, मोबाईल, इंटरनेट, व्हाट्सअॅप, चार्ज, ऐप, बैटरी, व्हायफाय, ब्लूटूथ, सिम, मेमोरी, स्टोरेज -- the nouns are English loans in Devanagari. The Marathi part is the verb: फोन करा, मेसेज पाठवा, चार्ज करा, डाउनलोड करा, इंस्टॉल करा, डिलीट करा.'] },
      { heading: 'Spelling conventions -- the only traps', paragraphs: ['मोबाइल → मोबाईल (Marathi writes ि and ल), व्हाट्सएप → व्हाट्सअॅप (अॅ for the a-sound), इंटरनेट → इंटरनेट (same), व्हाट्सएप → व्हाट्सअॅप. The candrabindu in मोबाईल and the ॅ in व्हाट्सअॅप are the only spelling flags.'] }
    ],
    mistakes: [
      { wrong: 'Writing मोबाइल for mobile', right: 'मोबाईल -- with ि and ल', why: 'Marathi writes the English loan as मोबाईल; the Hindi spelling मोबाइल uses the wrong vowel sign.' },
      { wrong: 'Saying इंटरनेट काम करत आहे for "internet is working"', right: 'इंटरनेट चालू आहे', why: 'चालू = on/working; बंद = off. चालू/बंद is the standard on/off pair.' },
      { wrong: 'Writing व्हाट्सएप for WhatsApp', right: 'व्हाट्सअॅप -- with ॅ', why: 'Marathi uses ॅ (short e) for the English \'a\' in WhatsApp; व्हाट्सएप uses Hindi vowel.' }
    ],
    practice: {
      mcq: [
        { question: 'Call me in Marathi?', options: ['मला फोन करा', 'मी फोन करतो', 'फोन करा मी', 'माझा फोन करा'], answer: 0, explanation: 'मला फोन करा -- to me, call (dative + verb).' },
        { question: 'My battery is low in Marathi?', options: ['माझी बैटरी कमी आहे', 'बैटरी लो आहे', 'माझी बैटरी डाउन आहे', 'बैटरी लो'], answer: 0, explanation: 'माझी बैटरी कमी आहे -- battery is feminine, so माझी/कमी.' },
        { question: 'Download the app in Marathi?', options: ['ऐप डाउनलोड करा', 'ऐप लोड करा', 'ऐप घेऊन या', 'ऐप मिळवा'], answer: 0, explanation: 'ऐप डाउनलोड करा -- loanword + करा.' }
      ],
      translate: [
        { source: 'Charge your phone.', answer: 'तुमचा फोन चार्ज करा.', note: 'Imperative with loanword + करा.' }
      ]
    },
    relatedPages: ['/english-to-marathi/technology-phone/', '/lessons/12/', '/blog/phone-and-messaging/'],
    faq: [
      { question: 'How do you say mobile in Marathi?', answer: 'मोबाईल -- with ि and ल, not मोबाइल. The candrabindu is not used here; just the spelling convention.' },
      { question: 'What is WhatsApp in Marathi?', answer: 'व्हाट्सअॅप -- with ॅ (short e) for the English \'a\' sound.' }
    ],
    appCtaVariant: 'phrase',
    status: 'published'
  },
  {
    slug: 'festivals',
    title: 'Hindi to Marathi Festivals: Diwali, Ganpati, Gudi Padwa & More',
    description: 'Festival vocabulary mapped Hindi to Marathi -- Diwali, Ganpati, Gudi Padwa, Holi, Makar Sankranti -- from Unit 13.',
    h1: 'Hindi to Marathi: Festivals & Celebrations',
    searchIntent: 'comparison',
    level: 'beginner',
    languagePaths: ['hindi'],
    topics: ['festivals', 'culture', 'daily-life'],
    primaryKeyword: 'hindi to marathi festival words',
    secondaryKeywords: ['marathi festival names', 'diwali in marathi', 'ganpati marathi', 'gudi padwa marathi'],
    intro: [
      'Festival vocabulary from Unit 13 mapped Hindi to Marathi -- Diwali (दिवाली→दिवाळी), Ganpati (गणपति→गणपती), Gudi Padwa (गुड़ी पड़वा→गुढीपाडवा), Holi (होली→होळी), Makar Sankranti (मकर संक्रांति→मकरसंक्रांत), Raksha Bandhan (रक्षाबंधन→रक्षाबंधन), Eid (ईद→ईद), Christmas (क्रिसमस→नाताळ). Each row maps the Hindi festival name to the Marathi equivalent with cultural notes.',
      'The shifts are in the spelling conventions: दिवाली→दिवाळी (ळ), होली→होळी (ळ), गुड़ी पड़वा→गुढीपाडवा (ढ़, ण). The names like गणपति, रक्षाबंधन, मकर संक्रांति are identical. Cultural phrases like शुभ दिवाळी, गणपती बप्पा मोरया are distinctly Marathi.'
    ],
    tip: 'गुढीपाडवा is the Marathi New Year (not Diwali) -- learn it first; it unlocks the calendar. गणपती उत्सव is 10 days of public celebration -- uniquely Maharashtrian.',
    bridgeUnits: ['13'],
    units: ['13'],
    sections: [
      { heading: 'The big five festivals', paragraphs: ['दिवाळी (Diwali), गणपती (Ganpati), गुढीपाडवा (Gudi Padwa), होळी (Holi), मकरसंक्रांत (Makar Sankranti) -- these five dominate the Marathi festival calendar. Each has specific vocabulary: दिवाळी → फराळ, लाडू, चकली, दिवाळीची शुभेच्छा; गणपती → मोदक, विसर्जन, बप्पा; गुढीपाडवा → गुढी, नीम-शेंगदाणा, नवीन वर्ष.'] },
      { heading: 'Festival greetings -- the Marathi way', paragraphs: ['शुभ दिवाळी, गणपती बप्पा मोरया, गुढीपाडवाच्या शुभेच्छा, होळीची शुभेच्छा, शुभ मकरसंक्रांत. The pattern: शुभ + festival name + शुभेच्छा/मोरया. These are not translations -- they are cultural formulas you use as-is.'] }
    ],
    mistakes: [
      { wrong: 'Writing दिवाली instead of दिवाळी', right: 'दिवाळी (with ळ)', why: 'The ळ sound is Marathi\'s signature; writing दिवाली marks the word as Hindi, not Marathi.' },
      { wrong: 'Using होली for Holi', right: 'होळी (with ळ)', why: 'Same ळ shift -- होली is Hindi, होळी is Marathi. The ळ is non-negotiable.' },
      { wrong: 'Writing गुड़ी पड़वा for Gudi Padwa', right: 'गुढीपाडवा (ढ़, ण)', why: 'Hindi गुड़ी पड़वा → Marathi गुढीपाडवा. The ढ़→ढ़ and ण are systematic.' }
    ],
    practice: {
      mcq: [
        { question: 'Marathi New Year?', options: ['दिवाळी', 'गुढीपाडवा', 'गणपती', 'होळी'], answer: 1, explanation: 'गुढीपाडवा (Guḍhī Pāḍavā) -- late March/early April, the Marathi New Year.' },
        { question: 'Lord Ganpati\'s visarjan in Marathi?', options: ['विसर्जन', 'विसर्जन', 'विसर्जन', 'विसर्जन'], answer: 0, explanation: 'विसर्जन (visarjan) -- identical in both languages, the immersion ritual.' },
        { question: 'Diwali sweets in Marathi?', options: ['मिठाई', 'फराळ', 'प्रसाद', 'लाडू'], answer: 1, explanation: 'फराळ (pharāḷ) -- the special Diwali snacks (चकली, लाडू, शंकरपाले, अनारसे).' }
      ],
      translate: [
        { source: 'Happy Diwali!', sourceLang: 'hi', answer: 'शुभ दिवाळी!', note: 'Standard Diwali greeting -- शुभ + festival name.' }
      ]
    },
    relatedPages: ['/vocabulary/culture-festivals/', '/blog/festival-greetings/', '/hindi-to-marathi/travel/', '/lessons/13/'],
    faq: [
      { question: 'What is the Marathi New Year?', answer: 'गुढीपाडवा (Guḍhī Pāḍavā) -- usually late March/early April, marked by raising a गुढी (flag) and eating नीम-शेंगदाणा मिश्रण.' },
      { question: 'How do you say Happy Ganpati in Marathi?', answer: 'गणपती बप्पा मोरया -- the iconic chant. For wishes: गणपतीची शुभेच्छा.' }
    ],
    appCtaVariant: 'phrase',
    status: 'published'
  }
];

const data = JSON.parse(fs.readFileSync('./src/data/seo/hindi-bridges.json', 'utf8'));
data.push(...newEntries);
fs.writeFileSync('./src/data/seo/hindi-bridges.json', JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Done! Total entries:', data.length);