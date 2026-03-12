#!/bin/bash

# Build script for Mac application (Optimized)
echo "🚀 Building Optimized FEDRAL.AI Hospital Agent for Mac..."

# Ensure we are in the right directory
cd "$(dirname "$0")"

# Install dependencies if needed
pip install pyinstaller pandas numpy requests scikit-learn

# Build application with exclusions to reduce size
echo "📦 Running PyInstaller (this may take a few minutes)..."
rm -rf build dist # Explicit clean
pyinstaller --onedir \
    --windowed \
    --clean \
    --noconfirm \
    --name="FEDRAL-Hospital-Agent" \
    --icon="app_icon.icns" \
    --exclude-module torch \
    --exclude-module tensorflow \
    --exclude-module tensorboard \
    --exclude-module cv2 \
    --exclude-module matplotlib \
    --exclude-module PIL \
    --exclude-module notebook \
    --exclude-module IPython \
    --exclude-module jedi \
    hospital_agent_enhanced.py

echo "✓ PyInstaller build complete!"

# Create DMG
echo "💿 Creating DMG Installer..."
mkdir -p dist/dmg_content
cp -R dist/FEDRAL-Hospital-Agent.app dist/dmg_content/

# Create a symlink to Applications
ln -s /Applications dist/dmg_content/Applications

# Remove old DMG if exists
rm -f dist/FEDRAL-Hospital-Agent-Installer.dmg

# Use hdiutil to create DMG
hdiutil create -volname "FEDRAL Agent Installer" -srcfolder dist/dmg_content -ov -format UDZO dist/FEDRAL-Hospital-Agent-Installer.dmg

echo "✨ DMG created: dist/FEDRAL-Agent-Installer.dmg"
echo "Application location: dist/FEDRAL-Agent.app"
echo ""
echo "Note: The app is unsigned. Users must right-click -> Open to run it."
