#!/bin/bash

# FEDRAL.AI Local Demo - Quick Start Script

echo "🏥 FEDRAL.AI - Local Federated Learning Demo"
echo "=============================================="
echo ""

# Check if data exists
if [ ! -d "demo/data/HospitalA" ]; then
    echo "📊 Generating synthetic hospital data..."
    python3 demo/generate_data.py
    echo ""
fi

echo "🚀 Starting demo components..."
echo ""

# Start server in background
echo "1️⃣  Starting central FL server..."
python3 demo/server.py > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

# Run hospital agents
echo "2️⃣  Running hospital agents..."
echo "   - HospitalA training..."
python3 demo/agent.py --hospital HospitalA &
sleep 1

echo "   - HospitalB training..."
python3 demo/agent.py --hospital HospitalB &
sleep 1

echo "   - HospitalC training..."
python3 demo/agent.py --hospital HospitalC &

# Wait for agents to complete
sleep 8

echo ""
echo "3️⃣  Launching dashboard..."
echo ""
echo "✅ Demo ready! Dashboard opening at http://localhost:8501"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start dashboard (this will block)
streamlit run demo/dashboard.py

# Cleanup on exit
kill $SERVER_PID 2>/dev/null
