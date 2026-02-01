from fastapi import APIRouter, UploadFile, File
import os, hashlib
from virustotal_engine import vt_check
from case_manager import create_case

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def sha256sum(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            h.update(chunk)
    return h.hexdigest()

@router.post("/file")
async def scan_file(file: UploadFile = File(...)):
    path = f"{UPLOAD_DIR}/{file.filename}"
    with open(path, "wb") as f:
        f.write(await file.read())

    sha256 = sha256sum(path)
    vt = vt_check(sha256)

    result = {
        "filename": file.filename,
        "sha256": sha256,
        "malicious": vt
    }

    if vt:
        case_id = create_case(
            ip="manual-upload",
            severity=15,
            risk="CRITICAL",
            reason="Manual malware upload"
        )
        result["case_id"] = case_id

    return result
