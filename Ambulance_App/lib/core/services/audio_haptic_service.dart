import 'dart:async';
import 'package:flutter/services.dart';
import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';

class AudioHapticService {
  static Timer? _sirenTimer;
  static bool _isPlayingSiren = false;

  static bool get isPlayingSiren => _isPlayingSiren;

  static void startEmergencySiren({String tone = 'yelp'}) {
    stopEmergencySiren();
    _isPlayingSiren = true;

    // Start native alarm ringtone (loops automatically)
    FlutterRingtonePlayer().play(
      android: AndroidSounds.alarm,
      ios: IosSounds.alarm,
      looping: true,
      volume: 1.0,
      asAlarm: true,
    );

    // Pulse haptic feedback in intervals matching ambulance siren rhythm
    final int intervalMs = tone == 'yelp' ? 240 : (tone == 'q2b' ? 800 : 400);

    _sirenTimer = Timer.periodic(Duration(milliseconds: intervalMs), (timer) {
      if (!_isPlayingSiren) {
        timer.cancel();
        return;
      }
      HapticFeedback.heavyImpact();
    });
  }

  static void stopEmergencySiren() {
    _isPlayingSiren = false;
    _sirenTimer?.cancel();
    _sirenTimer = null;
    
    // Stop the ringtone
    FlutterRingtonePlayer().stop();
  }

  static void playAcknowledgeBeep() {
    SystemSound.play(SystemSoundType.click);
    HapticFeedback.mediumImpact();
  }

  static void playArrivalChime() {
    FlutterRingtonePlayer().playNotification();
    HapticFeedback.vibrate();
  }

  static void playAlertChime() {
    FlutterRingtonePlayer().play(
      android: AndroidSounds.notification,
      ios: IosSounds.glass,
      volume: 1.0,
    );
    HapticFeedback.heavyImpact();
  }

  static void previewSirenTone(String tone) {
    startEmergencySiren(tone: tone);
    Timer(const Duration(milliseconds: 3200), () {
      stopEmergencySiren();
    });
  }
}
