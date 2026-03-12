#!/bin/bash

# Deep Build & Sign Script for Mac (Apple Silicon)
# This mimics the "tinker" app approach but adds required deep signing for Electron.

echo "🚀 Starting Robust Build for M2/Apple Silicon..."

# 1. Clean previous builds
rm -rf dist-electron

# 2. Build React App (Vite)
echo "📦 Building Frontend..."
npm run build

# 3. Package Electron App (Unpacked Directory only)
echo "📂 Packaging Electron App (Unpacked)..."
npx electron-builder --mac --dir --arm64

# 4. Deep Sign the App (Crucial for M1/M2)
# Electron has multiple nested frameworks that MUST be signed.
APP_PATH="dist-electron/mac-arm64/FEDRAL AI Agent.app"

echo "🔐 Force Signing App Bundle deeply..."
# Remove existing signatures to be safe
codesign --remove-signature "$APP_PATH" 2>/dev/null
# Sign with ad-hoc identity, deep, force
codesign --force --deep --sign - "$APP_PATH"

echo "✓ App signed successfully (Ad-Hoc)."

# 5. Create DMG Manually (Like the old app)
echo "💿 Creating DMG manually..."
DMG_NAME="FEDRAL AI Agent-2.0.0-arm64.dmg"
DMG_PATH="dist-electron/$DMG_NAME"

# Create a temporary folder for DMG content
mkdir -p dist-electron/dmg_temp
cp -R "$APP_PATH" dist-electron/dmg_temp/
ln -s /Applications dist-electron/dmg_temp/Applications

# Build DMG using hdiutil
rm -f "$DMG_PATH"
hdiutil create -volname "FEDRAL Installer" -srcfolder dist-electron/dmg_temp -ov -format UDZO "$DMG_PATH"

# Cleanup
rm -rf dist-electron/dmg_temp

echo "✨ Robust DMG ready: $DMG_PATH"
