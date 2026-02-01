KEYWORDS = ["urgent","verify account","click link","reset password"]

def is_phishing(subject, body):
    return sum(k in (subject+body).lower() for k in KEYWORDS) >= 2
