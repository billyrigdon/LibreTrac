import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/database/app_database.dart';

/// Single shared DB instance
final dbProvider = Provider<AppDatabase>((ref) => AppDatabase());

/* ─────────────────────────  SUBSTANCES  ───────────────────────── */

final substancesStreamProvider = StreamProvider.autoDispose<List<Substance>>((
  ref,
) {
  final db = ref.watch(dbProvider);
  return db.select(db.substances).watch();
});

class SubstanceRepo {
  SubstanceRepo(this._db);
  final AppDatabase _db;

  Future<int> add(SubstancesCompanion s) => _db.into(_db.substances).insert(s);
  Future<bool> update(Substance s) => _db.update(_db.substances).replace(s);
  Future<int> delete(int id) =>
      (_db.delete(_db.substances)..where((tbl) => tbl.id.equals(id))).go();
  Future<int> stop(int id) {
    return (_db.update(_db.substances)..where(
      (t) => t.id.equals(id),
    )).write(SubstancesCompanion(stoppedAt: Value(DateTime.now())));
  }
}

final substanceRepoProvider = Provider<SubstanceRepo>(
  (ref) => SubstanceRepo(ref.read(dbProvider)),
);

final activeSubstancesStreamProvider =
    StreamProvider.autoDispose<List<Substance>>((ref) {
      final db = ref.watch(dbProvider);
      return (db.select(db.substances)
        ..where((tbl) => tbl.stoppedAt.isNull())).watch();
    });

final pastSubstancesStreamProvider =
    StreamProvider.autoDispose<List<Substance>>((ref) {
      final db = ref.watch(dbProvider);
      return (db.select(db.substances)
        ..where((tbl) => tbl.stoppedAt.isNotNull())).watch();
    });

/* ───────────────────────────  MOODS  ──────────────────────────── */

/// **Assumes** your Drift table is called `moodEntries` and the data
/// class is `MoodEntry`.  If you named them differently, just adjust.
final moodEntriesStreamProvider = StreamProvider.autoDispose<List<MoodEntry>>((
  ref,
) {
  final db = ref.watch(dbProvider);
  return db.select(db.moodEntries).watch();
});

class MoodRepo {
  MoodRepo(this._db);
  final AppDatabase _db;

  Future<int> add(MoodEntriesCompanion m) =>
      _db.into(_db.moodEntries).insert(m);

  Future<bool> update(MoodEntry m) => _db.update(_db.moodEntries).replace(m);

  Future<int> delete(int id) =>
      (_db.delete(_db.moodEntries)..where((t) => t.id.equals(id))).go();

  /// Handy stream (already used by the journal list screen)
  Stream<List<MoodEntry>> watchAll() => _db.select(_db.moodEntries).watch();
}

final moodRepoProvider = Provider<MoodRepo>(
  (ref) => MoodRepo(ref.read(dbProvider)),
);

final journalEntriesStreamProvider = StreamProvider.autoDispose<
  List<MoodEntry>
>((ref) {
  final db = ref.watch(dbProvider);

  final query =
      db.select(db.moodEntries)
        ..where(
          (tbl) =>
              tbl.notes.isNotNull() & // notes IS NOT NULL
              tbl.notes.length.isBiggerThanValue(0), // notes <> ''
        )
        ..orderBy([
          (t) => OrderingTerm(expression: t.timestamp, mode: OrderingMode.desc),
        ]);

  return query.watch();
});

/// Handy JSON backup / restore helpers for every current table.
extension BackupOps on AppDatabase {
  /* ── EXPORT ─────────────────────────────────────────────────────────── */
  /* ── EXPORT ─────────────────────────────────────────────────────────── */
  Future<Map<String, dynamic>> exportData() async {
    return {
      'substances':
          (await select(substances).get()).map((e) => e.toJson()).toList(),
      'moodEntries':
          (await select(moodEntries).get()).map((e) => e.toJson()).toList(),
      'sleepEntries':
          (await select(sleepEntries).get())
              .map((e) => e.toJson())
              .toList(), // ← NEW
      'reactionResults':
          (await select(reactionResults).get()).map((e) => e.toJson()).toList(),
      'stroopResults':
          (await select(stroopResults).get()).map((e) => e.toJson()).toList(),
      'nBackResults':
          (await select(nBackResults).get()).map((e) => e.toJson()).toList(),
      'goNoGoResults':
          (await select(goNoGoResults).get()).map((e) => e.toJson()).toList(),
      'digitSpanResults':
          (await select(digitSpanResults).get())
              .map((e) => e.toJson())
              .toList(),
      'symbolSearchResults':
          (await select(symbolSearchResults).get())
              .map((e) => e.toJson())
              .toList(),
    };
  }

