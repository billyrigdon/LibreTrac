// import 'package:flutter/material.dart';
// import 'package:flutter_local_notifications/flutter_local_notifications.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:libretrac/features/home/view/home_screen.dart';
// import 'package:libretrac/main.dart';
// import 'package:libretrac/providers/db_provider.dart';
// import 'package:libretrac/services/prefs_service.dart';
// import 'package:timezone/timezone.dart' as tz;

// class NotificationService {
//   static final _notifications = FlutterLocalNotificationsPlugin();

//   static Future<void> init() async {
//     const android = AndroidInitializationSettings('@mipmap/ic_launcher');
//     const settings = InitializationSettings(android: android);
//     await _notifications.initialize(
//       settings,
//       onDidReceiveNotificationResponse: (response) {
//         final context = LibreTracApp().navigatorKey.currentState?.context;
//         if (context != null) {
//           Navigator.push(
//             context,
//             MaterialPageRoute(builder: (_) => HomeScreen()),
//           );
//         }
//       },
//     );
//   }

//   static Future<void> scheduleMorningNotification() async {
//     await _notifications.zonedSchedule(
//       0,
//       'Good morning',
//       'How did you sleep?',
//       _nextInstanceOfTime(6),
//       const NotificationDetails(
//         android: AndroidNotificationDetails(
//           'libretrac_morning',
//           'Morning Reminder',
//           importance: Importance.high,
//           priority: Priority.high,
//         ),
//       ),
//       androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
//       matchDateTimeComponents: DateTimeComponents.time,
//     );
//   }

//   static Future<void> scheduleEveningNotification() async {
//     await _notifications.zonedSchedule(
//       1,
//       'Good evening',
//       'How was your day?',
//       _nextInstanceOfTime(18),
//       const NotificationDetails(
//         android: AndroidNotificationDetails(
//           'libretrac_evening',
//           'Evening Reminder',
//           importance: Importance.high,
//           priority: Priority.high,
//         ),
//       ),
//       androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
//       matchDateTimeComponents: DateTimeComponents.time,
//     );
//   }

//   static Future<void> cancelEveningNotification() async {
//     await _notifications.cancel(1);
//   }

//   static tz.TZDateTime _nextInstanceOfTime(int hour) {
//     final now = tz.TZDateTime.now(tz.local);
//     final scheduled = tz.TZDateTime(
//       tz.local,
//       now.year,
//       now.month,
//       now.day,
//       hour,
//     );
//     return scheduled.isBefore(now)
//         ? scheduled.add(Duration(days: 1))
//         : scheduled;
//   }

//   static Future<void> cancelMorningNotification() async {
//     await _notifications.cancel(0);
//   }


// Future<void> maybeScheduleEveningNotif(WidgetRef ref) async {
//     if (!await PrefsService.checkinRemindersEnabled()) return;

//     final db = ref.read(dbProvider);
//     final today = DateTime.now();
//     final start = DateTime(today.year, today.month, today.day);
//     final end = start.add(const Duration(days: 1));

//     final moods = await db.getMoodEntriesBetween(start, end);
//     if (moods.isEmpty) {
//       await NotificationService.scheduleEveningNotification();
//     } else {
//       await NotificationService.cancelEveningNotification();
//     }
//   }



// }
