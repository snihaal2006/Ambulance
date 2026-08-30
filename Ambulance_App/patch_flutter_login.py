import re

with open("lib/viewmodels/app_view_model.dart", "r", encoding="utf-8") as f:
    content = f.read()

# Update tryEndDuty to call updateAmbulanceStatus
old_end_duty = """    driver.status = DriverStatus.offDuty;
    _activeCase = null;
    AudioHapticService.playAcknowledgeBeep();
    navigateTo(AppScreen.login);
  }"""

new_end_duty = """    driver.status = DriverStatus.offDuty;
    _activeCase = null;
    _backendApiService?.updateAmbulanceStatus('AMB-1042', 'OFF_DUTY');
    AudioHapticService.playAcknowledgeBeep();
    navigateTo(AppScreen.login);
  }"""

content = content.replace(old_end_duty, new_end_duty)

# Update tryLogin to call updateAmbulanceStatus
old_login = """  void tryLogin(String driverId, String password) {
    if (driverId.isNotEmpty && password.isNotEmpty) {
      driver.status = DriverStatus.onDuty;
      AudioHapticService.playAcknowledgeBeep();
      navigateTo(AppScreen.controlRoom);
    }
  }"""

new_login = """  void tryLogin(String driverId, String password) {
    if (driverId.isNotEmpty && password.isNotEmpty) {
      driver.status = DriverStatus.onDuty;
      _backendApiService?.updateAmbulanceStatus('AMB-1042', 'AVAILABLE');
      AudioHapticService.playAcknowledgeBeep();
      navigateTo(AppScreen.controlRoom);
    }
  }"""

content = content.replace(old_login, new_login)

with open("lib/viewmodels/app_view_model.dart", "w", encoding="utf-8") as f:
    f.write(content)
