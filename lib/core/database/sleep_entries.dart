// lib/core/database/tables/sleep_entries.dart
import 'package:drift/drift.dart';

class SleepEntries extends Table {
  IntColumn get id => integer().autoIncrement()();

  /// Date you WOKE UP (so each night maps to the following day)
  DateTimeColumn get date => dateTime()();

  RealColumn get hoursSlept => real()(); // e.g. 7.5
  TextColumn get dreamJournal => text().nullable()(); // optional
  IntColumn get quality =>
      integer().withDefault(const Constant(3))(); // 1-5 subjective

  DateTimeColumn get createdAt =>
      dateTime().clientDefault(() => DateTime.now())();
}
