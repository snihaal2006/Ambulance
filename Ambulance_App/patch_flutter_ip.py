import re

with open("lib/core/config/app_config.dart", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("172.18.234.210", "10.129.100.216")

with open("lib/core/config/app_config.dart", "w", encoding="utf-8") as f:
    f.write(content)
