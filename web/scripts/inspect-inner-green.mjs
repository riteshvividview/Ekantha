import fs from 'fs';

async function main() {
  const res = await fetch('https://threeui.com/landing-pages/inner-green-3d.html');
  const html = await res.text();
  fs.writeFileSync('c:/VividView Websites/Ekantha/web/scripts/downloaded-inner-green.html', html, 'utf8');

  // Check phrases
  for (const phrase of ['living world', 'patient design', 'Explore the work', 'Ethos', 'After the Rain', 'Canopy restored', 'Grove']) {
    console.log(phrase, 'found?', html.includes(phrase));
  }
}

main().catch(console.error);
