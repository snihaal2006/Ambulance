import re

with open("src/intake.js", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("await fetch('https://three-teeth-throw.loca.lt/api/emergencies/' + res.id + '/dispatch', { method: 'POST' });", "await fetch('https://three-teeth-throw.loca.lt/api/emergencies/' + res.id + '/dispatch', { method: 'POST', headers: { 'Bypass-Tunnel-Reminder': 'true' } });")

with open("src/intake.js", "w", encoding="utf-8") as f:
    f.write(content)
