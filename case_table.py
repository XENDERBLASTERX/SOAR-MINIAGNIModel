import requests
import urllib3
from config import *

# Silence SSL warnings (self-signed OpenSearch)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

r = requests.get(
    f"{OPENSEARCH_BASE}/{OPENSEARCH_INDEX}/_search?size=50",
    auth=OPENSEARCH_AUTH,
    verify=VERIFY_SSL
)

hits = r.json().get("hits", {}).get("hits", [])

print("\nCASE_ID | IP | SEVERITY | RISK | STATUS")
print("-" * 90)

for h in hits:
    s = h.get("_source", {})

    case_id  = s.get("case_id", "N/A")
    ip       = s.get("ip", "N/A")
    severity = s.get("severity", "N/A")
    risk     = s.get("risk", "N/A")
    status   = s.get("status", "N/A")

    print(f"{case_id} | {ip} | {severity} | {risk} | {status}")
