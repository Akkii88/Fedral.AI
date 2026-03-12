#!/bin/bash

# prepare-zip.sh - Package the project for sharing
# This script creates a clean zip file without bulky dependencies.

ZIP_NAME="Fedral_Project.zip"

echo "------------------------------------------------"
echo "📦 PACKAGING FEDRAL.AI FOR SHARING"
echo "------------------------------------------------"

# Check if zip command exists
if ! command -v zip &> /dev/null; then
    echo "❌ Error: 'zip' command not found. Please install it."
    exit 1
fi

# Remove old zip if exists
rm -f "$ZIP_NAME"

echo "🧹 Cleaning up temp files..."
rm -rf frontend.log backend.log dashboard_launch.log 2>/dev/null

echo "🗜️  Creating $ZIP_NAME..."
# Exclude bulky folders and environment files
zip -r "$ZIP_NAME" . \
    -x "node_modules/*" \
    -x "*/node_modules/*" \
    -x ".venv/*" \
    -x "*/.venv/*" \
    -x "**/dist/*" \
    -x "**/build/*" \
    -x "**/dist-electron/*" \
    -x "**/.ds_store" \
    -x "**/__pycache__/*" \
    -x "*.pyc" \
    -x "Fedral_Project.zip" \
    -x "prepare-zip.sh" # Optional: hide this script from the recipient if preferred

if [ $? -eq 0 ]; then
    echo "------------------------------------------------"
    echo "✅ SUCCESS: $ZIP_NAME created!"
    echo "   Size: $(du -sh $ZIP_NAME | cut -f1)"
    echo "------------------------------------------------"
    echo "Share this file with your friend."
    echo "Tell them to extract it and run ./setup.sh first."
    echo "------------------------------------------------"
else
    echo "❌ Error: Failed to create zip file."
fi
