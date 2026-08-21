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
  if (file.includes('services\\\\page.tsx') || file.includes('services/page.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add import if missing
  if (content.includes('fixed inset-0 bg-slate-900/5') && !content.includes('createPortal')) {
    content = content.replace(/import React[^;]+;/, match => {
      return match + '\nimport { createPortal } from "react-dom";';
    });
    changed = true;
  }

  // Regex to match modal condition and wrapper
  // matches: {someCondition && ( <div className="fixed inset-0 bg-slate-900/5...
  const modalRegex = /\{([\w\s&!]+)\s*&&\s*\(\s*(<div className="fixed inset-0 bg-slate-900\/5[^>]+>)/g;
  
  if (content.match(modalRegex)) {
    content = content.replace(modalRegex, (match, condition, divOpen) => {
      return `{${condition} && typeof document !== "undefined" && createPortal(\n        ${divOpen}`;
    });
    changed = true;
  }

  // This relies on the fact that modals end with `</div>\n      )}`. 
  // We need to replace that with `</div>,\n        document.body\n      )}`
  // A simple regex might be too greedy, let's just find all `</div>\n      )}` after we've changed the opening.
  // Actually, wait, replacing `</div>\n      )}` is safer if we just do:
  if (changed) {
    // only if we found a portal to open
    const endRegex = /<\/div>\s*\)\}/g;
    content = content.replace(endRegex, '</div>,\n        document.body\n      )}');
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
