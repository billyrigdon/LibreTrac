import 'package:drift/drift.dart';
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
        .update(widget.entry.copyWith(notes: Value(_notes.text.trim())));
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

    final bars = [
      ('Energy', widget.entry.energy),
      ('Happy', widget.entry.happiness),
      ('Creative', widget.entry.creativity),
      ('Focus', widget.entry.focus),
      ('Irritable', widget.entry.irritability),
      ('Anxiety', widget.entry.anxiety),
    ];

    return Scaffold(
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
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            // ── Six-bar mood graph ────────────────────────────────
            AspectRatio(
              aspectRatio: 1.6,
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
                            width: 12,
                          ),
                        ],
                      ),
                  ],
                  gridData: FlGridData(show: false),
                  borderData: FlBorderData(show: false),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: true),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 32,
                        getTitlesWidget:
                            (value, _) => Transform.rotate(
                              angle: -0.8,
                              child: Text(
                                bars[value.toInt()].$1,
                                style: const TextStyle(fontSize: 10),
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
            const SizedBox(height: 24),
            // ── Editable notes ───────────────────────────────────
            TextField(
              controller: _notes,
              readOnly: !_editing,
              decoration: const InputDecoration(
                labelText: 'Notes',
                border: OutlineInputBorder(),
              ),
              maxLines: null,
            ),
          ],
        ),
      ),
    );
  }
}
