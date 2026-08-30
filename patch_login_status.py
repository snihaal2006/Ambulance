import re

file_path = "Ambulance_App/lib/viewmodels/app_view_model.dart"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_login = """  void loginAndStartDuty({required String driverId, required String pin}) {
    driver.status = DriverStatus.onDuty;
    AudioHapticService.playAcknowledgeBeep();
    navigateTo(AppScreen.waiting);
    triggerDutyStartedToast();
  }"""

new_login = """  void loginAndStartDuty({required String driverId, required String pin}) {
    driver.status = DriverStatus.onDuty;
    AudioHapticService.playAcknowledgeBeep();
    _backendApiService?.updateAmbulanceStatus('AMB-1042', 'AVAILABLE');
    navigateTo(AppScreen.waiting);
    triggerDutyStartedToast();
  }"""

content = content.replace(old_login, new_login)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

with open("c:/Users/Nihaal S/java/Pulse_Route/lib/viewmodels/app_view_model.dart", "w", encoding="utf-8") as f:
    f.write(content)
