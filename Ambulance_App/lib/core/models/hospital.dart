class Hospital {
  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final String? address;
  final List<String>? specialties;
  final bool? emergencyAvailable;
  final bool? icuAvailable;
  final String? contactNumber;

  const Hospital({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    this.address,
    this.specialties,
    this.emergencyAvailable,
    this.icuAvailable,
    this.contactNumber,
  });
}
