import 'dart:math';

import 'package:drift/drift.dart' as drift;
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:libretrac/features/cognitive/model/cog_test_kind.dart';
import 'package:libretrac/providers/db_provider.dart';

class CognitiveChart {
  showCognitiveChart(WidgetRef ref, MoodWindow window, bool detailed) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        const Center(
          child: Text(
            'Cognitive Trends',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 12),

        SizedBox(
          height: 220,
          child: PageView.builder(
            itemCount: CogTestKind.values.length,
            controller: PageController(viewportFraction: .92, keepPage: true),
            itemBuilder: (ctx, index) {
              final kind = CogTestKind.values[index];
              final db = ref.read(dbProvider);

              // Pull table dynamically
              final table = kind.table(db);

              return FutureBuilder(
                future:
                    db
                        .select(
                          table
                              as drift.ResultSetImplementation<
                                drift.HasResultSet,
                                dynamic
                              >,
                        )
                        .get(),
                builder: (_, snap) {
                  final cutoff = DateTime.now().subtract(
                    Duration(days: window.days + 1),
                  );

                  var rows = [];

                  if (snap.data != null) {
                    rows =
                        snap.data!
                            .where((r) => r.timestamp.isAfter(cutoff))
                            .toList()
                          ..sort((a, b) => a.timestamp.compareTo(b.timestamp));
                  }
                  // Condense: Keep only the latest per day unless few results or detailed is on
                  List<dynamic> processed;
                  if (detailed || rows.length <= window.days) {
                    processed = rows;
                  } else {
                    final Map<String, dynamic> latestPerDay = {};
                    for (final r in rows) {
                      final dayKey =
                          DateTime(
                            r.timestamp.year,
                            r.timestamp.month,
                            r.timestamp.day,
                          ).toIso8601String();
                      if (!latestPerDay.containsKey(dayKey) ||
                          r.timestamp.isAfter(
                            latestPerDay[dayKey]!.timestamp,
                          )) {
                        latestPerDay[dayKey] = r;
                      }
                    }
                    processed =
                        latestPerDay.values.toList()
                          ..sort((a, b) => a.timestamp.compareTo(b.timestamp));
                  }

                  final raw = [
                    for (int i = 0; i < processed.length; i++)
                      FlSpot(i.toDouble(), kind.y(processed[i])),
                  ];

                  final (lo, hi) = kind.refRange;
                  final span = (hi - lo).abs();

                  double toPct(double v) {
                    final clamped = v.clamp(min(lo, hi), max(lo, hi));
                    final frac =
                        kind.lowerIsBetter
                            ? (hi - clamped) / span
                            : (clamped - lo) / span;
                    return frac * 100;
                  }

                  final spots = [for (final p in raw) FlSpot(p.x, toPct(p.y))];

                  return Card(
                    key: Key(kind.label),
                    elevation: 2,
                    margin: const EdgeInsets.only(right: 8),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        children: [
                          Text(
                            kind.label,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Expanded(
                            child: RepaintBoundary(
                              child: LineChart(
                                LineChartData(
                                  clipData: FlClipData.all(),
                                  lineTouchData: LineTouchData(
                                    enabled: false,
                                    handleBuiltInTouches: false,
                                  ),
                                  minY: 0,
                                  maxY: 105,
                                  minX: 0,
                                  maxX: (spots.length - 1).toDouble(),
                                  gridData: FlGridData(show: true),
                                  titlesData: FlTitlesData(
                                    rightTitles: AxisTitles(
                                      sideTitles: SideTitles(
                                        maxIncluded: false,
                                        showTitles: true,
                                        reservedSize: 42,
                                        interval: 50,
                                      ),
                                    ),
                                    leftTitles: AxisTitles(
                                      sideTitles: SideTitles(
                                        maxIncluded: false,
                                        showTitles: true,
                                        reservedSize: 42,
                                        interval: 50,
                                      ),
                                    ),
                                    topTitles: AxisTitles(
                                      sideTitles: SideTitles(showTitles: false),
                                    ),
                                    bottomTitles: AxisTitles(
                                      sideTitles: SideTitles(
                                        showTitles: true,
                                        interval: 1,
                                        getTitlesWidget: (value, _) {
                                          final i = value.toInt();
                                          if (i < 0 || i >= processed.length) {
                                            return const SizedBox.shrink();
                                          }
                                          final d = processed[i].timestamp;
                                          return Text(
                                            '${d.month}/${d.day}',
                                            style: const TextStyle(
                                              fontSize: 10,
                                            ),
                                          );
                                        },
                                      ),
                                    ),
                                  ),
                                  lineBarsData: [
                                    LineChartBarData(
                                      spots: spots,
                                      isCurved: true,
                                      color: Colors.amber,
                                      barWidth: 3,
                                      dotData: FlDotData(show: false),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
