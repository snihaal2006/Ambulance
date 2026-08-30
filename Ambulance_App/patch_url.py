import re

with open("lib/core/config/app_config.dart", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("https://slow-streets-help.loca.lt", "https://three-teeth-throw.loca.lt")

with open("lib/core/config/app_config.dart", "w", encoding="utf-8") as f:
    f.write(content)
