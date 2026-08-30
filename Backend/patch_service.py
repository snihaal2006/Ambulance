import re

with open("src/main/java/com/pulseroute/backend/service/EmergencyService.java", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("public void accept(Long id) {", "public void acceptByCaseNumber(String caseNumber) {\n        EmergencyCase c = repository.findByCaseNumber(caseNumber);\n        if (c != null) {\n            c.setStatus(EmergencyStatus.ACCEPTED);\n            c.setUpdatedAt(LocalDateTime.now());\n            repository.save(c);\n        }\n    }\n\n    public void declineByCaseNumber(String caseNumber) {\n        EmergencyCase c = repository.findByCaseNumber(caseNumber);\n        if (c != null) {\n            c.setStatus(EmergencyStatus.DECLINED);\n            c.setUpdatedAt(LocalDateTime.now());\n            repository.save(c);\n        }\n    }\n\n    public void accept(Long id) {")

with open("src/main/java/com/pulseroute/backend/service/EmergencyService.java", "w", encoding="utf-8") as f:
    f.write(content)
