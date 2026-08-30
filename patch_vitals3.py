import re

with open("Ambulance_App/lib/viewmodels/app_view_model.dart", "r", encoding="utf-8") as f:
    content = f.read()

old_vitals = """    // 2. Simulate Vitals based on Incident Type (this would normally come from hardware)
    final bool isCritical = _activeCase!.incidentType == 'CARDIAC_EMERGENCY' || _activeCase!.incidentType == 'TRAUMA_ACCIDENT';
    final vitals = {
      'hr': isCritical ? 135 : 85,
      'sys_bp': isCritical ? 85 : 120,
      'spo2': isCritical ? 88 : 98,
    };
    _activeCase!.vitals = vitals;"""

new_vitals = """    // 2. Parse Admin's Text Condition Notes to Dynamically Influence Vitals and AI Routing
    final condition = _activeCase!.complaint.toLowerCase();
    final vitals = {
      'hr': 85,
      'sys_bp': 120,
      'spo2': 98,
    };
    
    // Natural Language Keyword Detection for Patient Condition
    if (condition.contains('cardiac') || condition.contains('heart') || condition.contains('chest')) {
      vitals['hr'] = 145; // Tachycardia
      vitals['sys_bp'] = 160; // Hypertension
      vitals['spo2'] = 92;
      _activeCase!.incidentType = 'CARDIAC_EMERGENCY';
    } else if (condition.contains('trauma') || condition.contains('accident') || condition.contains('bleed')) {
      vitals['hr'] = 130; 
      vitals['sys_bp'] = 80; // Hypotension from blood loss
      vitals['spo2'] = 94;
      _activeCase!.incidentType = 'TRAUMA_ACCIDENT';
    } else if (condition.contains('breath') || condition.contains('asthma') || condition.contains('chok')) {
      vitals['hr'] = 110;
      vitals['spo2'] = 82; // Hypoxia
      _activeCase!.incidentType = 'RESPIRATORY_DISTRESS';
    } else if (condition.contains('stroke') || condition.contains('paraly')) {
      vitals['sys_bp'] = 180; // Severe hypertension
      _activeCase!.incidentType = 'STROKE_NEURO';
    } else {
      final bool isCritical = _activeCase!.incidentType == 'CARDIAC_EMERGENCY' || _activeCase!.incidentType == 'TRAUMA_ACCIDENT';
      vitals['hr'] = isCritical ? 135 : 85;
      vitals['sys_bp'] = isCritical ? 85 : 120;
      vitals['spo2'] = isCritical ? 88 : 98;
    }
    
    _activeCase!.vitals = vitals;"""

content = content.replace(old_vitals, new_vitals)

with open("Ambulance_App/lib/viewmodels/app_view_model.dart", "w", encoding="utf-8") as f:
    f.write(content)

# And do it for the local repo too
with open("c:/Users/Nihaal S/java/Pulse_Route/lib/viewmodels/app_view_model.dart", "w", encoding="utf-8") as f:
    f.write(content)
