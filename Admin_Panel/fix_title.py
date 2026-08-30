import re

with open("src/app.js", "r", encoding="utf-8") as f:
    content = f.read()

old_case = """              location: { address: lc.incidentAddress, latitude: lc.latitude, longitude: lc.longitude },
              state: lc.status,
              assignedAmbulanceId: lc.assignedAmbulanceId == 1 ? 'AMB-1042' : 'AMB-1042',
              timeline: [],
              etaMinutes: 5,
              distanceKm: 2.5
            };"""

new_case = """              title: lc.emergencyType || 'EMERGENCY',
              location: { address: lc.incidentAddress, latitude: lc.latitude, longitude: lc.longitude },
              state: lc.status,
              assignedAmbulanceId: lc.assignedAmbulanceId == 1 ? 'AMB-1042' : 'AMB-1042',
              timeline: [],
              etaMinutes: 5,
              distanceKm: 2.5
            };"""

content = content.replace(old_case, new_case)

with open("src/app.js", "w", encoding="utf-8") as f:
    f.write(content)
