const fs = require('fs');
const crypto = require('crypto');

// 1. Update server.ts
let server = fs.readFileSync('electron/server.ts', 'utf8');

const authCode = `
    let configuredKey = store.getSetting('serverApiKey');
    if (!configuredKey) {
      configuredKey = require('crypto').randomUUID();
      store.updateSetting('serverApiKey', configuredKey, 'System');
      console.log('Generated new server API key.');
    }
`;
server = server.replace(
  "const configuredKey = store.getSetting('serverApiKey') || 'fidele-sync-secret';",
  authCode
);
fs.writeFileSync('electron/server.ts', server);

// 2. Update package.json
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.build = pkg.build || {};
pkg.build.files = [
  "dist/**/*",
  "dist-electron/**/*",
  "build/icon-256.png"
];
pkg.scripts = pkg.scripts || {};
pkg.scripts.lint = "tsc --noEmit";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

// 3. Fix electron-mocha
// In package.json, test script needs to use TS or correct path.
// The test files are likely expecting store to be in '../electron/store'.
// Let's create a tsconfig.node.json fix or just add a test script using ts-node.
// Since it's not clear what electron-mocha fails on without ts-node, we'll try to add ts-node.
pkg.scripts.test = "electron-mocha --require ts-node/register test/**/*.test.js";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

// 4. Create vite-env.d.ts
const viteEnv = `
/// <reference types="vite/client" />
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
`;
fs.writeFileSync('src/vite-env.d.ts', viteEnv);

console.log("Patched server, package.json, and vite-env.d.ts");
