import os, time
EXT = [".locked",".crypt",".encrypted"]

def detect_ransomware(path="/home"):
    count, start = 0, time.time()
    for r,_,f in os.walk(path):
        for file in f:
            if any(file.endswith(e) for e in EXT):
                count += 1
        if count >= 5 and time.time()-start < 30:
            return True
    return False
