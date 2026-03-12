#!/bin/bash

# Simple test script for FL demo
# Run each component manually to verify everything works

echo "🧪 Testing FL Demo Components"
echo "=============================="
echo ""

# Test 1: Data generation
echo "Test 1: Checking synthetic data..."
if [ -f "demo/data/HospitalA/patients.csv" ]; then
    echo "✅ Data exists"
    wc -l demo/data/HospitalA/patients.csv
else
    echo "❌ Data missing - run: python3 demo/generate_data.py"
    exit 1
fi

echo ""

# Test 2: Server can start
echo "Test 2: Testing server startup..."
echo "Run in separate terminal: python3 demo/server.py"
echo "Then check: curl http://localhost:5000"
echo ""

# Test 3: Agent can run
echo "Test 3: Testing hospital agent..."
echo "Run in separate terminal: python3 demo/agent.py --hospital HospitalA"
echo ""

# Test 4: Dashboard
echo "Test 4: Testing dashboard..."
echo "Run: streamlit run demo/dashboard.py"
echo ""

echo "📋 Manual Testing Steps:"
echo "1. Terminal 1: python3 demo/server.py"
echo "2. Terminal 2: python3 demo/agent.py --hospital HospitalA"
echo "3. Terminal 3: python3 demo/agent.py --hospital HospitalB"  
echo "4. Terminal 4: python3 demo/agent.py --hospital HospitalC"
echo "5. Terminal 5: streamlit run demo/dashboard.py"
echo ""
echo "Dashboard will open at: http://localhost:8501"
