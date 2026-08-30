import re

with open("Ambulance_App/lib/viewmodels/app_view_model.dart", "r", encoding="utf-8") as f:
    content = f.read()

old_code = """    _activeCase!.vitals = vitals;
    
    // Simulate how long patient can hold (Stability Window)
    int stability = 120;
    if (isCritical) {"""

new_code = """    _activeCase!.vitals = vitals;
    
    final bool isCritical = ['CARDIAC_EMERGENCY', 'TRAUMA_ACCIDENT', 'MAJOR_TRAUMA', 'ACUTE_STROKE', 'SEVERE_BURNS', 'SEVERE_RESPIRATORY'].contains(_activeCase!.incidentType);
    
    // Simulate how long patient can hold (Stability Window)
    int stability = 120;
    if (isCritical) {"""

content = content.replace(old_code, new_code)

with open("Ambulance_App/lib/viewmodels/app_view_model.dart", "w", encoding="utf-8") as f:
    f.write(content)

with open("c:/Users/Nihaal S/java/Pulse_Route/lib/viewmodels/app_view_model.dart", "w", encoding="utf-8") as f:
    f.write(content)
