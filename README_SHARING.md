# FEDRAL.AI Project Guide

Welcome to the FEDRAL.AI Hospital Agent project! This project includes both a Web Dashboard and an Electron Desktop App.

## 🚀 Quick Start

Follow these steps to get everything running on your machine.

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18 or newer)
- **Python** (v3.9 or newer)

### 2. Setup
Open your terminal in the project folder and run the setup script. This will create a virtual environment and install all necessary dependencies for both the backend and frontend.

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Run the Project
You can choose to run either the web version or the desktop app.

#### 🌐 Web Version (Browser)
```bash
./run-web
```

#### 💻 Desktop App (Electron)
```bash
./run-electron
```

---

## 📁 Project Structure
- `backend/`: Python FastAPI service for AI analysis.
- `frontend/`: React + Vite web dashboard.
- `desktop-agent/`: Electron wrapper for the hospital agent.
- `demo/`: Sample datasets and simulation logs.

## 🛠️ Launch Commands
- `./run-web`: Starts backend + frontend and opens browser.
- `./run-electron`: Starts backend + Electron app.
