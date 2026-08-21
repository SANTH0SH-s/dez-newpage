const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/admin/services/page.tsx',
  'src/app/admin/packages/page.tsx',
  'src/app/admin/addons/page.tsx',
  'src/app/admin/questions/page.tsx',
  'src/app/admin/faqs/page.tsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find what the state array is named. 
  // e.g. setServices, setPackages, setPricingComponents, setQuestions, setFaqs
  let stateSetter = '';
  let entityType = '';
  
  if (file.includes('services')) { stateSetter = 'setServices'; entityType = 'service'; }
  if (file.includes('packages')) { stateSetter = 'setPackages'; entityType = 'package'; }
  if (file.includes('addons')) { stateSetter = 'setPricingComponents'; entityType = 'component'; }
  if (file.includes('questions')) { stateSetter = 'setQuestions'; entityType = 'question'; }
  if (file.includes('faqs')) { stateSetter = 'setFaqs'; entityType = 'faq'; }
  
  // Find the handleToggleStatus block
  // We need to match from `const handleToggleStatus = async (id: string) => {` down to its `};`
  // It usually looks like:
  /*
  const handleToggleStatus = async (id: string) => {
    const item = items.find((s) => s.id === id);
    if (!item) return;
    const newStatus = item.status === "active" ? "inactive" : "active";
    try {
      await endpoints.adminUpdateX(id, { status: newStatus });
      fetchX();
    } catch (err: any) {
      console.error(err);
      alert(`Failed to update status: ${err.message || err}`);
    }
  };
  */
  
  // We will use a regex to capture everything from `const handleToggleStatus` to the end of the block.
  // Then replace the `try { ... } catch { ... }` block to include optimistic updates.
  
  const toggleRegex = /const handleToggleStatus = async \(id: string\) => \{([\s\S]*?)try \{([\s\S]*?)\} catch \(err: any\) \{([\s\S]*?)\n  \};/g;
  
  content = content.replace(toggleRegex, (match, beforeTry, insideTry, insideCatch) => {
    
    // Find the variable name holding the current item (e.g. `service`, `pkg`, `component`)
    // from `const X = array.find(...)`
    const findMatch = beforeTry.match(/const (\w+) = .*?\.find\(/);
    const itemName = findMatch ? findMatch[1] : 'item';
    
    // We construct the optimistic update
    const optimisticUpdate = `    // Optimistic UI Update\n    ${stateSetter}(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));\n    \n    try {`;
    
    const revertUpdate = `} catch (err: any) {\n      // Revert on error\n      ${stateSetter}(prev => prev.map(p => p.id === id ? { ...p, status: ${itemName}.status } : p));\n      ${insideCatch.trim()}`;
    
    // We also remove the fetchX() inside the try block so it doesn't cause a re-render lag immediately,
    // although we could keep it to ensure data sync. We will just leave insideTry as is.
    
    return `const handleToggleStatus = async (id: string) => {${beforeTry}${optimisticUpdate}${insideTry}${revertUpdate}\n  };`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
