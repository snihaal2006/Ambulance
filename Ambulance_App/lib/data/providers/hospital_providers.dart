import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/hospital.dart';
import '../repositories/hospital_repository.dart';
import '../../core/maps/map_config.dart';

final hospitalRepositoryProvider = Provider<HospitalRepository>((ref) {
  return DemoHospitalRepository();
});

final nearbyHospitalsProvider = FutureProvider<List<Hospital>>((ref) async {
  final repo = ref.read(hospitalRepositoryProvider);
  // Filter for hospitals within 10,000 meters of Saibaba Colony center
  return repo.getHospitalsWithinRadius(MapConfig.defaultCenter, 10000.0);
});

final selectedHospitalProvider = StateProvider<Hospital?>((ref) {
  return null;
});
