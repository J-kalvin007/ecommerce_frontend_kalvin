const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const dir = 'C:\\Travaux_informatiques\\Next.js\\site_atelier_du_terroir\\app\\auth';
const files = walk(dir);
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace ease: [number, number, number, number] not followed by " as ["
  const regex = /ease:\s*\[([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\](?!\s*as\s*\[)/g;
  content = content.replace(regex, "ease: [$1, $2, $3, $4] as [number, number, number, number]");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log('Updated: ' + file);
  }
});
console.log('Total files updated: ' + count);
