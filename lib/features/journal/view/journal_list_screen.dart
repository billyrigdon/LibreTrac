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
                                (_) => _SleepDetailScreen(entry: row.sleep!),
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

class _SleepDetailScreen extends StatelessWidget {
  const _SleepDetailScreen({required this.entry});
  final SleepEntry entry;

  @override
  Widget build(BuildContext context) {
    final dateFmt = DateFormat.yMMMd().add_jm();

    return Scaffold(
      appBar: AppBar(title: const Text('Sleep Entry')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              dateFmt.format(entry.date),
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Text('${entry.hoursSlept.toStringAsFixed(1)} hours slept'),
            Text('Quality: ${entry.quality}/5'),
            const Divider(height: 32),
            if (entry.dreamJournal != null &&
                entry.dreamJournal!.trim().isNotEmpty)
              Expanded(
                child: SingleChildScrollView(
                  child: Text(
                    entry.dreamJournal!,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
              )
            else
              const Text('No dream notes for this night.'),
          ],
        ),
      ),
    );
  }
}
