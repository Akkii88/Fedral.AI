# 🏥 FEDRAL.AI Hospital Agent - Quick Start Guide

## For Hospital Staff (Non-Technical)

### What This Does
This app allows your hospital to contribute to AI research **without sharing patient data**. Only anonymous model statistics are sent to FEDRAL.AI.

---

## Installation

### Windows
1. Download `HospitalAgent.exe`
2. Copy to your desktop
3. Double-click to run

### Mac
1. Download `HospitalAgent.app`
2. Copy to Applications folder
3. Double-click to run

**No installation required!**

---

## How to Use (3 Steps)

### Step 1: Open the App
Double-click the Hospital Agent icon

### Step 2: Select Your CSV File
Click "Select CSV File" and choose your patient data file

### Step 3: Done!
The app will:
- Train a model on your local computer
- Send only model statistics (not patient data)
- Show you a success message

**Total time: ~1 minute**

---

## CSV File Format

Your CSV file should have these columns:

```csv
patient_id,age,gender,biomarker1,biomarker2,biomarker3,comorbidity_score,outcome
1,45,M,0.5,1.2,0.8,2,1
2,50,F,1.1,0.8,1.3,1,0
...
```

**Required columns**:
- `age` - Patient age
- `biomarker1` - First biomarker value
- `biomarker2` - Second biomarker value
- `outcome` - 0 or 1 (negative/positive)

**Optional columns**:
- `patient_id`, `gender`, `biomarker3`, `comorbidity_score`

---

## Privacy & Security

### What Gets Sent to FEDRAL.AI
✅ Model weights (5 numbers like `[0.5, 1.2, -0.3]`)  
✅ Number of patients (e.g., "250")  
✅ Model accuracy (e.g., "85%")

### What NEVER Gets Sent
❌ Patient names  
❌ Patient IDs  
❌ Medical records  
❌ Any identifiable information

**Your patient data stays on your computer!**

---

## Troubleshooting

### "Cannot connect to server"
- Check your internet connection
- The app will save your update locally and send it later

### "CSV missing required columns"
- Make sure your CSV has: `age`, `biomarker1`, `biomarker2`, `outcome`
- Contact FEDRAL.AI support for help formatting your data

### "Not enough data"
- You need at least 10 patient records
- Remove any rows with missing values

---

## Support

**Email**: support@fedral.ai  
**Phone**: 1-800-FEDRAL  
**Website**: https://fedral.ai/support

---

## How Often Should I Run This?

- **First time**: When you join FEDRAL.AI
- **Monthly**: When you have new patient data
- **After updates**: When your data changes significantly

---

## What Happens Next?

1. Your contribution is added to the global model
2. FEDRAL.AI dashboard shows your hospital's participation
3. You receive a monthly report showing:
   - Your contribution to global accuracy
   - Number of hospitals participating
   - Latest research findings

---

## Benefits for Your Hospital

✅ **Contribute to Research**: Help advance medical AI  
✅ **Privacy Protected**: Patient data never leaves your facility  
✅ **No Cost**: Free to participate  
✅ **Recognition**: Listed as a contributing hospital  
✅ **Access**: Get early access to improved models

---

## Technical Details (For IT Staff)

**System Requirements**:
- Windows 10+ or macOS 10.14+
- 2GB RAM
- 100MB disk space
- Internet connection (for submitting updates)

**Network**:
- Outbound HTTPS to `fedral.ai` (port 443)
- No inbound connections required
- Works behind corporate firewalls

**Data Processing**:
- All training happens locally
- No cloud processing
- HIPAA compliant

---

## Questions?

**Q: Is this HIPAA compliant?**  
A: Yes! Patient data never leaves your computer.

**Q: How long does it take?**  
A: About 30-60 seconds per run.

**Q: Can I run this offline?**  
A: Yes! Training happens offline. Updates are sent when you're online.

**Q: What if I make a mistake?**  
A: Just run the app again with the correct file.

**Q: Can I see what's being sent?**  
A: Yes! Check the `local_model_[HospitalName].pkl` file created after each run.

---

## Thank You!

Thank you for contributing to federated learning and advancing medical AI research while protecting patient privacy.

**FEDRAL.AI Team**
