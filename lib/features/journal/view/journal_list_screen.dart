import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/features/journal/view/journal_detail_screen.dart';
import 'package:libretrac/features/mood_sleep/view/mood_checkin_screen.dart';
import 'package:libretrac/providers/db_provider.dart';

class JournalListScreen extends ConsumerWidget {
  const JournalListScreen({super.key});

  @override
  Widget build(BuildContext ctx, WidgetRef ref) {
    final moodAsync = ref.watch(journalEntriesStreamProvider);
    final sleepAsync = ref.watch(sleepStreamProvider);

    if (moodAsync.isLoading || sleepAsync.isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (moodAsync.hasError || sleepAsync.hasError) {
      final err = moodAsync.error ?? sleepAsync.error;
      final stack = moodAsync.stackTrace ?? sleepAsync.stackTrace;
      return Scaffold(body: Center(child: Text('⚠️ $err\n$stack')));
    }

    final moods = moodAsync.value ?? const <MoodEntry>[];
    final sleeps = sleepAsync.value ?? const <SleepEntry>[];

    final rows = <_JournalRow>[];

    for (final m in moods) {
      if (m.notes?.trim().isNotEmpty ?? false) rows.add(_JournalRow.mood(m));
    }

    for (final s in sleeps) {
      if (s.dreamJournal?.trim().isNotEmpty ?? false) {
        rows.add(_JournalRow.sleep(s));
      }
    }

    rows.sort((a, b) => b.date.compareTo(a.date));

    final dateFmt = DateFormat.yMMMd();

    return Scaffold(
      appBar: AppBar(title: const Text('Journal')),
      body:
          rows.isEmpty
              ? const Center(child: Text('No journal entries yet.'))
              : ListView.separated(
                itemCount: rows.length,
                separatorBuilder: (_, __) => const Divider(height: 0),
                itemBuilder: (_, i) {
                  final row = rows[i];
                  return ListTile(
                    leading: Icon(
                      row.isSleep ? Icons.bedtime : Icons.mood,
                      color:
                          row.isSleep
                              ? Theme.of(ctx).colorScheme.primary
                              : Theme.of(ctx).colorScheme.secondary,
                    ),
                    title: Text(dateFmt.format(row.date)),
                    subtitle: Text(
                      row.preview,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    onTap: () {
                      if (row.isSleep) {
                        Navigator.push(
                          ctx,
                          MaterialPageRoute(
                            builder:
                                (_) => SleepDetailScreen(entry: row.sleep!),
                          ),
                        );
                      } else {
                        Navigator.push(
                          ctx,
                          MaterialPageRoute(
                            builder:
                                (_) => JournalDetailScreen(entry: row.mood!),
                          ),
                        );
                      }
                    },
                  );
                },
              ),
      floatingActionButton: FloatingActionButton(
        onPressed:
            () => Navigator.push(
              ctx,
              MaterialPageRoute(builder: (_) => const MoodCheckInScreen()),
            ),
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _JournalRow {
  _JournalRow.mood(this.mood)
    : sleep = null,
      date = mood!.timestamp,
      preview = mood.notes!.split('\n').first,
      isSleep = false;

  _JournalRow.sleep(this.sleep)
    : mood = null,
      date = sleep!.date,
      preview = [
        '${sleep.hoursSlept.toStringAsFixed(1)} h',
        'Q${sleep.quality}',
        if (sleep.dreamJournal!.trim().isNotEmpty)
          sleep.dreamJournal!.split('\n').first,
      ].join(' • '),
      isSleep = true;

  final MoodEntry? mood;
  final SleepEntry? sleep;
  final DateTime date;
  final String preview;
  final bool isSleep;
}

class SleepDetailScreen extends StatelessWidget {
  const SleepDetailScreen({required this.entry, super.key});
  final SleepEntry entry;

  @override
  Widget build(BuildContext context) {
    final dateFmt = DateFormat.yMMMd().add_jm();

    return Scaffold(
      appBar: AppBar(title: const Text('Sleep Entry')),
      resizeToAvoidBottomInset: false,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Title + Date ────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
            child: Text(
              dateFmt.format(entry.date),
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ),
          const SizedBox(height: 16),
          // ── Dream Notes ────────────────────────────────
          if (entry.dreamJournal != null &&
              entry.dreamJournal!.trim().isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Notes',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 300,
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        return SingleChildScrollView(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: ConstrainedBox(
                            constraints: BoxConstraints(
                              minHeight: constraints.maxHeight,
                            ),
                            child: Text(
                              entry.dreamJournal!,
                              style: const TextStyle(fontSize: 22),
                              textAlign: TextAlign.left,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            )
          else
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text('No dream notes for this night.'),
            ),
          // const Spacer(),
          // ── Sleep Bar Graph ────────────────────────────────
          SizedBox(
            height: 450,
            child: Padding(
              padding: const EdgeInsets.only(right: 12),
              child: BarChart(
                BarChartData(
                  maxY: 10,
                  minY: 0,
                  barGroups: [
                    BarChartGroupData(
                      x: 0,
                      barRods: [
                        BarChartRodData(
                          toY: (entry.hoursSlept / 12.0) * 10.0,
                          width: 150,
                          color: Colors.indigo,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ],
                    ),
                    BarChartGroupData(
                      x: 1,
                      barRods: [
                        BarChartRodData(
                          toY: (entry.quality / 5.0) * 10.0,
                          width: 150,
                          color: Colors.green,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ],
                    ),
                  ],
                  gridData: FlGridData(show: false),
                  borderData: FlBorderData(show: false),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 28,
                        interval:
                            1, // shows ticks every 2 units (for even spacing)
                        getTitlesWidget: (value, _) {
                          // Convert graph value back to hours (0–10 → 0–12)
                          final hours = (value * 1.2);
                          return Text(
                            hours.toStringAsFixed(0),
                            style: const TextStyle(fontSize: 10),
                          );
                        },
                      ),
                    ),
                    rightTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 28,
                        getTitlesWidget: (value, _) {
                          // Only show labels at exact mapped positions
                          const qualityTicks = {
                            0: '0',
                            2: '1',
                            4: '2',
                            6: '3',
                            8: '4',
                            10: '5',
                          };
                          if (qualityTicks.containsKey(value)) {
                            return Text(
                              qualityTicks[value]!,
                              style: const TextStyle(fontSize: 10),
                            );
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                    ),

                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 36,
                        getTitlesWidget: (value, _) {
                          final labels = ['Hours Slept', 'Quality'];
                          return Padding(
                            padding: const EdgeInsets.only(top: 12),
                            child: Text(
                              labels[value.toInt()],
                              style: const TextStyle(fontSize: 10),
                            ),
                          );
                        },
                      ),
                    ),
                    topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                  ),
                ),
              ),
            ),
          ),
          // const SizedBox(height: 24),
        ],
      ),
    );
  }
}
