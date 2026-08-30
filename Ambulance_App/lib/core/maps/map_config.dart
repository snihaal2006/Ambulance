import 'package:latlong2/latlong.dart';

class MapConfig {
  // Saibaba Colony, Coimbatore, Tamil Nadu, India
  static const LatLng defaultCenter = LatLng(11.0270, 76.9452);
  static const LatLng ambulanceLocation = LatLng(11.0220, 76.9420);
  static const LatLng patientLocation = LatLng(11.0320, 76.9480);
  static const double defaultZoom = 15.0; // Appropriate zoom to clearly see the area
  static const double minZoom = 3.0;
  static const double maxZoom = 19.0;

  static const String osmUrlTemplate = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  static const String osmUserAgent = 'com.medical.vit.app';
  static const String attributionText = '© OpenStreetMap contributors';
}
