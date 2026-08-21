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
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/santhosh/OneDrive/Desktop/dez-newpage/src/app/admin');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const bgRegex = /fixed inset-0 bg-white\/20 backdrop-blur-md z-\[100\] flex items-center justify-center p-4/g;
  if (content.match(bgRegex)) {
    // Change to a very subtle dark tint with small blur, or transparent with small blur
    content = content.replace(bgRegex, 'fixed inset-0 bg-slate-900/5 backdrop-blur-sm z-[100] flex items-center justify-center p-4');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