  /* ── IMPORT (⚠ overwrites everything) ───────────────────────────────── */
  Future<void> importData(Map<String, dynamic> json) async {
    await transaction(() async {
      // 1. wipe
      await batch(
        (b) =>
            b
              ..deleteAll(substances)
              ..deleteAll(moodEntries)
              ..deleteAll(reactionResults)
              ..deleteAll(stroopResults)
              ..deleteAll(nBackResults)
              ..deleteAll(goNoGoResults)
              ..deleteAll(digitSpanResults)
              ..deleteAll(symbolSearchResults)
              ..deleteAll(sleepEntries),
      );

      // 2. helper – takes raw JSON → companion → insert
      Future<void> _addAll<L, D>(
        List<dynamic>? list,
        Insertable<D> Function(Map<String, dynamic>) toCompanion,
        TableInfo<Table, D> table,
      ) async {
        if (list == null) return;
        for (final row in list) {
          await into(table).insert(toCompanion(Map<String, dynamic>.from(row)));
        }
      }

      await _addAll(
        json['substances'],
        (m) => Substance.fromJson(m).toCompanion(true),
        substances,
      );
      await _addAll(
        json['moodEntries'],
        (m) => MoodEntry.fromJson(m).toCompanion(true),
        moodEntries,
      );
      await _addAll(
        json['reactionResults'],
        (m) => ReactionResult.fromJson(m).toCompanion(true),
        reactionResults,
      );
      await _addAll(
        json['stroopResults'],
        (m) => StroopResult.fromJson(m).toCompanion(true),
        stroopResults,
      );
      await _addAll(
        json['nBackResults'],
        (m) => NBackResult.fromJson(m).toCompanion(true),
        nBackResults,
      );
      await _addAll(
        json['goNoGoResults'],
        (m) => GoNoGoResult.fromJson(m).toCompanion(true),
        goNoGoResults,
      );
      await _addAll(
        json['digitSpanResults'],
        (m) => DigitSpanResult.fromJson(m).toCompanion(true),
        digitSpanResults,
      );
      await _addAll(
        json['symbolSearchResults'],
        (m) => SymbolSearchResult.fromJson(m).toCompanion(true),
        symbolSearchResults,
      );
      await _addAll(
        json['sleepEntries'],
        (m) => SleepEntry.fromJson(m).toCompanion(true),
        sleepEntries,
      );
    });
  }
}

// NEW: enum + helper
enum MoodWindow { week, month, threeMonths, sixMonths }

extension _WindowDays on MoodWindow {
  int get days => switch (this) {
    MoodWindow.week => 7,
    MoodWindow.month => 30,
    MoodWindow.threeMonths => 90,
    MoodWindow.sixMonths => 180,
  };
}

extension MoodWindowExt on MoodWindow {
  DateTime get since {
    final now = DateTime.now();
    switch (this) {
      case MoodWindow.week:
        return now.subtract(const Duration(days: 7));
      case MoodWindow.month:
        return DateTime(now.year, now.month - 1, now.day);
      case MoodWindow.threeMonths:
        return DateTime(now.year, now.month - 3, now.day);
      case MoodWindow.sixMonths:
        return DateTime(now.year, now.month - 6, now.day);
    }
  }
}

/// Currently‐selected window (defaults to the old “7-day” view).
final moodWindowProvider = StateProvider<MoodWindow>((_) => MoodWindow.week);

/// Live list that honours the selected window.
final filteredMoodEntriesProvider = StreamProvider.autoDispose<List<MoodEntry>>(
  (ref) {
    final db = ref.watch(dbProvider);
    final window = ref.watch(moodWindowProvider);
    final cutOff = DateTime.now().subtract(Duration(days: window.days));

    final query =
        db.select(db.moodEntries)
          ..where((t) => t.timestamp.isBiggerOrEqualValue(cutOff))
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.timestamp, mode: OrderingMode.desc),
          ]);

    return query.watch();
  },
);

/* ─────────────────────  TREND-QUERY HELPERS  ──────────────────────
   One-shot queries that the HomeScreen uses to build the payload
   for the OpenAI trend-analysis call.
─────────────────────────────────────────────────────────────────── */

/// Extension on the generated `AppDatabase` that exposes three concise
/// helper methods. No new tables are required.
extension TrendQueries on AppDatabase {
  /* Mood entries on or after [since] (inclusive). */
  Future<List<MoodEntry>> moodEntriesSince(DateTime since) {
    return (select(moodEntries)
      ..where((t) => t.timestamp.isBiggerOrEqualValue(since))).get();
  }

  /* Cognitive-test results (reaction-time) on or after [since].  
     🔺 Adjust the column name (`timestamp`) if yours is different. */
  Future<List<ReactionResult>> reactionResultsSince(DateTime since) {
    return (select(reactionResults)
      ..where((t) => t.timestamp.isBiggerOrEqualValue(since))).get();
  }

  Future<List<SleepEntry>> sleepEntriesSince(DateTime since) {
    return (select(sleepEntries)
      ..where((t) => t.date.isBiggerOrEqualValue(since))).get();
  }

  /* Substances that were “active” at any point in the window that
     starts at [since] and ends **now**.
       • startedAt ≤ now
       • stoppedAt is NULL  OR  stoppedAt ≥ since                       */
  Future<List<Substance>> substancesActiveSince(DateTime since) {
    final now = DateTime.now();
    return (select(substances)..where(
      (t) =>
          t.addedAt.isSmallerOrEqualValue(now) &
          (t.stoppedAt.isNull() | t.stoppedAt.isBiggerOrEqualValue(since)),
    )).get();
  }
}

/* ─────────── OPTIONAL RIVERPOD HELPERS (convenience) ──────────── */
/* If you prefer plain `db.*Since()` calls in the UI, delete these. */

final moodsSinceProvider = FutureProvider.autoDispose
    .family<List<MoodEntry>, DateTime>(
      (ref, since) => ref.watch(dbProvider).moodEntriesSince(since),
    );

final reactionResultsSinceProvider = FutureProvider.autoDispose
    .family<List<ReactionResult>, DateTime>(
      (ref, since) => ref.watch(dbProvider).reactionResultsSince(since),
    );

final substancesActiveSinceProvider = FutureProvider.autoDispose
    .family<List<Substance>, DateTime>(
      (ref, since) => ref.watch(dbProvider).substancesActiveSince(since),
    );

final sleepStreamProvider = StreamProvider.autoDispose(
  (ref) => ref.watch(dbProvider).watchAllSleep(),
);
