import re

with open("src/intake.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("https://ten-worlds-fly.loca.lt/api", "http://localhost:8080/api")
content = content.replace(", 'Bypass-Tunnel-Reminder': 'true'", "")

with open("src/intake.js", "w", encoding="utf-8") as f:
    f.write(content)
