// import 'dart:io';

// import 'package:drift/drift.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_local_notifications/flutter_local_notifications.dart';
// import 'package:timezone/timezone.dart' as tz;
// import 'package:timezone/data/latest.dart' as tz;
// import 'package:libretrac/core/database/app_database.dart';

// // class NotificationService {

// //   static final FlutterLocalNotificationsPlugin _plugin =
// //       FlutterLocalNotificationsPlugin();

// //   static Future<void> init() async {
// //     tz.initializeTimeZones();

// //     const android = AndroidInitializationSettings('@mipmap/ic_launcher');
// //     const settings = InitializationSettings(android: android);

// //     await _plugin.initialize(settings);

// //     // Create channels if not already created
// //     await _plugin
// //         .resolvePlatformSpecificImplementation<
// //           AndroidFlutterLocalNotificationsPlugin
// //         >()
// //         ?.createNotificationChannel(
// //           const AndroidNotificationChannel(
// //             'morning_channel',
// //             'Morning Check-In',
// //             description: 'Reminds you to log your sleep.',
// //             importance: Importance.high,
// //           ),
// //         );

// //     await _plugin
// //         .resolvePlatformSpecificImplementation<
// //           AndroidFlutterLocalNotificationsPlugin
// //         >()
// //         ?.createNotificationChannel(
// //           const AndroidNotificationChannel(
// //             'evening_channel',
// //             'Evening Check-In',
// //             description: 'Reminds you to log your mood.',
// //             importance: Importance.high,
// //           ),
// //         );
// //   }

// //   static Future<void> scheduleDailyReminders() async {
// //     final now = DateTime.now();
// //     final hasEntry = await db.entryFor(now) != null;
// //     if (hasEntry) return;

// //     // await _plugin.cancelAll();

// //     // Morning notification
// //     await _plugin.zonedSchedule(
// //       100,
// //       'Good morning!',
// //       'How did you sleep?',
// //       _nextInstanceOfHour(6),
// //       const NotificationDetails(
// //         android: AndroidNotificationDetails(
// //           'morning_channel',
// //           'Morning Check-In',
// //           channelDescription: 'Reminds you to log your sleep.',
// //           importance: Importance.high,
// //           priority: Priority.high,
// //         ),
// //       ),
// //       matchDateTimeComponents: DateTimeComponents.time,
// //       androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
// //     );

// //     // Evening notification
// //     await _plugin.zonedSchedule(
// //       200,
// //       'Don\'t forget to check in!',
// //       'Tap to log your mood today.',
// //       _nextInstanceOfHour(18),
// //       const NotificationDetails(
// //         android: AndroidNotificationDetails(
// //           'evening_channel',
// //           'Evening Check-In',
// //           channelDescription: 'Reminds you to log your mood.',
// //           importance: Importance.high,
// //           priority: Priority.high,
// //         ),
// //       ),
// //       matchDateTimeComponents: DateTimeComponents.time,
// //       androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
// //     );
// //   }

// //   static tz.TZDateTime _nextInstanceOfHour(int hour) {
// //     final now = tz.TZDateTime.now(tz.local);
// //     final scheduled = tz.TZDateTime(
// //       tz.local,
// //       now.year,
// //       now.month,
// //       now.day,
// //       hour,
// //     );
// //     return scheduled.isBefore(now)
// //         ? scheduled.add(const Duration(days: 1))
// //         : scheduled;
// //   }
// // }
// class NotificationService {
//   static final db = AppDatabase();
//   static final FlutterLocalNotificationsPlugin _plugin =
//       FlutterLocalNotificationsPlugin();

//  static Future<void> init({BuildContext? context}) async {
//     tz.initializeTimeZones();

//     const android = AndroidInitializationSettings('@mipmap/ic_launcher');
//     const settings = InitializationSettings(android: android);
//     await _plugin.initialize(settings);

//     if (Platform.isAndroid) {
//       final androidPlugin =
//           _plugin
//               .resolvePlatformSpecificImplementation<
//                 AndroidFlutterLocalNotificationsPlugin
//               >();

//       final granted = await androidPlugin?.requestNotificationsPermission();
//       await androidPlugin?.requestNotificationsPermission();
//       debugPrint('Notification permission granted: $granted');

//       // Optionally: show a dialog if not granted
//       if (granted == false && context != null) {
//         showDialog(
//           context: context,
//           builder:
//               (_) => AlertDialog(
//                 title: const Text("Enable Notifications"),
//                 content: const Text(
//                   "Please enable notifications to receive mood & sleep reminders.",
//                 ),
//                 actions: [
//                   TextButton(
//                     onPressed: () => Navigator.of(context).pop(),
//                     child: const Text("OK"),
//                   ),
//                 ],
//               ),
//         );
//       }
//     }
//     // Channels (same as before)
//     final androidPlugin =
//         _plugin
//             .resolvePlatformSpecificImplementation<
//               AndroidFlutterLocalNotificationsPlugin
//             >();

//     await androidPlugin?.createNotificationChannel(
//       const AndroidNotificationChannel(
//         'morning_channel',
//         'Morning Check-In',
//         description: 'Reminds you to log your sleep.',
//         importance: Importance.high,
//       ),
//     );

//     await androidPlugin?.createNotificationChannel(
//       const AndroidNotificationChannel(
//         'evening_channel',
//         'Evening Check-In',
//         description: 'Reminds you to log your mood.',
//         importance: Importance.high,
//       ),
//     );
//   }

//   static Future<void> scheduleDailyReminders() async {
//     final now = DateTime.now();

//     final hasSleep = await db.entryFor(now) != null;
//     if (!hasSleep) {
//       await _plugin.zonedSchedule(
//         100,
//         'Good morning!',
//         'How did you sleep?',
//         _nextInstanceOfHour(6),
//         const NotificationDetails(
//           android: AndroidNotificationDetails(
//             'morning_channel',
//             'Morning Check-In',
//             channelDescription: 'Reminds you to log your sleep.',
//             importance: Importance.high,
//             priority: Priority.high,
//           ),
//         ),
//         androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
//       );
//     }

//     final todayStart = DateTime(now.year, now.month, now.day);
//     final todayEnd = todayStart.add(const Duration(days: 1));

//     // final todayStart = DateTime(now.year, now.month, now.day);
//     // final todayEnd = todayStart.add(const Duration(days: 1));

//     final moodEntry =
//         await (db.select(db.moodEntries)..where(
//           (t) =>
//               t.timestamp.isBetween(Variable(todayStart), Variable(todayEnd)),
//         )).getSingleOrNull();

//     if (moodEntry == null) {
//       await _plugin.zonedSchedule(
//         200,
//         'Don\'t forget to check in!',
//         'Tap to log your mood today.',
//         _nextInstanceOfHour(18),
//         const NotificationDetails(
//           android: AndroidNotificationDetails(
//             'evening_channel',
//             'Evening Check-In',
//             channelDescription: 'Reminds you to log your mood.',
//             importance: Importance.high,
//             priority: Priority.high,
//           ),
//         ),
//         androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
//       );
//     }
//   }

//   static Future<void> cancelReminders() async {
//     await _plugin.cancel(100); // Morning
//     await _plugin.cancel(200); // Evening
//   }

//   static tz.TZDateTime _nextInstanceOfHour(int hour) {
//     final now = tz.TZDateTime.now(tz.local);
//     final scheduled = tz.TZDateTime(
//       tz.local,
//       now.year,
//       now.month,
//       now.day,
//       hour,
//     );
//     return scheduled.isBefore(now)
//         ? scheduled.add(const Duration(days: 1))
//         : scheduled;
//   }
// }
