import os

with open("src/main/java/com/pulseroute/backend/controller/AmbulanceController.java", "r", encoding="utf-8-sig") as f:
    content = f.read()
    
with open("src/main/java/com/pulseroute/backend/controller/AmbulanceController.java", "w", encoding="utf-8") as f:
    f.write(content)
