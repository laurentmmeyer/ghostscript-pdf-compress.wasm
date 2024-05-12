import fs from "fs-extra";
import path from "path";
import { glob } from "glob";

import { fileURLToPath } from "url";
import {ck} from "./convertkit.js";

// Convert import.meta.url to __dirname equivalent
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define paths
const buildDir = path.join(__dirname, "dist");
const targetAssetsDir = "/Users/laurentmeyer/Code/hugoplate/static/assets";
const targetContentFile =
  "/Users/laurentmeyer/Code/hugoplate/themes/hugoplate/layouts/index.html";
const targetSuccessFile =
  "/Users/laurentmeyer/Code/hugoplate/content/english/success/index.md";
const targetLoginFile =
  "/Users/laurentmeyer/Code/hugoplate/content/english/login/index.md";
const targetPricingFile =
  "/Users/laurentmeyer/Code/hugoplate/content/english/pricing/index.md";

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
  const [loginJSFile] = glob.sync("assets/login.*.js", { cwd: buildDir });
  const [cssFile] = glob.sync("assets/*.css", { cwd: buildDir });

  // Construct new index.html content
  const indexContent = `
{{ define "main" }}
<script type="module" crossorigin src="/${jsFile}"></script>

<link rel="stylesheet" href="/${cssFile}">
<section class="section pt-14">
<div id="root" class="w-full"></div>
${ck}
</section>

{{ end }}
`.trim();

  // Write updated index.html to targetContentDir
  await fs.outputFile(targetContentFile, indexContent, "utf8");

  const successContent = `
---
title: Thank you!
---
<script type="module" crossorigin src="/${successJSFile}"></script>

<link rel="stylesheet" href="/${cssFile}">
<section class="section pt-14">
<div id="root" class="w-full"></div>
</section>
`;
  await fs.outputFile(targetSuccessFile, successContent, "utf8");

  const loginContent = `
---
title: Login
---
<script type="module" crossorigin src="/${loginJSFile}"></script>
<link rel="stylesheet" href="/${cssFile}">
<section class="section pt-14">
<div id="root" class="w-full"></div>
</section>
`;
  await fs.outputFile(targetLoginFile, loginContent, "utf8");
}

const [pricingJSFile] = glob.sync("assets/pricing.*.js", { cwd: buildDir });
const [cssFile] = glob.sync("assets/*.css", { cwd: buildDir });

async function updatePricingContentWithPromo(
  existingFilePath,
  targetPricingFile,
  pricingJSFile,
  cssFile,
) {
  try {
    // Step 1: Read the existing file content
    const fileContent = await fs.readFile(existingFilePath, "utf8");

    // Step 2: Extract promotional content
    const promoContentRegex =
      /\[\/\/\]: # \(START TEXT\)([\s\S]*?)\[\/\/\]: # \(END TEXT\)/;
    const match = fileContent.match(promoContentRegex);
    const promoContent = match ? match[1].trim() : ""; // Default to empty string if not found

    const pricingContent = `
---
title: Pricing
meta_title: SaferPDF Compress - Pricing
image: "/images/saferpdf-thumbnail.png"
---
[//]: # (START TEXT)

${promoContent} 

[//]: # (END TEXT)

<script type="module" crossorigin src="/${pricingJSFile}"></script>
<link rel="stylesheet" href="/${cssFile}">
<section class="section pt-14">
<div id="root" class="w-full"></div>
</section>
`;

    // Step 4: Write the updated content to the target file
    await fs.writeFile(targetPricingFile, pricingContent, "utf8");
    console.log(
      "Pricing content updated successfully with promotional message.",
    );
  } catch (error) {
    console.error("Error updating pricing content:", error);
  }
}

// Run script
(async () => {
  try {
    await cleanDirectories();
    await moveAssets();
    await updateAndMoveIndex();
    await updatePricingContentWithPromo(
      targetPricingFile,
      targetPricingFile,
      pricingJSFile,
      cssFile,
    );
    console.log("Build adjustment completed successfully.");
  } catch (error) {
    console.error("Error during build adjustment:", error);
  }
})();
