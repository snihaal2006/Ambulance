import re

with open("lib/data/algorithms/hospital_ranking_engine.dart", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("static List<HospitalModel> get chennaiHospitals => [", "static List<HospitalModel> chennaiHospitals = [")

with open("lib/data/algorithms/hospital_ranking_engine.dart", "w", encoding="utf-8") as f:
    f.write(content)
