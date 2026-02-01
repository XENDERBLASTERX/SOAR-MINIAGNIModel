def check_ip(ip):
    if not ip:
        return 0, "No IP", "N/A", "N/A"

    # 🔥 DEMO MODE: treat internal IPs as suspicious
    score = 2
    reason = "Internal IP brute force (demo mode)"

    return score, reason, "Local", "Internal Network"
