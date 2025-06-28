import 'package:drift/drift.dart' as drift;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:libretrac/services/mood_widget_service.dart';
import '../../../core/database/app_database.dart';
import '../../../providers/db_provider.dart';
import 'package:intl/intl.dart';

class MoodCheckInScreen extends ConsumerStatefulWidget {
  const MoodCheckInScreen({super.key});

  @override
  ConsumerState<MoodCheckInScreen> createState() => _MoodCheckInScreenState();
}

class _MoodCheckInScreenState extends ConsumerState<MoodCheckInScreen> {
  final Map<String, int> _moodValues = {
    'Energy': 5,
    'Happiness': 5,
    'Creativity': 5,
    'Focus': 5,
    'Irritability': 5,
    'Anxiety': 5,
  };

  final TextEditingController _notesController = TextEditingController();

  void _submitMood() async {
    final db = ref.read(dbProvider);

    await db
        .into(db.moodEntries)
        .insert(
          MoodEntriesCompanion.insert(
            timestamp: DateTime.now(),
            energy: _moodValues['Energy']!,
            happiness: _moodValues['Happiness']!,
            creativity: _moodValues['Creativity']!,
            focus: _moodValues['Focus']!,
            irritability: _moodValues['Irritability']!,
            anxiety: _moodValues['Anxiety']!,
            notes: drift.Value(
              _notesController.text.isEmpty ? null : _notesController.text,
            ),
          ),
        );

    await MoodWidgetService.update(); // call right after inserting a row

    if (mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Mood entry saved!')));
      Navigator.of(context).pop(); // Return to previous screen
    }
  }

  @override
  Widget build(BuildContext context) {
    final now = DateFormat.yMMMMd().add_jm().format(DateTime.now());

    return Scaffold(
      appBar: AppBar(title: Text('Mood Check-In')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            Text('Today: $now', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 12),
            ..._moodValues.keys.map(
              (mood) => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('$mood: ${_moodValues[mood]}'),
                  Slider(
                    value: _moodValues[mood]!.toDouble(),
                    min: 0,
                    max: 10,
                    divisions: 10,
                    label: _moodValues[mood].toString(),
                    onChanged: (value) {
                      setState(() {
                        _moodValues[mood] = value.round();
                      });
                    },
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Optional Notes',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _submitMood,
              icon: const Icon(Icons.check),
              label: const Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }
}
