import re

with open("src/intake.js", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r"http://localhost:8080/api", "https://closure-fantastic-pos-coleman.trycloudflare.com/api", content)

with open("src/intake.js", "w", encoding="utf-8") as f:
    f.write(content)
