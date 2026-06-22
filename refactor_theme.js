const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const dir = 'C:\\Travaux_informatiques\\Next.js\\site_atelier_du_terroir';
const files = walk(dir);
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/import\s+\{\s*useTheme\s*\}\s+from\s+['"]@\/hooks\/useTheme['"];?/g, "import { useThemeStore } from '@/store/theme.store';");
  content = content.replace(/import\s+\{\s*useTheme\s*\}\s+from\s+['"]\.\.\/hooks\/useTheme['"];?/g, "import { useThemeStore } from '@/store/theme.store';");
  content = content.replace(/import\s+\{\s*useTheme\s*\}\s+from\s+['"]\.\.\/\.\.\/hooks\/useTheme['"];?/g, "import { useThemeStore } from '@/store/theme.store';");
  
  content = content.replace(/const\s+\{\s*theme\s*\}\s*=\s*useTheme\(\);/g, "const { resolvedTheme: theme } = useThemeStore();");
  content = content.replace(/const\s+\{\s*theme\s*,\s*setTheme\s*\}\s*=\s*useTheme\(\);/g, "const { resolvedTheme: theme, setTheme } = useThemeStore();");
  content = content.replace(/const\s+\{\s*setTheme\s*,\s*theme\s*\}\s*=\s*useTheme\(\);/g, "const { setTheme, resolvedTheme: theme } = useThemeStore();");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log('Updated: ' + file);
  }
});
console.log('Total files updated: ' + count);
