#!/bin/bash

# Compile Python Backend to Standalone Binary
echo "🐍 Compiling Python Backend..."

cd python

# Clean previous builds
rm -rf build dist

# Use PyInstaller to create a single-file executable
# We need to include hidden imports if they aren't detected
pyinstaller --clean --noconfirm --log-level=WARN \
    --name="backend-worker" \
    --onefile \
    --hidden-import=pandas \
    --hidden-import=sklearn \
    --hidden-import=sklearn.linear_model \
    --hidden-import=sklearn.model_selection \
    --hidden-import=sklearn.metrics \
    worker.py

echo "✅ Compilation Complete. Binary at python/dist/backend-worker"
