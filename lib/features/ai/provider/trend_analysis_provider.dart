import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:libretrac/features/ai/service/openai_api_service.dart';
import 'package:libretrac/providers/db_provider.dart';

enum TrendRange { week, month, threeMonths, sixMonths }

extension on TrendRange {
  int get days => switch (this) {
    TrendRange.week => 7,
    TrendRange.month => 30,
    TrendRange.threeMonths => 90,
    TrendRange.sixMonths => 180,
  };
}

final trendRangeProvider = StateProvider<TrendRange>((_) => TrendRange.week);

final analysisProvider = FutureProvider.autoDispose<String?>((ref) async {
  final range = ref.watch(trendRangeProvider);
  final since = DateTime.now().subtract(Duration(days: range.days));

  final db = ref.read(dbProvider);
  final moods = await db.moodEntriesSince(since);
  final cog = await db.reactionResultsSince(since);
  final subs = await db.substancesActiveSince(since);
  final sleeps = await db.sleepEntriesSince(since);

  if (moods.isEmpty && cog.isEmpty) return null;

  final api = OpenAIAPI.instance;
  return api.analyzeTrends(
    TrendRequest(
      since: since,
      moods: moods,
      cognitive: cog,
      substances: subs,
      sleeps: sleeps,
    ),
  );
});
