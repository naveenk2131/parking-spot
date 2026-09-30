const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', '..', 'frontend', 'src');

function replaceCurrency(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace literal $ followed by number (e.g. $15.00 -> ₹15.00)
  content = content.replace(/\$([0-9])/g, '₹$1');
  
  // Replace $ followed by template variable in JSX or string literals (e.g. $${amount} or ${amount} if preceded by $)
  // Watch out for template strings. `${foo}` should stay `${foo}`. 
  // We want to replace `\$${` with `₹${` in backticks.
  content = content.replace(/\$\$\{/g, '₹${');
  
  // Replace >$ with >₹ in JSX text
  content = content.replace(/>\$/g, '>₹');

  // Replace USD with INR
  content = content.replace(/'USD'/g, "'INR'");
  content = content.replace(/"USD"/g, '"INR"');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      replaceCurrency(fullPath);
    }
  }
}

walkDir(srcDir);
console.log('Currency replacement complete.');
