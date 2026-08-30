import re

with open("Ambulance_App/lib/viewmodels/app_view_model.dart", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("case 'TRAUMA_ACCIDENT':", "case 'TRAUMA_ACCIDENT':\n      case 'ROAD_ACCIDENT':")

with open("Ambulance_App/lib/viewmodels/app_view_model.dart", "w", encoding="utf-8") as f:
    f.write(content)

with open("c:/Users/Nihaal S/java/Pulse_Route/lib/viewmodels/app_view_model.dart", "w", encoding="utf-8") as f:
    f.write(content)
