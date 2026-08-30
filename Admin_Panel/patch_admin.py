import re

with open("src/intake.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("http://localhost:8080/api", "https://slow-streets-help.loca.lt/api")
content = content.replace("'Content-Type': 'application/json'", "'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true'")

with open("src/intake.js", "w", encoding="utf-8") as f:
    f.write(content)
