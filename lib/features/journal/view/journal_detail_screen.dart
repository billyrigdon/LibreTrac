import 'package:drift/drift.dart' as drift;
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/providers/db_provider.dart';

class JournalDetailScreen extends ConsumerStatefulWidget {
  const JournalDetailScreen({required this.entry, super.key});
  final MoodEntry entry;

  @override
  ConsumerState<JournalDetailScreen> createState() =>
      _JournalDetailScreenState();
}

class _JournalDetailScreenState extends ConsumerState<JournalDetailScreen> {
  late TextEditingController _notes;
  bool _editing = false;

  @override
  void initState() {
    super.initState();
    _notes = TextEditingController(text: widget.entry.notes);
  }

  Future<void> _saveNotes() async {
    await ref
        .read(moodRepoProvider)
        .update(widget.entry.copyWith(notes: drift.Value(_notes.text.trim())));
    if (mounted) setState(() => _editing = false);
  }

  Future<void> _delete() async {
    final ok = await showDialog<bool>(
      context: context,
      builder:
          (_) => AlertDialog(
            title: const Text('Delete entry?'),
            content: const Text('This cannot be undone.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Delete'),
              ),
            ],
          ),
    );
    if (ok == true) {
      await ref.read(moodRepoProvider).delete(widget.entry.id);
      if (mounted) Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext ctx) {
    final dateFmt = DateFormat.yMMMd().add_jm();

    final customMetrics = widget.entry.customMetrics ?? {};
    final metricDefs = ref.watch(customMetricsProvider);

    final bars =
        metricDefs
            .where((m) => customMetrics.containsKey(m.name))
            .map((m) => (m.name, customMetrics[m.name]!, m.color))
            .toList();


    final Map<String, Color> moodColors = {
      'Energy': Colors.teal,
      'Happiness': Colors.orange,
      'Creativity': Colors.purple,
      'Focus': Colors.blue,
      'Irritability': Colors.red,
      'Anxiety': Colors.brown,
    };

    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        title: Text(dateFmt.format(widget.entry.timestamp)),
        actions: [
          IconButton(
            icon: Icon(_editing ? Icons.save : Icons.edit),
            onPressed:
                () => _editing ? _saveNotes() : setState(() => _editing = true),
          ),
          IconButton(icon: const Icon(Icons.delete), onPressed: _delete),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Notes ────────────────────────────────────────────────
          _editing
              ? Padding(
                padding: const EdgeInsets.only(
                  top: 32.0,
                  right: 8,
                  left: 8,
                  bottom: 0,
                ),
                child: TextField(
                  controller: _notes,
                  decoration: const InputDecoration(
                    labelText: 'Notes',
                    border: OutlineInputBorder(),
                  ),
                  minLines: 10,
                  maxLines: 10,
                ),
              )
              : Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 320,
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          return SingleChildScrollView(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: ConstrainedBox(
                              constraints: BoxConstraints(
                                minHeight: constraints.maxHeight,
                              ),
                              child: Text(
                                _notes.text.isEmpty ? 'No notes.' : _notes.text,
                                style: const TextStyle(fontSize: 18),
                                textAlign: TextAlign.left,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
          Expanded(child: Column()),
          // ── Mood Bar Graph ───────────────────────────────────────
          SizedBox(
            height: 450,
            child: Padding(
              padding: const EdgeInsets.only(right: 12.0, bottom: 24),
              child: BarChart(
                BarChartData(
                  maxY: 10,
                  minY: 0,
                  barGroups: [
                    for (int i = 0; i < bars.length; i++)
                      BarChartGroupData(
                        x: i,
                        barRods: [
                          BarChartRodData(
                            toY: bars[i].$2.toDouble(),
                            width: 30,
                            color: bars[i].$3, // color from CustomMetric
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
                        getTitlesWidget:
                            (value, meta) => Text(
                              value.toInt().toString(),
                              style: const TextStyle(
                                fontSize: 10,
                              ), // Smaller font size
                            ),
                        reservedSize: 14, // Optional: reduce space if needed ),
                      ),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 36,
                        getTitlesWidget:
                            (value, _) => Transform.rotate(
                              angle: -0.0,
                              child: Padding(
                                padding: const EdgeInsets.only(top: 12.0),
                                child: Text(
                                  bars[value.toInt()].$1,
                                  style: const TextStyle(fontSize: 10),
                                ),
                              ),
                            ),
                      ),
                    ),
                    topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                  ),
                ),
              ),
            ),
          ),
          // SizedBox(height: 48),
        ],
      ),
    );
  }
}
