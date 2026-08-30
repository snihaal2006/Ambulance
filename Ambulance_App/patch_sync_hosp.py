import re

with open("lib/data/services/backend_api_service.dart", "r", encoding="utf-8") as f:
    content = f.read()

# Add import for HospitalRankingEngine and HospitalModel
if "import '../algorithms/hospital_ranking_engine.dart';" not in content:
    content = content.replace("import '../models/emergency_case_model.dart';", "import '../models/emergency_case_model.dart';\nimport '../algorithms/hospital_ranking_engine.dart';\nimport '../models/hospital_model.dart';")

sync_code = """
  Future<void> fetchHospitals() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/hospitals'), headers: headers).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        List<HospitalModel> parsedHospitals = [];
        for (var h in data) {
          parsedHospitals.add(HospitalModel(
            id: h['id'] ?? 'unknown',
            name: h['name'] ?? 'Unknown Hospital',
            shortName: h['shortName'] ?? 'Hospital',
            lat: h['lat'] ?? 11.0,
            lng: h['lng'] ?? 76.9,
            phone: '+91 422 222 2222',
            erStatus: h['erStatus'] ?? 'OPEN',
            icuBeds: h['icuBeds'] ?? 0,
            predictedIcuBeds: h['icuBeds'] ?? 0,
            capabilities: List<String>.from(h['capabilities'] ?? []),
            tags: ['Synced from Admin'],
          ));
        }
        if (parsedHospitals.isNotEmpty) {
          HospitalRankingEngine.chennaiHospitals = parsedHospitals;
          print('Synced hospitals from backend: ${parsedHospitals.length}');
        }
      }
    } catch (e) {
      print('Failed to sync hospitals: $e');
    }
  }
"""

if "fetchHospitals" not in content:
    content = content.replace("Future<void> _pollForEmergency() async {", sync_code + "\n  Future<void> _pollForEmergency() async {")
    content = content.replace("_pollForEmergency();", "_pollForEmergency();\n      fetchHospitals();")

with open("lib/data/services/backend_api_service.dart", "w", encoding="utf-8") as f:
    f.write(content)
