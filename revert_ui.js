const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function cleanFileColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Revert stat dictionaries: { ..., color: 'text-[var(--blue)]', bg: 'bg-[var(--blue-lt)]' } 
  // to monochrome with black icons or subtle gray
  content = content.replace(/color:\s*'text-\[var\(--(blue|green|red|purple|amber)\)\]',\s*bg:\s*'bg-\[var\(--\1-lt\)\]'/g, "color: 'text-[var(--text2)]', bg: 'bg-white'");
  content = content.replace(/bar:\s*'bg-\[var\(--(blue|green|red|purple|amber)\)\]'/g, "bar: 'bg-[var(--border2)]'");

  // 2. Revert static functional colors back to clean Minimalist UI (White/Gray/Black/Gold)
  // bg-[var(--blue-lt)] -> bg-[#FAFAF8]
  content = content.replace(/bg-\[var\(--(blue|green|red|purple|amber)-lt\)\](?!\/)/g, 'bg-[#FAFAF8]');
  // bg-[var(--...-lt)]/30 -> bg-[#FAFAF8]
  content = content.replace(/bg-\[var\(--(blue|green|red|purple|amber)-lt\)\]\/\d+/g, 'bg-[#FAFAF8]');
  
  // 3. text-[var(--...)] inside icons -> text-[var(--text2)] or black
  // This is tricky so we just replace the exact text utility classes if they are not gold
  content = content.replace(/text-\[var\(--(blue|green|red|purple|amber)\)\]/g, 'text-black');
  
  // 4. border-[var(--...)] -> border-[var(--border)]
  content = content.replace(/border-\[var\(--(blue|green|red|purple|amber)\)\](?!\/)/g, 'border-[var(--border)]');
  content = content.replace(/border-\[var\(--(blue|green|red|purple|amber)\)\]\/\d+/g, 'border-[var(--border)]');

  // 5. hover states
  content = content.replace(/hover:bg-\[var\(--(blue|green|red|purple|amber)-lt\)\]/g, 'hover:bg-white');
  content = content.replace(/group-hover:bg-\[var\(--(blue|green|red|purple|amber)\)\]/g, 'group-hover:bg-black');
  content = content.replace(/group-hover:text-white/g, 'group-hover:text-white'); // keep this if bg goes black

  // 6. specific Topbar / Sidebar UI reverting
  if (filePath.includes('Sidebar.tsx')) {
     content = content.replace(/text-black/g, 'text-[var(--text2)]'); // Sidebar icons should typically be gray when reverted from rainbow
  }

  // Final fix up: if we made something `text-black` but it's an icon container `bg-[#FAFAF8] text-black`, change it to `text-[var(--text2)]`
  content = content.replace(/bg-\[\#FAFAF8\] text-black/g, 'bg-[#FAFAF8] text-[var(--text2)]');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Reverted UI in ${filePath.replace(directoryPath, '')}`);
  }
}

function traverseDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      cleanFileColors(fullPath);
    }
  });
}

traverseDir(directoryPath);
console.log('UI cleanup completed phase 1.');
