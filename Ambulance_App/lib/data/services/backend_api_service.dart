import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/emergency_case_model.dart';
import '../algorithms/hospital_ranking_engine.dart';
import '../models/hospital_model.dart';
import '../../core/config/app_config.dart';

final backendApiProvider = Provider<BackendApiService>((ref) {
  return BackendApiService();
});

class BackendApiService {
  final String baseUrl = AppConfig.apiBaseUrl;
  
  Timer? _pollingTimer;
  String? _currentAmbulanceId;
  Function(EmergencyCaseModel)? onEmergencyReceived;
  final Map<String, String> headers = {
    'Content-Type': 'application/json'
  };

  BackendApiService();

  void startPolling(String ambulanceId, Function(EmergencyCaseModel) onReceived) {
    _currentAmbulanceId = ambulanceId;
    onEmergencyReceived = onReceived;
    
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      _pollForEmergency();
      fetchHospitals();
    });
    
    print('Started polling backend for ambulance: $ambulanceId');
  }

  void stopPolling() {
    _pollingTimer?.cancel();
  }

  
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

  Future<void> _pollForEmergency() async {
    if (_currentAmbulanceId == null) return;
    
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/emergencies/active?ambulanceCode=$_currentAmbulanceId'),
        headers: headers,
      ).timeout(const Duration(seconds: 2));

      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        if (data.isNotEmpty) {
          // Find the first DISPATCHED case
          Map<String, dynamic>? dispatchedCase;
          for (var item in data) {
            if (item['status'] == 'DISPATCHED') {
              dispatchedCase = item;
              break;
            }
          }
          
          if (dispatchedCase != null) {
            final caseData = dispatchedCase;
             final emergency = EmergencyCaseModel(
               caseId: caseData['caseNumber'] ?? 'EM-UNKNOWN',
               callerName: caseData['patientName'] ?? 'Unknown Patient',
               callerPhone: caseData['callerPhone'] ?? 'Unknown Phone',
               address: caseData['incidentAddress'] ?? 'Unknown Location',
               incidentLat: caseData['latitude']?.toDouble() ?? 13.0,
               incidentLng: caseData['longitude']?.toDouble() ?? 80.2,
               complaint: caseData['notes'] ?? 'Unknown Condition',
               startLat: 13.0827, 
               startLng: 80.2707,
               dispatchedTime: DateTime.now().toString(),
               status: CaseStatus.dispatched,
             );
             
             onEmergencyReceived?.call(emergency);
          }
        }
      }
    } catch (e) {
      print('Backend Poll Exception: $e');
    }
  }

  Future<bool> acceptEmergency(String caseId, String ambulanceId, String driverName) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/emergencies/case/$caseId/accept'),
        headers: headers,
      ).timeout(const Duration(seconds: 5));
      return res.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<bool> declineEmergency(String caseId) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/emergencies/case/$caseId/decline'),
        headers: headers,
      ).timeout(const Duration(seconds: 5));
      return res.statusCode == 200;
    } catch (e) {
      return false;
    }
  }


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

    return {};
  }
}
