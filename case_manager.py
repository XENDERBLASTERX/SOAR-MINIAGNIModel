import uuid
import datetime
import requests
from config import *

def find_open_case(ip):
    query = {
        "query": {
            "bool": {
                "must": [
                    {"match": {"ip": ip}},
                    {"match": {"status": "OPEN"}}
                ]
            }
        }
    }

    r = requests.get(
        f"{OPENSEARCH_BASE}/{OPENSEARCH_INDEX}/_search",
        json=query,
        auth=OPENSEARCH_AUTH,
        verify=VERIFY_SSL
    )

    hits = r.json().get("hits", {}).get("hits", [])
    if hits:
        return hits[0]["_source"]["case_id"]

    return None


def create_case(ip, severity, risk, reason):
    # 🔥 DEDUPLICATION
    existing = find_open_case(ip)
    if existing:
        print(f"[CASE] Existing OPEN case found for {ip}: {existing}")
        return existing

    case_id = uuid.uuid4().hex

    payload = {
        "case_id": case_id,
        "ip": ip,
        "severity": severity,
        "risk": risk,
        "reason": reason,
        "status": "OPEN",
        "time": datetime.datetime.utcnow().isoformat()
    }

    requests.post(
        f"{OPENSEARCH_BASE}/{OPENSEARCH_INDEX}/_doc",
        json=payload,
        auth=OPENSEARCH_AUTH,
        verify=VERIFY_SSL
    )

    print(f"[CASE] Created case {case_id}")
    return case_id


def close_case(case_id, note="Automated containment executed"):
    # First, find the document _id by searching for the case_id
    query = {
        "query": {
            "match": {
                "case_id": case_id
            }
        }
    }
    
    try:
        # Search for the document
        r = requests.get(
            f"{OPENSEARCH_BASE}/{OPENSEARCH_INDEX}/_search",
            json=query,
            auth=OPENSEARCH_AUTH,
            verify=VERIFY_SSL
        )
        
        hits = r.json().get("hits", {}).get("hits", [])
        if not hits:
            print(f"[CASE ERROR] Case {case_id} not found in OpenSearch")
            return
        
        # Get the actual document _id
        doc_id = hits[0]["_id"]
        
        # Now update using the document _id
        payload = {
            "doc": {
                "status": "CLOSED",
                "closure_note": note,
                "closed_time": datetime.datetime.utcnow().isoformat()
            }
        }
        
        update_response = requests.post(
            f"{OPENSEARCH_BASE}/{OPENSEARCH_INDEX}/_update/{doc_id}",
            json=payload,
            auth=OPENSEARCH_AUTH,
            verify=VERIFY_SSL
        )
        
        if update_response.status_code == 200:
            print(f"[CASE] ✓ Closed case {case_id} (doc_id: {doc_id})")
        else:
            print(f"[CASE ERROR] Failed to close case {case_id}: {update_response.text}")
    
    except Exception as e:
        print(f"[CASE ERROR] Exception closing case {case_id}: {e}")
