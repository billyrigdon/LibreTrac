import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Holds the current ThemeMode (dark by default).
// final themeModeProvider = StateProvider<ThemeMode>((_) => ThemeMode.dark);

final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((
  ref,
) {
  return ThemeModeNotifier();
});

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  static const _key = 'theme_mode';

  ThemeModeNotifier() : super(ThemeMode.dark) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_key);
    switch (stored) {
      case 'light':
        state = ThemeMode.light;
        break;
      case 'dark':
        state = ThemeMode.dark;
        break;
      case 'system':
        state = ThemeMode.system;
        break;
    }
  }

  Future<void> update(ThemeMode mode) async {
    state = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, _themeToString(mode));
  }

  String _themeToString(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'light';
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.system:
        return 'system';
    }
  }
}


final accentColorProvider = StateNotifierProvider<AccentColorNotifier, Color>(
  (ref) => AccentColorNotifier(),
);

class AccentColorNotifier extends StateNotifier<Color> {
  static const _key = 'primary_seed_color';

  AccentColorNotifier() : super(Colors.purple) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final hex = prefs.getString(_key);
    if (hex != null) {
      try {
        state = Color(int.parse(hex, radix: 16));
      } catch (_) {}
    }
  }

  Future<void> update(Color color) async {
    state = color;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, color.value.toRadixString(16));
  }
}
