#!/bin/bash

# Exit on error
set -e

# Create a temporary directory for the deployment
TEMP_DIR=$(mktemp -d)

# Build the project with Vite into the temporary directory
echo "Building the project with Vite into the temporary directory..."
vite build --outDir "$TEMP_DIR"

# Navigate to the temporary directory
echo "$TEMP_DIR"
cd "$TEMP_DIR"

# Initialize a new git repository
echo "Initializing a new Git repository..."
git init

# Add the remote origin (replace with your actual remote URL)
REMOTE_URL=git@github.com-laurentmmeyer:laurentmmeyer/ghostscript-pdf-compress.wasm.git
git remote add origin "$REMOTE_URL"

# Add all build files to git
git add -A

# Commit the changes
git commit -m "Deploy build output to gh-pages"

# Force push to gh-pages branch
echo "Force pushing to gh-pages branch..."
git push --force origin main:gh-pages

# Cleanup: Remove the temporary directory
cd ..
rm -rf "$TEMP_DIR"

echo "Deployment to gh-pages complete!"
