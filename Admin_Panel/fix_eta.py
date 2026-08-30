import re

with open("src/app.js", "r", encoding="utf-8") as f:
    content = f.read()

old_case = """              location: { address: lc.incidentAddress, latitude: lc.latitude, longitude: lc.longitude },
              state: lc.status,
              assignedAmbulanceId: lc.assignedAmbulanceId == 1 ? 'AMB-1042' : 'AMB-1042',
              timeline: []
            };"""

new_case = """              location: { address: lc.incidentAddress, latitude: lc.latitude, longitude: lc.longitude },
              state: lc.status,
              assignedAmbulanceId: lc.assignedAmbulanceId == 1 ? 'AMB-1042' : 'AMB-1042',
              timeline: [],
              etaMinutes: 5,
              distanceKm: 2.5
            };
            
            // Calculate real distance if we have ambulance
            const amb = Store.fleet.find(a => a.id === existing.assignedAmbulanceId);
            if (amb && existing.location.latitude && amb.lat) {
               // Haversine
               const R = 6371; // km
               const dLat = (existing.location.latitude - amb.lat) * Math.PI / 180;
               const dLon = (existing.location.longitude - amb.lng) * Math.PI / 180;
               const lat1 = amb.lat * Math.PI / 180;
               const lat2 = existing.location.latitude * Math.PI / 180;
               const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                         Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
               const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
               existing.distanceKm = (R * c).toFixed(1);
               existing.etaMinutes = Math.max(1, Math.round((existing.distanceKm / 40) * 60)); // assuming 40 km/h
            }
"""

content = content.replace(old_case, new_case)

# Also fix the "UNDEFINED" patient name or emergency type if it's missing in dispatch
# In dispatch.js it uses c.patientDetails?.name, let's make sure it's populated.
# The user screenshot shows "ER-2026-27667 CRITICAL UNDEFINED"
# The undefined is probably c.patientDetails.name which is missing or something.

with open("src/app.js", "w", encoding="utf-8") as f:
    f.write(content)
