import requests
from config import VIRUSTOTAL_API_KEY

def vt_check(sha256):
    try:
        r = requests.get(
            f"https://www.virustotal.com/api/v3/files/{sha256}",
            headers={"x-apikey": VIRUSTOTAL_API_KEY},
            timeout=10
        )
        stats = r.json()["data"]["attributes"]["last_analysis_stats"]
        return stats["malicious"] > 0
    except:
        return False
