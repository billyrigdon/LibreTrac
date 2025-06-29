import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:home_widget/home_widget.dart';
import 'package:libretrac/features/home/view/home_screen.dart';
import 'package:libretrac/providers/theme_provider.dart';
import 'package:libretrac/services/mood_widget_service.dart';

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:libretrac/services/notification_service.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

// final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
//     FlutterLocalNotificationsPlugin();

// Future<void> initializeNotifications() async {
//   const AndroidInitializationSettings androidInit =
//       AndroidInitializationSettings('@mipmap/ic_launcher');

//   await flutterLocalNotificationsPlugin.initialize(
//     const InitializationSettings(android: androidInit),
//   );

//   tz.initializeTimeZones();
// }

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // await NotificationService.init();
  // await NotificationService.scheduleDailyReminders();

  await HomeWidget.registerBackgroundCallback(_widgetCallback);

  await dotenv.load(fileName: 'assets/.env');
  runApp(ProviderScope(child: const LibreTracApp()));

  // 2 — kick the widget after the first frame so ProviderScope is ready
  WidgetsBinding.instance.addPostFrameCallback((_) {
    MoodWidgetService.update();
  });
}

/// Called by the OS when the widget requests an update.
@pragma('vm:entry-point')
void _widgetCallback(Uri? _) async {
  await MoodWidgetService.update();
}

class LibreTracApp extends ConsumerWidget {
  const LibreTracApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(themeModeProvider);
    const seed = Colors.purple; // <— pick anything; drives both schemes

    // ── LIGHT & DARK COLOR SCHEMES ─────────────────────────────
    final lightScheme = ColorScheme.fromSeed(
      seedColor: seed,
      brightness: Brightness.light,
    );

    final darkScheme = ColorScheme.fromSeed(
      seedColor: seed,
      brightness: Brightness.dark,
      // Override a few tones so surfaces are really dark:
      surface: const Color(0xFF1A1A1A),
      background: const Color(0xFF121212),
    );

    // ── THEME DATA ─────────────────────────────────────────────
    final lightTheme = ThemeData(
      colorScheme: lightScheme,
      useMaterial3: true,
      appBarTheme: AppBarTheme(
        backgroundColor: lightScheme.primary,
        foregroundColor: lightScheme.onPrimary,
      ),
      cardTheme: CardTheme(color: lightScheme.background),
    );

    final darkTheme = ThemeData(
      colorScheme: darkScheme,
      useMaterial3: true,
      scaffoldBackgroundColor: darkScheme.background,
      appBarTheme: AppBarTheme(
        backgroundColor: darkScheme.background,
        foregroundColor: darkScheme.onSurface,
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: darkScheme.primary),
      ),
      cardTheme: CardTheme(color: darkScheme.background),
    );

    return MaterialApp(
      title: 'LibreTrac',
      themeMode: mode,
      theme: lightTheme,
      darkTheme: darkTheme,
      home: const HomeScreen(),
    );
  }
}
