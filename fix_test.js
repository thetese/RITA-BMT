const fs = require('fs');
let testCode = fs.readFileSync('test/store.test.js', 'utf8');
testCode = testCode.replace("require('../electron/store')", "require('../dist-electron/store')");
fs.writeFileSync('test/store.test.js', testCode);

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.test = "electron-mocha test/**/*.test.js";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('Fixed test path');
