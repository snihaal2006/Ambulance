import re

with open("src/intake.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("https://slow-streets-help.loca.lt", "https://three-teeth-throw.loca.lt")

with open("src/intake.js", "w", encoding="utf-8") as f:
    f.write(content)
