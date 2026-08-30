enum AmbulanceStatus {
  available,
  busy,
  assigned,
  enRoute,
  offDuty,
}

class AmbulanceModel {
  final String id;
  final String plateNumber;
  final String driverName;
  final double lat;
  final double lng;
  AmbulanceStatus status;

  AmbulanceModel({
    required this.id,
    required this.plateNumber,
    required this.driverName,
    required this.lat,
    required this.lng,
    this.status = AmbulanceStatus.available,
  });

  AmbulanceModel copyWith({
    String? id,
    String? plateNumber,
    String? driverName,
    double? lat,
    double? lng,
    AmbulanceStatus? status,
  }) {
    return AmbulanceModel(
      id: id ?? this.id,
      plateNumber: plateNumber ?? this.plateNumber,
      driverName: driverName ?? this.driverName,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      status: status ?? this.status,
    );
  }
}
