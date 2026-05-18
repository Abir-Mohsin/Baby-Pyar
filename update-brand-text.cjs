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
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const lines = content.split('\n');
  const newLines = lines.map(line => {
    if (line.includes('bg-brand') && line.includes('text-gray-900')) {
      changed = true;
      return line.replace(/text-gray-900/g, 'text-white');
    }
    return line;
  });

  if (changed) {
    fs.writeFileSync(file, newLines.join('\n'));
    console.log(`Updated ${file}`);
  }
});
