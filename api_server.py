from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api_cases import router as cases_router
from api_scan import router as scan_router
from api_control import router as control_router
from api_approvals import router as approvals_router
import requests
from config import *

app = FastAPI(title="Mini-SOAR API")

# CORS support for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Dashboard route
@app.get("/")
async def dashboard():
    return FileResponse("static/index.html")

# Statistics endpoint
@app.get("/api/stats")
def get_stats():
    try:
        # Get all cases
        r = requests.get(
            f"{OPENSEARCH_BASE}/{OPENSEARCH_INDEX}/_search?size=1000",
            auth=OPENSEARCH_AUTH,
            verify=VERIFY_SSL
        )
        hits = r.json().get("hits", {}).get("hits", [])
        cases = [h["_source"] for h in hits]
        
        # Calculate statistics
        active_cases = len([c for c in cases if c.get("status") == "OPEN"])
        critical_threats = len([c for c in cases if c.get("risk") == "CRITICAL" and c.get("status") == "OPEN"])
        malware_count = len([c for c in cases if "malware" in c.get("reason", "").lower()])
        blocked_ips = len([c for c in cases if c.get("status") == "CLOSED"])
        
        return {
            "active_cases": active_cases,
            "critical_threats": critical_threats,
            "malware_count": malware_count,
            "blocked_ips": blocked_ips,
            "total_cases": len(cases)
        }
    except Exception as e:
        return {
            "active_cases": 0,
            "critical_threats": 0,
            "malware_count": 0,
            "blocked_ips": 0,
            "total_cases": 0,
            "error": str(e)
        }

app.include_router(cases_router, prefix="/api/cases", tags=["Cases"])
app.include_router(scan_router, prefix="/api/scan", tags=["Scan"])
app.include_router(control_router, prefix="/api/control", tags=["Control"])
app.include_router(approvals_router, prefix="/api/approvals", tags=["Approvals"])
