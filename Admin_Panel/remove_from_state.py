import re

with open("src/state.js", "r", encoding="utf-8") as f:
    content = f.read()
    
# Remove the polling loop from state.js
content = re.sub(r'startCloudSync\(\) \{.*?\n\s+\}', '', content, flags=re.DOTALL)
content = content.replace("Store.startCloudSync();", "")

with open("src/state.js", "w", encoding="utf-8") as f:
    f.write(content)
