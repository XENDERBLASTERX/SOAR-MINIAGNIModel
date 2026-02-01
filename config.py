ALERT_FILE = "/var/ossec/logs/alerts/alerts.json"

IGNORE_LEVEL = 5
MONITOR_LEVEL = 9
TRIGGER_LEVEL = 10

RESPONSE_MODE = "AUTO"   # AUTO | SEMI | MANUAL
AUTO_BLOCK_RISK = "CRITICAL"

OPENSEARCH_BASE = "https://127.0.0.1:9200"
OPENSEARCH_INDEX = "soc-cases"
OPENSEARCH_AUTH = ("admin", "kali")
VERIFY_SSL = False

ENABLE_EMAIL = True
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_SENDER = "theimmortalfury01@gmail.com"
EMAIL_PASSWORD = "rgayxuxjpexhjpmd"
EMAIL_RECEIVER = "hemanth.vijayaraj@gmail.com"

ABUSEIPDB_KEY = "5d3246acedfbec21ffe5143f46c9d2e1ec3860ed7df1d5476e55895d526411e13fc1ee2d29657bd1"
IPQS_KEY = "1mlahpRZtlsiYOMGSXqf2BV9vXxPSFhW"

VIRUSTOTAL_API_KEY = "82ea961e78b86bfa00d5c13065ee927aa46f3dcd081cc9f49c7b0bec396a47dc"
