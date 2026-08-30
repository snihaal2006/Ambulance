import re

with open("src/app.js", "r", encoding="utf-8") as f:
    content = f.read()

cloud_sync_code = """
  startCloudSync() {
    setInterval(async () => {
      try {
        const resAmb = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/ambulances');
        if (resAmb.ok) {
          const liveAmbs = await resAmb.json();
          const newFleet = [];
          for (const la of liveAmbs) {
            const existing = Store.fleet.find(a => a.id === la.ambulanceCode) || {
              id: la.ambulanceCode,
              registration: 'TN 38 AB 4521',
              type: 'ALS (Advanced Life Support)',
              typeCode: 'ALS',
              dutyStatus: 'ON_DUTY',
              baseStation: 'Coimbatore Hub',
              speed: 0
            };
            existing.lat = la.latitude;
            existing.lng = la.longitude;
            existing.status = la.status;
            existing.driverName = la.driverName || existing.driverName;
            newFleet.push(existing);
          }
          Store.fleet = newFleet;
          if (this.currentSection === 'overview') MapEngine.render(Store);
          this.updateTopBarStats();
        }

        const resCases = await fetch('https://closure-fantastic-pos-coleman.trycloudflare.com/api/emergencies/active');
        if (resCases.ok) {
          const liveCases = await resCases.json();
          const newCases = [];
          for (const lc of liveCases) {
            const existing = Store.activeCases.find(c => c.caseId === lc.caseNumber) || {
              caseId: lc.caseNumber,
              priority: lc.severity || 'CRITICAL',
              caller: { name: lc.callerName, phone: lc.callerPhone },
              patientDetails: { name: lc.patientName },
              location: { address: lc.incidentAddress, latitude: lc.latitude, longitude: lc.longitude },
              state: lc.status,
              assignedAmbulanceId: lc.assignedAmbulanceId == 1 ? 'AMB-1042' : 'AMB-1042',
              timeline: []
            };
            
            if (lc.status === 'ACCEPTED' && existing.state !== 'ACCEPTED') {
               existing.timeline.push({ step: 'ACCEPTED', label: 'Driver Accepted Case' });
            }
            existing.state = lc.status;
            newCases.push(existing);
          }
          Store.activeCases = newCases;
          if (this.currentSection === 'dispatch') {
             const container = document.getElementById('mainContentArea');
             if (container) Dispatch.render(container);
          }
          this.updateTopBarStats();
        }
      } catch (e) {
        console.error("Cloud Sync Error", e);
      }
    }, 2000);
  }
"""

# Insert inside the class, before updateTopBarStats
content = content.replace("  updateTopBarStats() {", cloud_sync_code + "\n  updateTopBarStats() {")

# Call startCloudSync in the constructor or init
content = content.replace("this.updateTopBarStats();", "this.updateTopBarStats();\n    this.startCloudSync();")

with open("src/app.js", "w", encoding="utf-8") as f:
    f.write(content)
