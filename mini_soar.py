import json
import time
import urllib3
urllib3.disable_warnings()

from config import *
from threat_intel import check_ip
from malware_detector import detect_malware
from virustotal_engine import vt_check
from correlation_engine import track_attempt
from risk_engine import calculate_risk
from case_manager import create_case, close_case
from notifier import send_alert
from response import block_ip, lock_user, revoke_sessions

blocked_ips = set()

def run():
    print("[SOAR] Mini-SOAR engine started")

    buffer = ""

    with open(ALERT_FILE, "r") as f:
        f.seek(0, 2)  # tail file

        while True:
            line = f.readline()
            if not line:
                time.sleep(0.5)
                continue

            line = line.strip()

            # ignore empty / non-json lines
            if not line.startswith("{"):
                continue

            buffer += line

            try:
                alert = json.loads(buffer)
                buffer = ""   # reset after successful parse
                process(alert)

            except json.JSONDecodeError:
                # wait for remaining lines of JSON
                buffer += " "
                continue

            except Exception as e:
                print("[SOAR ERROR]", e)
                buffer = ""

def process(alert):
    try:
        severity = int(alert.get("rule", {}).get("level", 0))
        ip = alert.get("data", {}).get("srcip")
        user = alert.get("data", {}).get("dstuser")
    except:
        return

    if not ip:
        return

    # ignore already blocked IPs
    if ip in blocked_ips:
        return

    print(f"\n[SOAR] Alert received from {ip} (severity={severity})")

    attempts = track_attempt(ip)
    print(f"[SOAR] Failed attempts from {ip}: {attempts}")

    intel_score, intel_reason, _, _ = check_ip(ip)
    malware, _ = detect_malware(alert)
    vt = vt_check(alert.get("data", {}).get("sha256", ""))

    risk = calculate_risk(severity, attempts, intel_score, malware, vt)
    print(f"[SOAR] Risk evaluated as {risk}")

    reason = f"Brute force / malware activity ({attempts} events)"

    case_id = create_case(ip, severity, risk, reason)

    # send mail only once per attack
    if attempts == 1 or risk == "CRITICAL":
        send_alert(
            case_id=case_id,
            ip=ip,
            user=user,
            severity=severity,
            risk=risk,
            intel_reason=intel_reason,
            malware_flag=malware,
            vt_flag=vt,
            correlation_reason=reason
        )

    if RESPONSE_MODE == "AUTO" and risk == AUTO_BLOCK_RISK:
        print(f"[SOAR] Auto-response triggered for {ip}")

        block_ip(ip)
        print(f"[RESPONSE] IP blocked: {ip}")

        if user:
            lock_user(user)
            revoke_sessions(user)

        close_case(case_id)
        blocked_ips.add(ip)

if __name__ == "__main__":
    run()
