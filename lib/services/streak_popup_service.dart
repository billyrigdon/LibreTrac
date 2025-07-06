import 'package:shared_preferences/shared_preferences.dart';

class StreakService {
  static const _lastCheckInKey = 'last_checkin_date';
  static const _streakKey = 'current_streak';

  static Future<int> updateStreak() async {
    final prefs = await SharedPreferences.getInstance();
    final today = DateTime.now();
    final last = prefs.getString(_lastCheckInKey);

    final todayDate = DateTime(today.year, today.month, today.day);

    if (last != null) {
      final lastDate = DateTime.parse(last);

      if (lastDate == todayDate) {
        // Already checked in today
        return prefs.getInt(_streakKey) ?? 0;
      } else if (lastDate == todayDate.subtract(const Duration(days: 1))) {
        // Continued streak
        final newStreak = (prefs.getInt(_streakKey) ?? 0) + 1;
        await prefs.setInt(_streakKey, newStreak);
        await prefs.setString(_lastCheckInKey, todayDate.toIso8601String());
        return newStreak;
      }
    }

    // New streak or reset
    await prefs.setInt(_streakKey, 1);
    await prefs.setString(_lastCheckInKey, todayDate.toIso8601String());
    return 1;
  }

  static Future<bool> hasShownToday() async {
    final prefs = await SharedPreferences.getInstance();
    final key =
        'streak_popup_shown_${DateTime.now().toIso8601String().substring(0, 10)}';
    return prefs.getBool(key) ?? false;
  }

  static Future<void> markShownToday() async {
    final prefs = await SharedPreferences.getInstance();
    final key =
        'streak_popup_shown_${DateTime.now().toIso8601String().substring(0, 10)}';
    await prefs.setBool(key, true);
  }
}
