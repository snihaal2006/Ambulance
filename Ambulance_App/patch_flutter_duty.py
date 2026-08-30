import re

with open("lib/viewmodels/app_view_model.dart", "r", encoding="utf-8") as f:
    content = f.read()

# Update toggleDutyMode to call updateAmbulanceStatus
old_toggle = """    if (driver.status == DriverStatus.onDuty) {
      driver.status = DriverStatus.offDuty;
      AudioHapticService.playAcknowledgeBeep();
    } else {
      driver.status = DriverStatus.onDuty;
      AudioHapticService.playAcknowledgeBeep();
      triggerDutyStartedToast();
    }"""

new_toggle = """    if (driver.status == DriverStatus.onDuty) {
      driver.status = DriverStatus.offDuty;
      _backendApiService?.updateAmbulanceStatus('AMB-1042', 'OFF_DUTY');
      AudioHapticService.playAcknowledgeBeep();
    } else {
      driver.status = DriverStatus.onDuty;
      _backendApiService?.updateAmbulanceStatus('AMB-1042', 'AVAILABLE');
      AudioHapticService.playAcknowledgeBeep();
      triggerDutyStartedToast();
    }"""

content = content.replace(old_toggle, new_toggle)

with open("lib/viewmodels/app_view_model.dart", "w", encoding="utf-8") as f:
    f.write(content)
