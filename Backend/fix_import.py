import re

with open("src/main/java/com/pulseroute/backend/controller/AmbulanceController.java", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("com.pulseroute.backend.model.AmbulanceStatus", "com.pulseroute.backend.entity.AmbulanceStatus")

with open("src/main/java/com/pulseroute/backend/controller/AmbulanceController.java", "w", encoding="utf-8") as f:
    f.write(content)
    
with open("src/main/java/com/pulseroute/backend/service/AmbulanceService.java", "r", encoding="utf-8") as f:
    content2 = f.read()

content2 = content2.replace("com.pulseroute.backend.model.AmbulanceStatus", "com.pulseroute.backend.entity.AmbulanceStatus")

with open("src/main/java/com/pulseroute/backend/service/AmbulanceService.java", "w", encoding="utf-8") as f:
    f.write(content2)
