import re

with open("src/intake.js", "r", encoding="utf-8") as f:
    content = f.read()

pattern = r"  submitIntakeAndCreateCase\(\) \{.*?\n      console\.error\('Error during emergency call initiation:', err\);\n    \}\n  \}"
match = re.search(pattern, content, re.DOTALL)
if match:
    print("Match found, replacing...")
    
new_method = """  async submitIntakeAndCreateCase() {
    try {
      if (this.callTimerInterval) clearInterval(this.callTimerInterval);

      const callerName = document.getElementById('intakeCallerName')?.value || 'Emergency Caller';
      const callerPhone = document.getElementById('intakeCallerPhone')?.value || '+91 94440 11223';
      const alternatePhone = document.getElementById('intakeAlternatePhone')?.value || '';
      const callerType = document.getElementById('intakeCallerType')?.value || 'Bystander';

      const patientName = document.getElementById('intakePatientName')?.value || 'Ramesh Kumar';
      const patientAge = document.getElementById('intakePatientAge')?.value || '34 yrs';
      const patientGender = document.getElementById('intakePatientGender')?.value || 'Male';
      const patientCount = document.getElementById('intakePatientCount')?.value || '1';
      const avpu = document.getElementById('intakeAvpu')?.value || 'Pain (P)';
      const condition = document.getElementById('intakeCondition')?.value || 'Two-wheeler collision, active limb bleed';
      const breathing = document.getElementById('intakeBreathing')?.value || 'Labored';
      const severeBleeding = document.getElementById('intakeBleeding')?.value || 'Yes';

      const address = document.getElementById('intakeAddress')?.value || 'NSR Road, Sai Baba Colony, Coimbatore';
      const landmark = document.getElementById('intakeLandmark')?.value || 'Near Avila Convent & Ganga Hospital';
      const accessNotes = document.getElementById('intakeAccessNotes')?.value || 'Peak evening traffic on NSR Road';

      const min = String(Math.floor(this.callDurationSeconds / 60)).padStart(2, '0');
      const sec = String(this.callDurationSeconds % 60).padStart(2, '0');

      // 1. Calculate closest ambulance in Sai Baba Colony
      const availableAmbulances = Store.fleet.filter(a => a.dutyStatus === 'ON_DUTY');
      let nearestAmbulance = availableAmbulances[0];
      let shortestDist = 999;

      const targetLat = this.selectedCoords?.lat || 11.0270;
      const targetLng = this.selectedCoords?.lng || 76.9460;

      availableAmbulances.forEach(amb => {
        const dist = Store._calculateHaversineDistance(targetLat, targetLng, amb.lat, amb.lng);
        if (dist < shortestDist && amb.status === 'AVAILABLE') {
          shortestDist = dist;
          nearestAmbulance = amb;
        }
      });

      const calculatedEta = Math.max(2, Math.round(shortestDist * 2.2 + 1));
      
      let backendCaseId = null;
      try {
          const req = await fetch('http://localhost:8080/api/emergencies', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  callerName: callerName,
                  callerPhone: callerPhone,
                  patientName: patientName,
                  emergencyType: this.selectedCategory || 'ROAD_ACCIDENT',
                  severity: 'CRITICAL',
                  incidentAddress: address,
                  latitude: targetLat,
                  longitude: targetLng,
                  notes: condition + ". " + accessNotes
              })
          });
          if(!req.ok) throw new Error('Backend failed');
          const res = await req.json();
          backendCaseId = res.caseNumber;
          await fetch('http://localhost:8080/api/emergencies/' + res.id + '/dispatch', { method: 'POST' });
      } catch(err) {
          alert('BACKEND UNAVAILABLE');
          return;
      }

      // 2. Create case object
      const newCase = Store.createCaseFromIntake({
        category: this.selectedCategory,
        callerName,
        callerPhone,
        alternatePhone,
        callerType,
        patientName,
        patientAge,
        patientGender,
        patientCount,
        avpu,
        condition,
        breathing,
        severeBleeding,
        address,
        landmark,
        accessNotes,
        latitude: targetLat,
        longitude: targetLng,
        callDuration: ${min}:,
        assignedAmbulanceId: nearestAmbulance?.id || 'AMB-1042',
        assignedDriver: {
          id: nearestAmbulance?.driverId || 'DRV-1042',
          name: nearestAmbulance?.driverName || 'Arun Kumar',
          phone: nearestAmbulance?.driverPhone || '+91 98401 22345',
          reg: nearestAmbulance?.registration || 'TN 38 AB 4521'
        },
        distanceKm: shortestDist < 900 ? shortestDist : 1.2,
        etaMinutes: calculatedEta,
        state: 'PENDING_DRIVER_ACCEPTANCE'
      });
      
      newCase.caseId = backendCaseId || newCase.caseId;

      this.currentPendingCaseId = newCase.caseId;

      if (nearestAmbulance) {
        nearestAmbulance.status = 'DISPATCHING';
        nearestAmbulance.activeCaseId = newCase.caseId;
      }

      // 4. DISPLAY THE LIVE OUTGOING EMERGENCY CALL SCREEN
      this.renderLiveOutgoingEmergencyCallPage(newCase.caseId, nearestAmbulance, newCase);

      // 5. Start real-time polling listener
      this._startRealtimeDriverSync(newCase.caseId);

    } catch (err) {
      console.error('Error during emergency call initiation:', err);
    }
  }"""

content = re.sub(pattern, new_method, content, flags=re.DOTALL)
with open("src/intake.js", "w", encoding="utf-8") as f:
    f.write(content)
