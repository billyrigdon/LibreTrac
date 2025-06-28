import 'package:drift/drift.dart';

class MoodEntries extends Table {
  IntColumn get id => integer().autoIncrement()();
  DateTimeColumn get timestamp => dateTime()();
  IntColumn get energy => integer()();
  IntColumn get happiness => integer()();
  IntColumn get creativity => integer()();
  IntColumn get focus => integer()();
  IntColumn get irritability => integer()();
  IntColumn get anxiety => integer()();
  TextColumn get notes => text().nullable()();
}
