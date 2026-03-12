#!/bin/bash
# Fix for "App is damaged" or "Cannot be opened" on macOS
# This removes the quarantine attribute assigned by Gatekeeper

APP_PATH="/Applications/FEDRAL AI Agent.app"

if [ ! -d "$APP_PATH" ]; then
    echo "Application not found in /Applications"
    echo "Please move the app to Applications folder first."
    exit 1
fi

echo "Fixing Gatekeeper issues for FEDRAL AI Agent..."
sudo xattr -cr "$APP_PATH"

echo "Done! You can now open the app."
