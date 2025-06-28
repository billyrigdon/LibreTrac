import 'package:flutter/material.dart';
import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/features/mood_sleep/view/mood_chart_page.dart';
import 'package:libretrac/features/mood_sleep/view/sleep_chart_page.dart';
import 'package:libretrac/features/shared/onboard/onboard_card.dart';
import 'package:libretrac/features/shared/physics/scroll_physics.dart';
import 'package:libretrac/providers/db_provider.dart';

class MoodSleepCarousel extends StatelessWidget {
  const MoodSleepCarousel({
    required this.moodEntries,
    required this.sleepEntries,
    required this.orderedMood,
    required this.selectedMetrics,
    required this.moodColors,
    required this.allMetrics,
    required this.onMetricToggle,
    required this.window,
    super.key,
  });

  final List<MoodEntry> moodEntries;
  final List<SleepEntry> sleepEntries;
  final List<MoodEntry> orderedMood;
  final Set<String> selectedMetrics;
  final Map<String, Color> moodColors;
  final List<String> allMetrics;
  final void Function(String metric, bool isSelected) onMetricToggle;
  final MoodWindow window;

  @override
  Widget build(BuildContext context) {
    final cutoff = window.since;
    final mood = orderedMood.where((e) => e.timestamp.isAfter(cutoff)).toList();
    final sleepsW =
        sleepEntries.where((e) => e.createdAt.isAfter(cutoff)).toList();

    final hasMood = mood.length > 2;
    final hasSleep = sleepsW.length > 2;

    return SizedBox(
      height: 350,
      child: PageView(
        physics: const TighterPageScrollPhysics(),
        pageSnapping: true, // default, keeps the snap
        controller: PageController(
          viewportFraction: 1.0, // full-width pages
        ), // padEnds
        children: [
          if (hasMood)
            MoodChartPage(
              ordered: mood,
              selectedMetrics: selectedMetrics,
              moodColors: moodColors,
              allMetrics: allMetrics,
              onMetricToggle: onMetricToggle,
            )
          else
            const OnboardCard(
              icon: Icons.sentiment_satisfied_alt,
              text: 'Keep checking in daily to see your mood trends!',
            ),
          if (hasSleep)
            SleepChartPage(entries: sleepsW)
          else
            const OnboardCard(
              icon: Icons.bedtime,
              text: 'Log your sleep for at least 3 nights to unlock trends!',
            ),
        ],
      ),
    );
  }
}
