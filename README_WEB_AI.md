# 🚀 Web AI Quick Start

## Quick Launch Options

### Option 1: Direct Script (Recommended)
```bash
cd ~/Desktop/Fedral
./web_ai.sh
```

### Option 2: Create Terminal Alias
Add this to your `~/.zshrc` file:
```bash
alias webai="~/Desktop/Fedral/web_ai.sh"
```

Then reload your terminal:
```bash
source ~/.zshrc
```

Now you can just type:
```bash
webai
```

### Option 3: Create a Desktop Shortcut
1. Open **Automator** (Applications → Automator)
2. Create new **Application**
3. Add "Run Shell Script" action
4. Paste: `/Users/ankit/Desktop/Fedral/web_ai.sh`
5. Save as "Web AI" on Desktop
6. Double-click the icon to launch!

## What It Does

The `web_ai.sh` script:
- ✅ Checks if frontend/backend are running
- 🚀 Starts them if needed
- 🌐 Opens FEDRAL.AI in your browser
- 📊 Shows you all the URLs

## URLs

- **Admin Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **FL Demo Dashboard**: http://localhost:8501 (if running)

## Stopping Services

To stop all services:
```bash
pkill -f "npm run dev"
pkill -f "uvicorn"
pkill -f "streamlit"
```

---

**Enjoy your FEDRAL.AI platform!** 🎉
