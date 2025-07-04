import 'package:drift/drift.dart';
import 'package:libretrac/core/database/type_converters.dart';

class MoodEntries extends Table {
  IntColumn get id => integer().autoIncrement()();
  DateTimeColumn get timestamp => dateTime()();
  TextColumn get customMetrics =>
      text().map(const MetricsConverter()).nullable()();

  TextColumn get notes => text().nullable()();
}
