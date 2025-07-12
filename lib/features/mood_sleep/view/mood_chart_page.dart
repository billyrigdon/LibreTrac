import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/providers/db_provider.dart';

class MoodChartPage extends StatelessWidget {
  MoodChartPage({
    required this.ordered,
    required this.selectedMetrics,
    // required this.moodColors,
    required this.allMetrics,
    required this.onMetricToggle,
    required this.customMetrics,
    super.key,
  });

  final List<MoodEntry> ordered;
  final Set<String> selectedMetrics;
  // final Map<String, Color> moodColors;
  // final List<String> allMetrics;
  final List<CustomMetric> allMetrics;

  final void Function(String metric, bool isSelected) onMetricToggle;
  final List<CustomMetric>? customMetrics;

  List<LineChartBarData> _generateMoodLines(List<MoodEntry> entries) {
    final List<LineChartBarData> lines = [];

    for (final metric in allMetrics.where(
      (m) => selectedMetrics.contains(m.name),
    )) {
      final spots = <FlSpot>[];

      for (int i = 0; i < entries.length; i++) {
        final entry = entries[i];
        final value = entry.customMetrics?[metric.name]?.toDouble();

        if (value != null) {
          spots.add(FlSpot(i.toDouble(), value));
        }
      }

      if (spots.isNotEmpty) {
        lines.add(
          LineChartBarData(
            spots: spots,
            isCurved: true,
            barWidth: 3,
            color: metric.color,
            dotData: FlDotData(show: false),
            belowBarData: BarAreaData(show: false),
          ),
        );
      }
    }

    return lines;
  }

  // List<LineChartBarData> _generateMoodLines(List<MoodEntry> entries) {
  //   final List<LineChartBarData> lines = [];

  //   final metrics =
  //       selectedMetrics.isEmpty
  //           ? allMetrics
  //               .toSet() // default when the app is freshly launched
  //           : selectedMetrics;

  //   for (final metric in metrics) {
  //     final spots = <FlSpot>[];

  //     for (int i = 0; i < entries.length; i++) {
  //       final entry = entries[i];
  //       final double? value = switch (metric) {
  //         'Energy' => entry.energy.toDouble(),
  //         'Happiness' => entry.happiness.toDouble(),
  //         'Creativity' => entry.creativity.toDouble(),
  //         'Focus' => entry.focus.toDouble(),
  //         'Irritability' => entry.irritability.toDouble(),
  //         'Anxiety' => entry.anxiety.toDouble(),
  //         _ => null,
  //       };

  //       if (value != null) {
  //         spots.add(FlSpot(i.toDouble(), value));
  //       }
  //     }

  //     if (spots.isNotEmpty) {
  //       lines.add(
  //         LineChartBarData(
  //           spots: spots,
  //           isCurved: true,
  //           barWidth: 3,
  //           color: moodColors[metric],
  //           dotData: FlDotData(show: false),
  //           belowBarData: BarAreaData(show: false),
  //         ),
  //       );
  //     }
  //   }

  //   return lines;
  // }

  @override
  Widget build(BuildContext context) {
    print('testing');
    return Column(
      children: [
        Wrap(
          alignment: WrapAlignment.center,
          spacing: 8,
          children:
              allMetrics.map((metric) {
                final selected = selectedMetrics.contains(metric.name);
                return FilterChip(
                  label: Text(metric.name),
                  selected: selected,
                  selectedColor: metric.color.withOpacity(.30),
                  onSelected: (value) => onMetricToggle(metric.name, value),
                );
              }).toList(),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: Card(
            elevation: 2,
            margin: const EdgeInsets.only(right: 2),
            child: LineChart(
              LineChartData(
                lineTouchData: LineTouchData(
                  enabled: false, // <- disables built-in touch handling
                  handleBuiltInTouches: false,
                ),
                minY: 0,
                maxY: 10,
                minX: 0,
                maxX: (ordered.length - 1).toDouble(),
                gridData: FlGridData(show: true),
                titlesData: FlTitlesData(
                  topTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      reservedSize: 42,
                      showTitles: true,
                      interval: 2,
                    ),
                  ),
                  rightTitles: AxisTitles(
                    sideTitles: SideTitles(
                      reservedSize: 42,
                      showTitles: true,
                      interval: 2,
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      interval: 1,
                      getTitlesWidget: (value, _) {
                        final i = value.toInt();
                        if (i < 0 || i >= ordered.length) {
                          return const SizedBox();
                        }
                        final d = ordered[i].timestamp;
                        return Text(
                          '${d.month}/${d.day}',
                          style: const TextStyle(fontSize: 10),
                        );
                      },
                    ),
                  ),
                ),
                lineBarsData: _generateMoodLines(ordered),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
