import 'package:shared_preferences/shared_preferences.dart';

class PrefsService {
  static const _remindersKey = 'checkinRemindersEnabled';

  static Future<bool> checkinRemindersEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_remindersKey) ?? true;
  }

  static Future<void> setCheckinRemindersEnabled(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_remindersKey, value);
  }
}
