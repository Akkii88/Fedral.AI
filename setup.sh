#!/bin/bash

# setup.sh - First-time environment setup for FEDRAL.AI
# Run this once after extracting the project zip.

echo "------------------------------------------------"
echo "🛠️  INITIALIZING FEDRAL.AI ENVIRONMENT"
echo "------------------------------------------------"

# 1. Setup Python Virtual Environment
echo "🐍 Setting up Python environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt
if [ $? -eq 0 ]; then
    echo "   ✅ Python dependencies installed."
else
    echo "   ⚠️  Error installing some Python dependencies. Please check requirements.txt."
fi

# 2. Setup Frontend Dependencies
echo "🌐 Setting up Frontend (Web)..."
if [ -d "frontend" ]; then
    cd frontend
    npm install
    cd ..
    echo "   ✅ Frontend dependencies installed."
else
    echo "   ⚠️  Frontend directory not found!"
fi

# 3. Setup Desktop Agent Dependencies
echo "💻 Setting up Desktop Agent (Electron)..."
if [ -d "desktop-agent" ]; then
    cd desktop-agent
    npm install
    cd ..
    echo "   ✅ Desktop Agent dependencies installed."
else
    echo "   ⚠️  Desktop Agent directory not found!"
fi

echo "------------------------------------------------"
echo "✨ SETUP COMPLETE!"
echo "------------------------------------------------"
echo "You can now run the project using:"
echo "👉 Web Version:     ./run-web"
echo "👉 Desktop App:     ./run-electron"
echo "------------------------------------------------"
