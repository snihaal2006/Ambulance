import re

with open("src/app.js", "r", encoding="utf-8") as f:
    content = f.read()

old_code = """              if (la.ambulanceCode !== 'AMB-1042') continue; // Hide other mock ambulances
              if (la.status === 'OFF_DUTY') continue; // Hide signed-out ambulances"""

new_code = """              if (la.ambulanceCode !== 'AMB-1042') continue; // Hide other mock ambulances"""

content = content.replace(old_code, new_code)

with open("src/app.js", "w", encoding="utf-8") as f:
    f.write(content)
