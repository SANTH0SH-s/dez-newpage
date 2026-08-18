/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src', 'app', 'admin');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('page.tsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const pages = walkSync(adminDir);

const loadingBlockRegex = /if\s*\(\s*loading\s*\)\s*\{\s*return\s*\(\s*<div[^>]*min-h-\[400px\][^>]*>[\s\S]*?<\/div>\s*\);\s*\}/g;
// Settings page has it differently, wait. Let's just do a generic replacement for the block.
// Let's replace specifically the block that returns a generic spinner div.

pages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.match(loadingBlockRegex)) {
    // Add import if not exists
    if (!content.includes('AdminSkeleton')) {
      content = content.replace(/(import React.*?;\n)/, "$1import { AdminSkeleton } from \"@/components/ui/admin-skeleton\";\n");
    }
    
    // Replace the block
    content = content.replace(loadingBlockRegex, "if (loading) {\n    return <AdminSkeleton />;\n  }");
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

// Settings page, estimates page, multipliers page might have custom blocks.
const otherLoadingRegex = /if\s*\(\s*loading\s*\)\s*\{\s*return\s*\([\s\S]*?animate-spin[\s\S]*?\);\s*\}/g;

pages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.match(otherLoadingRegex) && !content.includes('<AdminSkeleton />')) {
    if (!content.includes('AdminSkeleton')) {
      content = content.replace(/(import React.*?;\n)/, "$1import { AdminSkeleton } from \"@/components/ui/admin-skeleton\";\n");
    }
    content = content.replace(otherLoadingRegex, "if (loading) {\n    return <AdminSkeleton />;\n  }");
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated (other regex) ${file}`);
  }
});
