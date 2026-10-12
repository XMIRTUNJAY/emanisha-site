// Playwright validation for all 25 pages
const pages = [
  { route: '/blog/', expectedImg: 'og-blog-situational-guide.png', expectedTitle: 'Real-Life Marathi: Situational Guides' },
  { route: '/english-to-marathi/words/', expectedImg: 'og-english-to-marathi-workplace_1.png', expectedTitle: 'English to Marathi Words' },
  { route: '/grammar/commands-polite/', expectedImg: 'og-hindi-to-marathi-sentence-patterns_1.png', expectedTitle: 'Marathi Commands & Polite Requests' },
  { route: '/hindi-to-marathi/advanced-structures/', expectedImg: 'og-hindi-to-marathi-time-seasons_1.png', expectedTitle: 'Hindi to Marathi Advanced: Passive, Causative' },
  { route: '/hindi-to-marathi/daily-conversation/', expectedImg: 'og-hindi-to-marathi-time-seasons-clock.png', expectedTitle: 'Hindi to Marathi Daily Conversation: Survival Sentences' },
  { route: '/hindi-to-marathi/festivals/', expectedImg: 'og-hindi-to-marathi-travel_1.png', expectedTitle: 'Hindi to Marathi Festivals: Diwali, Ganpati & More' },
  { route: '/hindi-to-marathi/greetings/', expectedImg: 'og-english-to-marathi-greetings.png', expectedTitle: 'Hindi to Marathi Greetings & First Sentences' },
  { route: '/hindi-to-marathi/time-seasons/', expectedImg: 'og-hindi-to-marathi-shopping_1.png', expectedTitle: 'Hindi to Marathi Time & Seasons: Clock, Calendar, Weather' },
  { route: '/hindi-to-marathi/travel/', expectedImg: 'og-hindi-to-marathi-shopping-2.png', expectedTitle: 'Hindi to Marathi Travel Words: Trains, Tickets & Stays' },
  { route: '/phrases/making-plans/', expectedImg: 'og-phrases-making-plans.png', expectedTitle: 'Marathi Phrases for Making Plans & Future Talk' },
  { route: '/phrases/office-work/', expectedImg: 'og-phrases-shopping_1.png', expectedTitle: 'Marathi Office Phrases for Work & Daily Use' },
  { route: '/phrases/phone-and-messaging/', expectedImg: 'og-phrases-phone-and-messaging.png', expectedTitle: 'Marathi Phrases for Phone Calls & Messaging' },
  { route: '/phrases/presentations-interviews/', expectedImg: 'og-phrases-thanking-apologizing_1.png', expectedTitle: 'Marathi Phrases for Presentations & Interviews' },
  { route: '/phrases/shopping/', expectedImg: 'og-phrases-business-meetings_1.png', expectedTitle: 'Marathi Shopping Phrases' },
  { route: '/phrases/thanking-apologizing/', expectedImg: 'og-phrases-phone-and-messaging_1.png', expectedTitle: 'Marathi Phrases for Thanking & Apologizing' },
  { route: '/phrases/travel/', expectedImg: 'og-phrases-asking-directions-3.png', expectedTitle: 'Marathi Travel Phrases' },
  { route: '/vocabulary/adjectives/', expectedImg: 'og-vocabulary-adjectives.png', expectedTitle: 'Marathi Adjectives: 68 Describing Words' },
  { route: '/vocabulary/animals/', expectedImg: 'og-vocabulary-adjectives_1.png', expectedTitle: 'Marathi Animal Names: 40 Animals with Hindi & English' },
  { route: '/vocabulary/body-parts/', expectedImg: 'og-vocabulary-abstract-concepts_1.png', expectedTitle: 'Marathi Body Parts: 43 Words from Head to Toe' },
  { route: '/vocabulary/clothing/', expectedImg: 'og-vocabulary-transport_1.png', expectedTitle: 'Marathi Clothes Vocabulary: Clothing & Jewellery Words' },
  { route: '/vocabulary/food/', expectedImg: 'og-vocabulary-adjectives-2.png', expectedTitle: 'Marathi Food Words' },
  { route: '/vocabulary/shopping/', expectedImg: 'og-vocabulary-abstract-concepts-2.png', expectedTitle: 'Marathi Shopping & Market Words' },
  { route: '/hindi-to-marathi/school-and-study/', expectedImg: 'og-hindi-to-marathi-school-and-study.png', expectedTitle: 'Hindi to Marathi School & Study: Classroom, Subjects, Exams' },
  { route: '/hindi-to-marathi/technology/', expectedImg: 'og-hindi-to-marathi-technology.png', expectedTitle: 'Hindi to Marathi Technology: Phone, Internet, Apps' },
  { route: '/hindi-to-marathi/work-career/', expectedImg: 'og-hindi-to-marathi-work-career.png', expectedTitle: 'Hindi to Marathi Work & Career: Jobs, Office, Professions' },
];

const baseUrl = 'http://localhost:4322/learn-marathi';

for (const page of pages) {
  await page.goto(`${baseUrl}${page.route}`);
  
  const result = await page.evaluate(() => {
    const ogImage = document.querySelector('meta[property="og:image"]');
    const heroImg = document.querySelector('.hero-figure picture source, .hero-figure picture img');
    const h1 = document.querySelector('h1');
    return {
      title: document.title,
      h1: h1?.textContent?.trim(),
      ogImage: ogImage?.content,
      heroImgSrc: heroImg?.srcset || heroImg?.src,
    };
  });
  
  const ogMatch = result.ogImage?.includes(page.expectedImg) || result.heroImgSrc?.includes(page.expectedImg);
  const titleMatch = result.title?.includes(page.expectedTitle.split(':')[0]);
  
  console.log(`${ogMatch ? '✅' : '❌'} ${page.route}`);
  console.log(`  Title: ${result.title}`);
  console.log(`  H1: ${result.h1}`);
  console.log(`  ogImage: ${result.ogImage}`);
  console.log(`  Expected: ${page.expectedImg} ${ogMatch ? '✅' : '❌'}`);
  console.log('');
}