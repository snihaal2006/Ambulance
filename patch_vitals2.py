import re

with open("Ambulance_App/lib/viewmodels/app_view_model.dart", "r", encoding="utf-8") as f:
    content = f.read()

old_vitals = """    // 2. Mock Vitals (in a real app, this would come from IoT or patient assessment)
    Map<String, dynamic> vitals = {
      'hr': 140,
      'sys_bp': 80,
      'spo2': 88,
    };"""

new_vitals = """    // 2. Parse Patient Condition / Notes to dynamically simulate vitals
    final condition = _activeCase!.complaint.toLowerCase();
    Map<String, dynamic> vitals = {
      'hr': 80,
      'sys_bp': 120,
      'spo2': 98,
    };
    
    if (condition.contains('cardiac') || condition.contains('heart') || condition.contains('chest')) {
      vitals['hr'] = 145; // Tachycardia
      vitals['sys_bp'] = 160; // Hypertension
      vitals['spo2'] = 92;
    } else if (condition.contains('trauma') || condition.contains('accident') || condition.contains('bleed')) {
      vitals['hr'] = 130; 
      vitals['sys_bp'] = 80; // Hypotension from blood loss
      vitals['spo2'] = 94;
    } else if (condition.contains('breath') || condition.contains('asthma') || condition.contains('chok')) {
      vitals['hr'] = 110;
      vitals['spo2'] = 82; // Hypoxia
    } else if (condition.contains('stroke') || condition.contains('paraly')) {
      vitals['sys_bp'] = 180; // Severe hypertension
    }
    
    // Also override incidentType if the notes strongly suggest something else
    if (condition.contains('cardiac') || condition.contains('heart attack')) {
      _activeCase!.incidentType = 'CARDIAC_EMERGENCY';
    } else if (condition.contains('burn')) {
      _activeCase!.incidentType = 'FIRE_BURN';
    } else if (condition.contains('stroke')) {
      _activeCase!.incidentType = 'STROKE_NEURO';
    }"""

content = content.replace(old_vitals, new_vitals)

with open("Ambulance_App/lib/viewmodels/app_view_model.dart", "w", encoding="utf-8") as f:
    f.write(content)
