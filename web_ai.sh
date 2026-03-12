#!/bin/bash
# Web AI - Quick launcher for FEDRAL.AI Admin Dashboard
# Usage: ./web_ai.sh or add alias: alias "Web AI"="~/Desktop/Fedral/web_ai.sh"

echo "🚀 Launching FEDRAL.AI Admin Dashboard..."

# Check if frontend is already running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Frontend already running on http://localhost:5173"
else
    echo "⚙️  Starting frontend..."
    cd /Users/ankit/Desktop/Fedral/frontend
    npm run dev > /dev/null 2>&1 &
    sleep 3
fi

# Check if backend is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend already running on http://localhost:8000"
else
    echo "⚙️  Starting backend..."
    cd /Users/ankit/Desktop/Fedral
    source .venv/bin/activate
    cd backend
    uvicorn app.main:app --reload --port 8000 > /dev/null 2>&1 &
    sleep 3
fi

# Open in browser
echo "🌐 Opening FEDRAL.AI in your browser..."
open http://localhost:5173

echo ""
echo "✨ FEDRAL.AI is ready!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
