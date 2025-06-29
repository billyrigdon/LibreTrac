import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:libretrac/features/ai/view/trend_analysis_dialog.dart';
import 'package:libretrac/features/cognitive/view/cognitive_chart.dart';
import 'package:libretrac/features/cognitive/view/digit_span_test.dart';
import 'package:libretrac/features/cognitive/view/go_no_go_test.dart';
import 'package:libretrac/features/cognitive/view/n_back_test.dart';
import 'package:libretrac/features/cognitive/view/reaction_test_screen.dart';
import 'package:libretrac/features/cognitive/view/stroop_test_screen.dart';
import 'package:libretrac/features/cognitive/view/symbol_search_test.dart';
import 'package:libretrac/features/home/view/main_drawer.dart';
import 'package:libretrac/features/mood_sleep/view/mood_sleep_carousel.dart';
import 'package:libretrac/features/mood_sleep/view/sleep_checkin_dialog.dart';
import '../../../core/database/app_database.dart';
import '../../../providers/db_provider.dart';
import '../../mood_sleep/view/mood_checkin_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final List<String> allMetrics = [
    'Energy',
    'Happiness',
    'Creativity',
    'Focus',
    'Irritability',
    'Anxiety',
  ];

  final Set<String> selectedMetrics = {
    'Happiness',
    'Energy',
    'Anxiety',
    'Creativity',
    'Focus',
    'Irritability',
  };

  final Map<String, Color> moodColors = {
    'Energy': Colors.teal,
    'Happiness': Colors.orange,
    'Creativity': Colors.purple,
    'Focus': Colors.blue,
    'Irritability': Colors.red,
    'Anxiety': Colors.brown,
  };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _maybePromptSleep());
  }

  Future<void> _maybePromptSleep() async {
    final db = ref.read(dbProvider);
    final today = await db.entryFor(DateTime.now());
    if (today != null) return; // already logged
    if (!mounted) return;
    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const SleepCheckinDialog(),
    );
  }

  void _showCognitiveSheet() {
    showModalBottomSheet(
      context: context,
      builder:
          (_) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _sheetItem('Reaction Time', const ReactionTestScreen()),
              _sheetItem('Stroop Test', const StroopTestScreen()),
              _sheetItem('N-Back Test', const NBackTestScreen()),
              _sheetItem('Go / No-Go', const GoNoGoTestScreen()),
              _sheetItem('Digit Span', const DigitSpanTestScreen()),
              _sheetItem('Symbol Search', const SymbolSearchScreen()),
            ],
          ),
    );
  }

  ListTile _sheetItem(String label, Widget screen) {
    return ListTile(
      title: Text(label),
      onTap: () async {
        Navigator.pop(context);
        await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => screen),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final window = ref.watch(moodWindowProvider);
    final AsyncValue<List<SleepEntry>> sleeps = ref.watch(sleepStreamProvider);
    // final detailed = ref.watch(showAllCheckInsProvider);

    return PopScope(
      canPop: false, // () async => false,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('LibreTrac'),
          actions: [
            IconButton(
              tooltip: 'Analyze Trends',
              icon: const Icon(Icons.auto_awesome),
              onPressed: () => showTrendDialog(context, ref),
            ),
            PopupMenuButton<Object>(
              icon: const Icon(Icons.filter_alt),
              onSelected: (value) {
                if (value is MoodWindow) {
                  ref.read(moodWindowProvider.notifier).state = value;
                } else if (value == 'toggleDetailed') {
                  ref
                      .read(showAllCheckInsProvider.notifier)
                      .update((prev) => !prev);
                }
              },
              itemBuilder: (ctx) {
                final detailed = ref.watch(showAllCheckInsProvider);
                final selectedWindow = ref.watch(moodWindowProvider);

                return [
                  CheckedPopupMenuItem(
                    value: MoodWindow.week,
                    checked: selectedWindow == MoodWindow.week,
                    child: const Text('7 days'),
                  ),
                  CheckedPopupMenuItem(
                    value: MoodWindow.month,
                    checked: selectedWindow == MoodWindow.month,
                    child: const Text('1 month'),
                  ),
                  CheckedPopupMenuItem(
                    value: MoodWindow.threeMonths,
                    checked: selectedWindow == MoodWindow.threeMonths,
                    child: const Text('3 months'),
                  ),
                  CheckedPopupMenuItem(
                    value: MoodWindow.sixMonths,
                    checked: selectedWindow == MoodWindow.sixMonths,
                    child: const Text('6 months'),
                  ),
                  const PopupMenuDivider(),
                  CheckedPopupMenuItem(
                    value: 'toggleDetailed',
                    checked: detailed,
                    child: const Text('Detailed View'),
                  ),
                ];
              },
            ),

            // PopupMenuButton<MoodWindow>(
            //   initialValue: window,
            //   onSelected:
            //       (w) => ref.read(moodWindowProvider.notifier).state = w,
            //   itemBuilder:
            //       (ctx) => [
            //         const PopupMenuItem(
            //           value: MoodWindow.week,
            //           child: Text('7 days'),
            //         ),
            //         const PopupMenuItem(
            //           value: MoodWindow.month,
            //           child: Text('1 month'),
            //         ),
            //         const PopupMenuItem(
            //           value: MoodWindow.threeMonths,
            //           child: Text('3 months'),
            //         ),
            //         const PopupMenuItem(
            //           value: MoodWindow.sixMonths,
            //           child: Text('6 months'),
            //         ),
            //       ],
            //   icon: const Icon(Icons.filter_alt),
            // ),
          ],
        ),
        drawer: MainDrawer(() => setState(() {})),
        body: Consumer(
          builder: (context, ref, _) {
            final detailed = ref.watch(showAllCheckInsProvider);

            final AsyncValue<List<MoodEntry>> moods = ref.watch(
              filteredMoodEntriesProvider((
                window: window,
                showAllCheckIns: detailed,
              )),
            );

            // final AsyncValue<List<MoodEntry>> moods = ref.watch(
            //   filteredMoodEntriesProvider((
            //     window: window,
            //     showAllCheckIns: false, // or true if user chooses to view all
            //   )),
            // );

            return moods.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, __) => Center(child: Text('Error: $e')),
              data: (entries) {
                final hasEnoughData = entries.length > 2;
                final ordered = [...entries] // copy
                ..sort((a, b) => a.timestamp.compareTo(b.timestamp));

                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      if (!hasEnoughData)
                        SizedBox(
                          height: 350,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(
                                Icons.sentiment_satisfied_alt,
                                size: 80,
                                color: Colors.grey,
                              ),
                              SizedBox(height: 12),
                              Text(
                                'Keep checking in daily to see your mood trends!',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        ),
                      if (hasEnoughData) ...[
                        Expanded(
                          child: MoodSleepCarousel(
                            moodEntries: entries,
                            sleepEntries: sleeps.value ?? const [],
                            orderedMood: ordered,
                            selectedMetrics: selectedMetrics,
                            moodColors: moodColors,
                            allMetrics: allMetrics,
                            window: window,
                            onMetricToggle: (metric, isSelected) {
                              setState(
                                () =>
                                    isSelected
                                        ? selectedMetrics.add(metric)
                                        : selectedMetrics.length > 1
                                        ? selectedMetrics.remove(metric)
                                        : null,
                              );
                            },
                          ),
                        ),

                        FutureBuilder(
                          future:
                              ref
                                  .read(dbProvider)
                                  .select(ref.read(dbProvider).reactionResults)
                                  .get(),
                          builder: (context, snap) {
                            if (!snap.hasData || snap.data!.isEmpty) {
                              return const SizedBox.shrink();
                            }
                            return CognitiveChart().showCognitiveChart(
                              ref,
                              window,
                              detailed,
                            );
                          },
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            ElevatedButton.icon(
                              icon: const Icon(Icons.edit),
                              label: const Text('Mood Check-In'),
                              onPressed: () async {
                                await Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const MoodCheckInScreen(),
                                  ),
                                );
                              },
                            ),
                            const SizedBox(width: 12),
                            ElevatedButton.icon(
                              icon: const Icon(Icons.flash_on),
                              label: const Text('Cognitive Tests'),
                              onPressed: _showCognitiveSheet,
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
