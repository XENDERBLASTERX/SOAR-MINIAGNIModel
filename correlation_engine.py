from collections import defaultdict
import time

WINDOW = 300  # 5 minutes
attempts = defaultdict(int)
last_seen = {}

def track_attempt(ip):
    now = time.time()

    if ip in last_seen and now - last_seen[ip] > WINDOW:
        attempts[ip] = 0

    attempts[ip] += 1
    last_seen[ip] = now

    return attempts[ip]
