const fs = require('fs');

function checkFile(filename) {
  console.log('Checking', filename);
  const code = fs.readFileSync(filename, 'utf8');
  
  // Find all <ComponentName
  const jsxMatches = code.match(/<([A-Z][a-zA-Z0-9_]*)/g);
  if (jsxMatches) {
    const components = [...new Set(jsxMatches.map(m => m.slice(1)))];
    
    // Find all imports
    const importMatches = code.match(/import\s+[^;]+from\s+['"][^'"]+['"]/g) || [];
    const importedVars = [];
    importMatches.forEach(imp => {
      const match = imp.match(/import\s+(.*?)\s+from/);
      if (match) {
        const vars = match[1].replace(/[{}]/g, '').split(',').map(v => v.trim());
        importedVars.push(...vars);
      }
    });

    const undefinedComps = components.filter(c => 
      !importedVars.includes(c) && 
      c !== 'React' && 
      c !== 'Fragment'
    );
    
    if (undefinedComps.length > 0) {
      console.log('UNDEFINED COMPONENTS FOUND IN', filename, ':', undefinedComps);
    } else {
      console.log('All JSX components seem to be imported in', filename);
    }
  }
}

checkFile('src/components/RetailPOS.jsx');
checkFile('src/components/RestaurantPOS.jsx');
checkFile('src/components/ShiftManager.jsx');
checkFile('src/components/SplitCheckModal.jsx');
checkFile('src/components/ui/POSLayout.jsx');
