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
  if (content.includes('text-accent')) {
    const newLines = content.split('\n').map(line => {
      // If it's a structural highlight and not already bg-accent (except /5 or /10)
      if (!line.includes('bg-accent') || line.includes('bg-accent/5') || line.includes('bg-accent/10')) {
          return line.replace(/text-accent/g, 'text-brand').replace(/border-accent/g, 'border-brand');
      }
      return line;
    });

    if (newLines.join('\n') !== content) {
      fs.writeFileSync(file, newLines.join('\n'));
      console.log(`Updated ${file}`);
    }
  }
});
