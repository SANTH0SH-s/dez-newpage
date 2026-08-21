const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/services/page.tsx',
  'src/app/admin/packages/page.tsx',
  'src/app/admin/addons/page.tsx',
  'src/app/admin/questions/page.tsx',
  'src/app/admin/faqs/page.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // We want to find the handleToggleStatus function and remove the fetch call inside the try block.
  // The fetch calls are: fetchServices(), fetchPackages(), fetchPricingComponents(), fetchQuestions(), fetchFaqs()
  
  // We can just find the handleToggleStatus block and replace fetch...() inside it.
  
  const toggleRegex = /(const handleToggleStatus = async[\s\S]*?try\s*{[\s\S]*?)(fetch[A-Za-z]+\(\);)([\s\S]*?catch)/g;
  
  if (toggleRegex.test(content)) {
    content = content.replace(toggleRegex, '$1// $2 (Removed to prevent loading screen during optimistic update)$3');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
