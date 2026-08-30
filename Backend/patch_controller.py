import re

with open("src/main/java/com/pulseroute/backend/controller/EmergencyController.java", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("public void accept(@PathVariable Long id) { service.accept(id); }", "public void accept(@PathVariable Long id) { service.accept(id); }\n\n    @PostMapping(\"/case/{caseNumber}/accept\")\n    public void acceptByCaseNumber(@PathVariable String caseNumber) { service.acceptByCaseNumber(caseNumber); }\n\n    @PostMapping(\"/case/{caseNumber}/decline\")\n    public void declineByCaseNumber(@PathVariable String caseNumber) { service.declineByCaseNumber(caseNumber); }")

with open("src/main/java/com/pulseroute/backend/controller/EmergencyController.java", "w", encoding="utf-8") as f:
    f.write(content)
