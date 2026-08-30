import 'package:latlong2/latlong.dart';
import '../../core/models/hospital.dart';

abstract class HospitalRepository {
  Future<List<Hospital>> getHospitals();
  Future<Hospital?> getHospitalById(String id);
  Future<List<Hospital>> getHospitalsWithinRadius(LatLng center, double radiusMeters);
}

class DemoHospitalRepository implements HospitalRepository {
  final List<Hospital> _mockHospitals = const [
    Hospital(
      id: 'h1',
      name: 'Ganga Hospital',
      latitude: 11.026136,
      longitude: 76.952487,
      address: '313, Mettupalayam Rd, Ramnagar, Coimbatore',
      specialties: ['Orthopaedics', 'Plastic Surgery', 'Trauma'],
      emergencyAvailable: true,
      icuAvailable: true,
      contactNumber: '+91 422 2485000',
    ),
    Hospital(
      id: 'h2',
      name: 'KTVR Group Hospital',
      latitude: 11.026167,
      longitude: 76.949938,
      address: 'Saibaba Colony, Coimbatore',
      specialties: ['General Medicine', 'Orthopaedics'],
      emergencyAvailable: true,
      icuAvailable: true,
      contactNumber: '+91 422 244 5451',
    ),
    Hospital(
      id: 'h3',
      name: 'Rao Hospital',
      latitude: 11.013153,
      longitude: 76.948405,
      address: 'West Periyasamy Road, RS Puram, Coimbatore',
      specialties: ['Obstetrics', 'Gynaecology', 'Endoscopy'],
      emergencyAvailable: true,
      icuAvailable: null, // Unknown
      contactNumber: '+91 422 254 3666',
    ),
    Hospital(
      id: 'h4',
      name: 'The Eye Foundation',
      latitude: 11.009300,
      longitude: 76.950700,
      address: 'DB Road, RS Puram, Coimbatore',
      specialties: ['Ophthalmology'],
      emergencyAvailable: false,
      icuAvailable: false,
      contactNumber: '+91 422 424 2000',
    ),
    Hospital(
      id: 'h5',
      name: 'Kongunad Hospitals',
      latitude: 11.018058,
      longitude: 76.960488,
      address: 'Tatabad, Coimbatore',
      specialties: ['General Medicine', 'Emergency', 'ICU'],
      emergencyAvailable: true,
      icuAvailable: true,
      contactNumber: '+91 422 249 6344',
    ),
    Hospital(
      id: 'h6',
      name: 'Sri Ramakrishna Hospital',
      latitude: 11.023146,
      longitude: 76.977689,
      address: 'Sarojini Naidu Rd, Siddhapudur, Coimbatore',
      specialties: ['Multi-specialty', 'Cardiology', 'Oncology'],
      emergencyAvailable: true,
      icuAvailable: true,
      contactNumber: '+91 422 450 0000',
    ),
    Hospital(
      id: 'h7',
      name: 'Sree Abishek Hospital',
      latitude: 11.043097,
      longitude: 76.924116,
      address: 'Saibaba Colony, Coimbatore',
      specialties: ['General Medicine'],
      emergencyAvailable: null,
      icuAvailable: null,
      contactNumber: '+91 422 244 4434',
    ),
    Hospital(
      id: 'h8',
      name: 'PSG Hospitals',
      latitude: 11.018840,
      longitude: 77.007314,
      address: 'Peelamedu, Coimbatore',
      specialties: ['Multi-specialty', 'Trauma', 'Neurology'],
      emergencyAvailable: true,
      icuAvailable: true,
      contactNumber: '+91 422 257 0170',
    ),
    Hospital(
      id: 'h9',
      name: 'Hindusthan Hospital',
      latitude: 11.019682,
      longitude: 76.994773,
      address: 'Nava India, Udayampalayam, Coimbatore',
      specialties: ['Multi-specialty', 'Orthopaedics'],
      emergencyAvailable: true,
      icuAvailable: true,
      contactNumber: '+91 422 444 0444',
    ),
  ];

  @override
  Future<List<Hospital>> getHospitals() async {
    return _mockHospitals;
  }

  @override
  Future<Hospital?> getHospitalById(String id) async {
    try {
      return _mockHospitals.firstWhere((h) => h.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<List<Hospital>> getHospitalsWithinRadius(LatLng center, double radiusMeters) async {
    const distanceCalculator = Distance();
    return _mockHospitals.where((hospital) {
      final hospitalLatLng = LatLng(hospital.latitude, hospital.longitude);
      final distance = distanceCalculator.as(LengthUnit.Meter, center, hospitalLatLng);
      return distance <= radiusMeters;
    }).toList();
  }
}
