from fastapi import APIRouter
import requests
from config import *

router = APIRouter()

@router.get("/")
def get_cases():
    r = requests.get(
        f"{OPENSEARCH_BASE}/{OPENSEARCH_INDEX}/_search?size=100",
        auth=OPENSEARCH_AUTH,
        verify=VERIFY_SSL
    )
    hits = r.json().get("hits", {}).get("hits", [])
    return [h["_source"] for h in hits]

@router.post("/{case_id}/close")
def close_case_api(case_id: str):
    payload = {"doc": {"status": "CLOSED"}}
    requests.post(
        f"{OPENSEARCH_BASE}/{OPENSEARCH_INDEX}/_update/{case_id}",
        json=payload,
        auth=OPENSEARCH_AUTH,
        verify=VERIFY_SSL
    )
    return {"message": "Case closed"}
