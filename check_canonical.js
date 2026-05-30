const fs = require('fs');
const path = require('path');

const PROJECT_DIR = process.argv[2];
const APP_DIR = path.join(PROJECT_DIR, 'app');

const layouts = [];
function findLayouts(dir) {
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) findLayouts(fp);
    else if (f === 'layout.tsx') layouts.push(fp);
  }
}
findLayouts(APP_DIR);

console.log('Canonical durumu:\n');
for (const lp of layouts) {
  const rel = lp.replace(PROJECT_DIR, '').replace(/\\/g, '/');
  const content = fs.readFileSync(lp, 'utf8');
  const hasCanonical = content.includes('canonical');
  console.log(`${hasCanonical ? '✅' : '❌'} ${rel}`);
}
