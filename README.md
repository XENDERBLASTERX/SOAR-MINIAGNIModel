# Anti-Gravity SOC Dashboard - Quick Start Guide

## 🚀 Starting the Dashboard

### 1. Start the API Server

```bash
cd /home/ender/mainprojfiles/finalbuild
uvicorn api_server:app --host 0.0.0.0 --port 8080 --reload
```

### 2. Access the Dashboard

Open your browser to: **http://localhost:8080**

## 📋 Current Status

**Server Running**: Port 8080  
**API Endpoints**: All operational  
**Current Stats**:
- Active Cases: 3
- Critical Threats: 0
- Malware Detections: 1
- Blocked IPs: 0

**Current Mode**: AUTO

## 🎯 Quick Demo Scenarios

### Scenario 1: Upload Malware Sample

1. Navigate to **Malware Scanner** (🔍 icon)
2. Drag and drop `eicar.txt` or click to browse
3. Watch the scan results appear
4. If malicious, a case is auto-created
5. Check **Cases** view to see the new case

### Scenario 2: Switch SOAR Mode

1. Navigate to **SOAR Control** (🎛️ icon)
2. Click on **SEMI-AUTOMATIC** mode card
3. Confirm the mode change
4. Notice header indicator updates
5. Navigate to **Approvals** to see the queue

### Scenario 3: Review Cases

1. Navigate to **Cases** (📁 icon)
2. Click **View** on any case
3. See detailed timeline and information
4. Click **Close** to close an open case
5. Check **Activity Logs** to see the closure event

## 🎨 Dashboard Features

### Navigation Menu

- **📊 Overview**: Real-time statistics and recent cases
- **📁 Cases**: Full case management table
- **🔍 Malware Scanner**: File upload and analysis
- **🎛️ SOAR Control**: Automation mode switching
- **✓ Approvals**: Pending action queue (SEMI mode)
- **📜 Activity Logs**: Complete audit trail

### SOAR Modes

- **🟢 AUTO**: Automatic blocking of critical threats
- **🟡 SEMI**: Analyst approval required before action
- **🔵 MANUAL**: Observe only, no automation

## 🧪 Testing Commands

### Test API Endpoints

```bash
# Get statistics
curl http://localhost:8080/api/stats

# Get all cases
curl http://localhost:8080/api/cases/

# Get current mode
curl http://localhost:8080/api/control/mode

# Change mode to SEMI
curl -X POST "http://localhost:8080/api/control/mode?mode=SEMI"

# Upload test file
curl -X POST http://localhost:8080/api/scan/file \
  -F "file=@eicar.txt"
```

## 📁 File Structure

```
/home/ender/mainprojfiles/finalbuild/
├── api_server.py          # Enhanced API with dashboard routes
├── api_cases.py           # Case management endpoints
├── api_scan.py            # File scanning endpoint
├── api_control.py         # SOAR mode control
├── api_approvals.py       # Approval workflow
├── static/
│   ├── index.html         # Dashboard HTML
│   ├── style.css          # Design system
│   └── app.js             # Frontend application
└── [existing SOAR files]  # Untouched backend logic
```

## 🎓 Key Features

✅ **Zero Backend Modifications**: All existing SOAR files untouched  
✅ **Real-time Updates**: Auto-refresh every 5 seconds  
✅ **Premium Design**: Dark theme with glassmorphism  
✅ **Full Workflow**: Scan → Detect → Case → Approve → Close  
✅ **Audit Trail**: Complete activity logging  
✅ **Responsive**: Works on all screen sizes  

## 🔧 Troubleshooting

### Port Already in Use

If port 8080 is busy, use a different port:
```bash
uvicorn api_server:app --host 0.0.0.0 --port 8888 --reload
```
Then access at: http://localhost:8888

### OpenSearch Connection

Ensure OpenSearch is running and accessible:
- Default: https://127.0.0.1:9200
- Credentials in `config.py`

### No Cases Showing

If the dashboard shows no cases:
1. Check OpenSearch is running
2. Verify `soc-cases` index exists
3. Run the Mini-SOAR engine to generate cases

## 📸 Screenshots

See the walkthrough document for visual examples:
- Overview Dashboard
- SOAR Control Panel
- Malware Scanner Interface

## 🌟 Demo Tips

1. **Start with Overview**: Show real-time stats
2. **Demo Malware Scanner**: Upload eicar.txt for instant results
3. **Show Mode Switching**: Demonstrate control over automation
4. **View Case Details**: Open modal to show timeline
5. **Check Activity Logs**: Prove full audit trail

---

**The Anti-Gravity SOC Dashboard is ready for your demo!** 🚀
