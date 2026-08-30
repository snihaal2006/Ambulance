import re

with open("src/app.js", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the loop to only push AMB-1042
old_loop = """          const newFleet = [];
          for (const la of liveAmbs) {
            const existing = Store.fleet.find(a => a.id === la.ambulanceCode) || {"""

new_loop = """          const newFleet = [];
          for (const la of liveAmbs) {
            if (la.ambulanceCode !== 'AMB-1042') continue; // Hide other mock ambulances
            const existing = Store.fleet.find(a => a.id === la.ambulanceCode) || {"""

content = content.replace(old_loop, new_loop)

with open("src/app.js", "w", encoding="utf-8") as f:
    f.write(content)
