import fs from 'fs';

const base = fs.readFileSync('c:/VividView Websites/Ekantha/web/public/landing-pages/inner-green-3d.html', 'utf8');

let html = base;

// 1. Point images & fonts to local assets
html = html.replaceAll(
  'https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/c74a626e396794aa239bca6f/card-ethos.jpg',
  'inner-green-assets/card-ethos.jpg'
);
html = html.replaceAll(
  'https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/c74a626e396794aa239bca6f/card-ecostove.jpg',
  'inner-green-assets/card-ecostove.jpg'
);
html = html.replaceAll(
  'https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/embedded/1ec8f6ee2750554b4bc59ff0b507d316a82a7ba37e0e5bebc41d3bd9b9faad46.woff2',
  'inner-green-assets/lexend-latin.woff2'
);

// 2. Customize text for Guest Testimonials & Stories
html = html.replace('<title>Sylva — Into the living world</title>', '<title>Ekantha — Guest Stories &amp; Reflections</title>');

// Ghost watermark behind moss
html = html.replace('<div class="ghost fade" style="--d:1150ms" aria-hidden="true">SYLVA</div>', '<div class="ghost fade" style="--d:1150ms" aria-hidden="true">EKANTHA</div>');

// Dock nav items
html = html.replace('<span>Grove</span>', '<span>Unhurried</span>');
html = html.replace('<span>Habitats</span>', '<span>Peaceful</span>');
html = html.replace('<span>Journal</span>', '<span>Stories</span>');
html = html.replace('<span>Enter</span>', '<span>Reserve</span>');

// Headline
html = html.replace(
  `<h1 class="headline" style="--pd:18; --pr:1.2">
      <span><i style="--d:260ms">Step into</i></span>
      <span><i style="--d:360ms">the living world</i></span>
    </h1>`,
  `<h1 class="headline" style="--pd:18; --pr:1.2">
      <span><i style="--d:260ms">In their words,</i></span>
      <span><i style="--d:360ms">one feeling at a time.</i></span>
    </h1>`
);

// Lede
html = html.replace(
  `<p class="lede mask" style="--d:480ms; --pd:14; --pr:1">We restore wild places through patient design, native planting, and a deeper kind of stewardship.</p>`,
  `<p class="lede mask" style="--d:480ms; --pd:14; --pr:1">“We came to celebrate and left having actually rested. Nothing felt rushed, nothing felt staged.”</p>`
);

// Button label
html = html.replace('<span class="lbl">Explore the work</span>', '<span class="lbl">Read Guest Stories</span>');

// Stats
html = html.replace('<div><dt>Canopy restored</dt><dd>282 ha</dd></div>', '<div><dt>Working Farmland</dt><dd>Five Acres</dd></div>');
html = html.replace('<div><dt>Native species</dt><dd>43 mapped</dd></div>', '<div><dt>Guest Rating</dt><dd>5.0 ★ Loved</dd></div>');

// Card 1
html = html.replace('<p class="label">Our Ethos</p>\n      <h2>Let the wild lead.</h2>', '<p class="label">Karthik Rao ★★★★★</p>\n      <h2>“Nothing felt rushed, nothing felt staged.”</h2>');

// Card 2
html = html.replace('<p class="label">Field Note 07</p>\n      <h2>After the Rain</h2>', '<p class="label">Ananya &amp; Vikram ★★★★★</p>\n      <h2>“A sanctuary that lets you exhale.”</h2>');

fs.writeFileSync('c:/VividView Websites/Ekantha/web/public/landing-pages/inner-green-testimonials.html', html, 'utf8');
console.log('Created inner-green-testimonials.html successfully!');
