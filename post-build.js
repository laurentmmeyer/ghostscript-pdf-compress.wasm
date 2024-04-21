import fs from "fs-extra";
import path from "path";
import { glob } from "glob";

import { fileURLToPath } from "url";

// Convert import.meta.url to __dirname equivalent
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define paths
const buildDir = path.join(__dirname, "dist");
const targetAssetsDir = "/Users/laurentmeyer/Code/hugoplate/static/assets";
const targetContentFile =
  "/Users/laurentmeyer/Code/hugoplate/themes/hugoplate/layouts/index.html";
const targetSuccessFile =
  "/Users/laurentmeyer/Code/hugoplate/content/english/success/index.html";

// Clean directories
async function cleanDirectories() {
  await fs.emptyDir(targetAssetsDir);
  await fs.remove(targetContentFile);
}

// Move assets
async function moveAssets() {
  await fs.copy(path.join(buildDir, "assets"), targetAssetsDir, {
    overwrite: true,
  });
}

// Update and move index.html
async function updateAndMoveIndex() {
  // Find JS and CSS files
  const [jsFile] = glob.sync("assets/index.*.js", { cwd: buildDir });
  const [successJSFile] = glob.sync("assets/success.*.js", { cwd: buildDir });
  const [cssFile] = glob.sync("assets/main.*.css", { cwd: buildDir });

  // Construct new index.html content
  const indexContent = `
{{ define "main" }}
<script type="module" crossorigin src="/${jsFile}"></script>

<link rel="stylesheet" href="/${cssFile}">
<section class="section pt-14">
<div id="root" class="w-full"></div>
</section>

{{ end }}
`.trim();

  // Write updated index.html to targetContentDir
  await fs.outputFile(
    targetContentFile,
    indexContent,
    "utf8",
  );

  const successContent = `<script type="module" crossorigin src="/${successJSFile}"></script>

<link rel="stylesheet" href="/${cssFile}">
<section class="section pt-14">
<div id="root" class="w-full"></div>
</section>
`
  await fs.outputFile(
    targetSuccessFile,
    successContent,
    "utf8",
  );

}

// Run script
(async () => {
  try {
    await cleanDirectories();
    await moveAssets();
    await updateAndMoveIndex();
    console.log("Build adjustment completed successfully.");
  } catch (error) {
    console.error("Error during build adjustment:", error);
  }
})();
