import re

with open("src/main/java/com/pulseroute/backend/service/EmergencyService.java", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("EmergencyStatus.DECLINED", "EmergencyStatus.CANCELLED")

with open("src/main/java/com/pulseroute/backend/service/EmergencyService.java", "w", encoding="utf-8") as f:
    f.write(content)
