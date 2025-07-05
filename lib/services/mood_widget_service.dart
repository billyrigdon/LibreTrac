// lib/services/mood_widget_service.dart
import 'package:drift/drift.dart' show OrderingMode, OrderingTerm;
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:home_widget/home_widget.dart';
import 'package:libretrac/core/database/app_database.dart';

/// Generates a 300 × 300 px PNG every time you call [update] and
/// pushes it into the RemoteViews `<ImageView android:id="@+id/widget_image">`.
///
/// Call [MoodWidgetService.update()]
///   • once at app start-up (see `main.dart` below)
///   • immediately after every new mood check-in.
class MoodWidgetService {
  static final db = AppDatabase();
  // Same colours you already use on the Home screen :contentReference[oaicite:1]{index=1}
  static const _metricColors = {
    'energy': Colors.teal,
    'happiness': Colors.orange,
    'creativity': Colors.purple,
    'focus': Colors.blue,
    'irritability': Colors.red,
    'anxiety': Colors.brown,
  };

  static Future<void> update() async {
    // ── 1. Fetch the seven most-recent rows ────────────────────────────
    try {
      final rows =
          await (db.select(db.moodEntries)
                ..orderBy([
                  (t) => OrderingTerm(
                    expression: t.timestamp,
                    mode: OrderingMode.desc,
                  ),
                ])
                ..limit(7))
              .get();

      if (rows.isEmpty) {
        // Nothing to draw – still notify the widget so it clears itself
        // tell Android which provider to ping
        await HomeWidget.updateWidget(
          name: 'MoodWidgetProvider', // <-- here
          qualifiedAndroidName: 'com.example.libretrac.MoodWidgetProvider',
        );
        return;
      }

      final ordered = rows.reversed.toList(); // oldest → newest (left→right)
      const Size _bitmapSize = Size(272, 110);
      // ── 2. Build the chart widget off-screen ───────────────────────────
      //  ----  build the headless chart widget  ----
      final chartWidget = Directionality(
        // ① text direction
        textDirection: TextDirection.ltr,
        child: MediaQuery(
          // ② minimal MediaQuery
          data: const MediaQueryData(
            size: _bitmapSize, // fl_chart needs a non-zero size
            devicePixelRatio: 1.0, // any reasonable dpi
          ),
          child: SizedBox(
            // ③ 300×300 canvas
            width: _bitmapSize.width,
            height: _bitmapSize.height,
            child: LineChart(
              LineChartData(
                minY: 0,
                maxY: 10,
                minX: 0,
                maxX: ordered.length - 1.toDouble(),
                titlesData: FlTitlesData(show: false),
                gridData: FlGridData(show: false),
                borderData: FlBorderData(show: false),
                lineBarsData: _buildLines(ordered),
              ),
            ),
          ),
        ),
      );

      final chart = SizedBox(
        width: _bitmapSize.width,
        height: _bitmapSize.height,
        child: Padding(
          // 6 dp top & bottom keeps axes clear
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: chartWidget,
        ),
      );

      await HomeWidget.renderFlutterWidget(
        RepaintBoundary(child: chart),
        logicalSize: _bitmapSize,
        key: 'widget_image',
      );

      //  ----  rasterise to PNG and push into the widget  ----
      await HomeWidget.renderFlutterWidget(
        Padding(padding: const EdgeInsets.all(8.0), child: chartWidget),
        key: 'widget_image',
        logicalSize: const Size(380, 160),
      );

      // Notify the launcher that the bitmap changed
      // lib/services/mood_widget_service.dart
      // ...
      await HomeWidget.updateWidget(
        name: 'MoodWidgetProvider',
        qualifiedAndroidName: 'com.example.libretrac.MoodWidgetProvider',
      );
    } catch (err) {
      print(err);
    }
  }

  /// Builds six LineChartBarData traces (colour-coded).
  static List<LineChartBarData> _buildLines(List<MoodEntry> entries) {
    final lines = <LineChartBarData>[];
    final metricToColor = <String, Color>{};

    // Step 1: Get all metric keys (both standard and custom)
    final allMetrics = <String>{};
    for (final entry in entries) {
      allMetrics.addAll(entry.customMetrics?.keys ?? []);
    }

    // Step 2: Assign colors
    final predefined = {
      'Energy': Colors.teal,
      'Happiness': Colors.orange,
      'Creativity': Colors.purple,
      'Focus': Colors.blue,
      'Irritability': Colors.red,
      'Anxiety': Colors.brown,
    };

    final fallbackColors = [
      Colors.green,
      Colors.indigo,
      Colors.cyan,
      Colors.deepPurple,
      Colors.pink,
      Colors.amber,
      Colors.lime,
    ];

    int colorIndex = 0;
    for (final metric in allMetrics) {
      final formatted = _capitalize(metric);
      metricToColor[metric] =
          predefined[formatted] ??
          fallbackColors[colorIndex++ % fallbackColors.length];
    }

    // Step 3: Build lines
    for (final metric in allMetrics) {
      final spots = <FlSpot>[];

      for (int i = 0; i < entries.length; i++) {
        final value = entries[i].customMetrics?[metric];
        if (value != null) {
          spots.add(FlSpot(i.toDouble(), value.toDouble()));
        }
      }

      if (spots.isNotEmpty) {
        lines.add(
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: metricToColor[metric],
            barWidth: 3,
            dotData: FlDotData(show: false),
            belowBarData: BarAreaData(show: false),
          ),
        );
      }
    }

    return lines;
  }

  static String _capitalize(String input) {
    if (input.isEmpty) return input;
    return input[0].toUpperCase() + input.substring(1).toLowerCase();
  }
}
