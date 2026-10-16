import fs from 'fs';

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove WebGL2 error message and make liquid metal robust
  const targetCheck = `if(!gl){\n  document.body.innerHTML = '<p style="color:#888;font:14px system-ui">WebGL2 is required for this page.</p>';\n} else {`;
  if (content.includes(targetCheck)) {
    content = content.replace(targetCheck, `if(!gl){\n  return;\n}`);
    // Also remove the matching closing brace at line ~1685
    // Find the end of mountLiquidMetal
    const endSnippet = `window.__seek   = v => { clock = v; drawn = null; };\n}\n\n  }`;
    if (content.includes(endSnippet)) {
      content = content.replace(endSnippet, `window.__seek   = v => { clock = v; drawn = null; };\n\n  }`);
    }
  }

  // Also replace getContext to be more compatible
  content = content.replace(
    `const gl = cv.getContext('webgl2', {alpha:true, antialias:false, premultipliedAlpha:true, powerPreference:'high-performance'});`,
    `const gl = cv ? (cv.getContext('webgl2', {alpha:true, antialias:false, premultipliedAlpha:true}) || cv.getContext('webgl2', {alpha:true, antialias:false, premultipliedAlpha:true, powerPreference:'default'}) || cv.getContext('webgl')) : null;`
  );

  // 2. Ensure no scrollbars on html and body
  content = content.replace(
    `html{ background:#383b34; }`,
    `html{ background:#383b34; overflow:hidden !important; width:100% !important; height:100% !important; scrollbar-width:none !important; -ms-overflow-style:none !important; } html::-webkit-scrollbar { display:none !important; }`
  );
  content = content.replace(
    `overflow-x:hidden;`,
    `overflow:hidden !important; width:100% !important; height:100% !important; scrollbar-width:none !important; -ms-overflow-style:none !important; } body::-webkit-scrollbar { display:none !important;`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated', filePath);
}

updateFile('c:/VividView Websites/Ekantha/web/public/landing-pages/inner-green-testimonials.html');
updateFile('c:/VividView Websites/Ekantha/web/public/landing-pages/inner-green-3d.html');
