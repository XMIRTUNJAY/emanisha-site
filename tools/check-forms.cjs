const fs = require('fs');
for (const f of ['dist/index.html', 'dist/app/index.html', 'dist/hi/app/index.html', 'dist/contact/index.html']) {
  const h = fs.readFileSync(f, 'utf8');
  const forms = (h.match(/data-funnel="waitlist_signup"/g) || []).length;
  const honey = (h.match(/name="_gotcha"/g) || []).length;
  const page = (h.match(/name="page"/g) || []).length;
  console.log(f, '| forms:', forms, '| honeypot:', honey, '| page-field:', page);
}
