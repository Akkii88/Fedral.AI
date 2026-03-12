#!/bin/bash

# start_hospital_system.sh - Robust launcher for FEDRAL Hospital Agent

echo "------------------------------------------------"
echo "🚀 INITIALIZING FEDRAL HOSPITAL SYSTEM"
echo "------------------------------------------------"

# 1. Cleanup existing processes (Safe cleanup)
echo "🛑 Stopping conflicting services..."
pkill -f "electron" || true
# Only kill node if it's our dev server (vite/concurrently)
# pkill -f "node" || true 
lsof -ti:5174 | xargs kill -9 2>/dev/null || true

# 2. Start Backend if not already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend already running on port 8000"
else
    echo "🌐 Starting FEDRAL Backend (Port 8000)..."
    export PYTHONPATH=$PYTHONPATH:$(pwd)/backend
    ./.venv/bin/python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 > backend.log 2>&1 &
    BACKEND_PID=$!
    sleep 2
fi

# 3. Start Hospital Agent App
echo "💻 Starting Hospital Agent App..."
cd desktop-agent

# Trap exit to cleanup ONLY if we started the backend here
trap "if [ ! -z '$BACKEND_PID' ]; then echo '👋 Cleaning up backend...'; kill $BACKEND_PID; fi" EXIT

npm run electron:dev
