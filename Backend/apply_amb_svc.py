import re

with open("src/main/java/com/pulseroute/backend/service/AmbulanceService.java", "r", encoding="utf-8") as f:
    content = f.read()

method = """    public void updateStatus(String code, com.pulseroute.backend.model.AmbulanceStatus status) {
        Ambulance amb = repository.findByAmbulanceCode(code);
        if (amb != null) {
            amb.setStatus(status);
            repository.save(amb);
        }
    }
"""

content = content.replace("public List<AmbulanceDTO> getAvailable() {", method + "\n    public List<AmbulanceDTO> getAvailable() {")

with open("src/main/java/com/pulseroute/backend/service/AmbulanceService.java", "w", encoding="utf-8") as f:
    f.write(content)
