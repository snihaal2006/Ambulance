import re

with open("lib/data/services/backend_api_service.dart", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(",\n    'Bypass-Tunnel-Reminder': 'true'", "")

with open("lib/data/services/backend_api_service.dart", "w", encoding="utf-8") as f:
    f.write(content)
