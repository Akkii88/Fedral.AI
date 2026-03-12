#!/bin/bash

# Build script for Windows executable
echo "Building FEDRAL.AI Hospital Agent for Windows..."

# Install dependencies if needed
pip install pyinstaller pandas numpy requests scikit-learn

# Build executable
pyinstaller --onefile \
    --windowed \
    --name="FEDRAL-Agent-Setup" \
    hospital_agent_enhanced.py

echo "✓ Build complete!"
echo "Executable location: dist/FEDRAL-Agent-Setup.exe"
echo ""
echo "Distribute this file to hospitals running Windows."
