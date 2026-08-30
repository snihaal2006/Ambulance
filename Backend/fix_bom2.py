import os

for fpath in ["src/main/java/com/pulseroute/backend/dto/HospitalDTO.java", "src/main/java/com/pulseroute/backend/controller/HospitalController.java"]:
    with open(fpath, "r", encoding="utf-8-sig") as f:
        content = f.read()
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
