import fs from 'fs';

const html = fs.readFileSync('c:/VividView Websites/Ekantha/web/public/landing-pages/inner-green-3d.html', 'utf8');
const scriptMatches = html.match(/src="[^"]+"/g);
console.log('scripts/images:', scriptMatches);
const fontMatches = html.match(/url\([^)]+\)/g);
console.log('font urls:', fontMatches);
