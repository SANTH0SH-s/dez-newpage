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

  const bgRegex = /fixed inset-0 bg-black\/(30|35) backdrop-blur-sm z-50 flex items-center justify-center p-4/g;
  if (content.match(bgRegex)) {
    content = content.replace(bgRegex, 'fixed inset-0 bg-white/20 backdrop-blur-md z-[100] flex items-center justify-center p-4');
    changed = true;
  }

  const modalRegex = /className="bg-white rounded-card max-w-([a-z0-9]+) w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200"/g;
  if (content.match(modalRegex)) {
    content = content.replace(modalRegex, (match, p1) => {
      return `className="bg-white rounded-card max-w-${p1} w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"`;
    });
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
