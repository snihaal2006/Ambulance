import re

with open("lib/core/config/app_config.dart", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("https://ten-worlds-fly.loca.lt/api", "http://172.18.234.210:8080/api")

with open("lib/core/config/app_config.dart", "w", encoding="utf-8") as f:
    f.write(content)
