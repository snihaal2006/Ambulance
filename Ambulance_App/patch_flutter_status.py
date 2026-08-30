import re

with open("lib/data/services/backend_api_service.dart", "r", encoding="utf-8") as f:
    content = f.read()

new_methods = """
  Future<bool> updateAmbulanceStatus(String ambulanceId, String status) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/ambulances/$ambulanceId/status'),
        headers: headers,
        body: jsonEncode({"status": status}),
      ).timeout(const Duration(seconds: 5));
      return res.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<Map<String, Map<String, dynamic>>> predictHospitalScores(List<Map<String, dynamic>> hospitalsData, Map<String, dynamic> vitals) async {
"""

content = content.replace("  Future<Map<String, Map<String, dynamic>>> predictHospitalScores(List<Map<String, dynamic>> hospitalsData, Map<String, dynamic> vitals) async {", new_methods)

with open("lib/data/services/backend_api_service.dart", "w", encoding="utf-8") as f:
    f.write(content)
