import fs from 'fs-extra'
import path from 'path'
import {glob} from 'glob'

import { fileURLToPath } from 'url';

// Convert import.meta.url to __dirname equivalent
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define paths
const buildDir = path.join(__dirname, 'dist');
const targetAssetsDir = '/Users/laurentmeyer/Code/hugoplate/static/assets'
const targetContentDir = '/Users/laurentmeyer/Code/hugoplate/content/english/app'

// Clean directories
async function cleanDirectories() {
  await fs.emptyDir(targetAssetsDir);
  await fs.emptyDir(targetContentDir);
}

// Move assets
async function moveAssets() {
  await fs.copy(path.join(buildDir, 'assets'), targetAssetsDir, { overwrite: true });
}

// Update and move index.html
async function updateAndMoveIndex() {
  // Find JS and CSS files
  const [jsFile] = glob.sync('assets/*.js', { cwd: buildDir });
  const [cssFile] = glob.sync('assets/*.css', { cwd: buildDir });

  // Construct new index.html content
  const indexContent = `
<script type="module" crossorigin src="/${jsFile}"></script>
<link rel="stylesheet" href="/${cssFile}">
<div id="root" class="w-full"></div>
`.trim();

  // Write updated index.html to targetContentDir
  await fs.outputFile(path.join(targetContentDir, 'index.html'), indexContent, 'utf8');
}

// Run script
(async () => {
  try {
    await cleanDirectories();
    await moveAssets();
    await updateAndMoveIndex();
    console.log('Build adjustment completed successfully.');
  } catch (error) {
    console.error('Error during build adjustment:', error);
  }
})();
