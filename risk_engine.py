def calculate_risk(severity, attempts, intel, malware, vt):
    """
    FINAL DEMO LOGIC:
    - Malware OR VirusTotal hit = CRITICAL
    - Brute force escalates by attempts
    """

    # 🔥 Malware = instant CRITICAL
    if malware or vt:
        return "CRITICAL"

    score = severity + intel

    # brute force escalation
    if attempts >= 5:
        score += 10

    if score >= 15:
        return "CRITICAL"
    if score >= 10:
        return "HIGH"
    if score >= 5:
        return "MEDIUM"
    return "LOW"
