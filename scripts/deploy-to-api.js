const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'dist', 'tele-seha-web', 'browser');
const targetDir = path.join(__dirname, '..', '..', 'TeleSehaApi', 'TeleSehaApi', 'wwwroot');

// Helper to recursively copy files, skipping specific folders
function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  for (const file of files) {
    const curSource = path.join(source, file);
    let destFile = file;
    if (file === 'index.csr.html') {
      destFile = 'index.html';
      console.log(`Renaming index.csr.html to index.html during copy.`);
    }
    const curTarget = path.join(target, destFile);

    // Skip special folders in target if they exist (uploads and files)
    if (file === 'uploads' || file === 'files') {
      console.log(`Skipping special directory: ${file}`);
      continue;
    }

    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
      console.log(`Copied: ${destFile}`);
    }
  }
}

try {
  console.log(`Starting to copy build files from:\n  ${sourceDir}\nto:\n  ${targetDir}\n`);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}. Make sure you ran 'npm run build' first.`);
  }
  copyFolderRecursiveSync(sourceDir, targetDir);
  console.log('\nBuild files copied successfully to API wwwroot!');
} catch (err) {
  console.error('Error occurred during copy:', err.message);
  process.exit(1);
}
