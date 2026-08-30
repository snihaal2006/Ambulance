import re

with open("src/app.js", "r", encoding="utf-8") as f:
    content = f.read()

old_loop = """          for (const la of liveAmbs) {
            if (la.ambulanceCode !== 'AMB-1042') continue; // Hide other mock ambulances"""

new_loop = """          for (const la of liveAmbs) {
            if (la.ambulanceCode !== 'AMB-1042') continue; // Hide other mock ambulances
            if (la.status === 'OFF_DUTY') continue; // Hide signed-out ambulances"""

content = content.replace(old_loop, new_loop)

with open("src/app.js", "w", encoding="utf-8") as f:
    f.write(content)
