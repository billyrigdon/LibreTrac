import 'package:drift/drift.dart' as drift;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/providers/db_provider.dart';

class SleepCheckinDialog extends ConsumerStatefulWidget {
  const SleepCheckinDialog({super.key});

  @override
  ConsumerState<SleepCheckinDialog> createState() => _SleepCheckinDialogState();
}

class _SleepCheckinDialogState extends ConsumerState<SleepCheckinDialog> {
  final _formKey = GlobalKey<FormState>();
  final _hours = TextEditingController();
  final _dreams = TextEditingController();
  double _quality = 3;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Track last night’s sleep'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            children: [
              TextFormField(
                controller: _hours,
                keyboardType: TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'Hours slept'),
                validator:
                    (v) =>
                        (double.tryParse(v ?? '') ?? 0) <= 0
                            ? 'Enter hours'
                            : null,
              ),
              const SizedBox(height: 16),
              Text('Sleep quality'),
              Slider(
                min: 1,
                max: 5,
                divisions: 4,
                value: _quality,
                label: _quality.toInt().toString(),
                onChanged: (v) => setState(() => _quality = v),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _dreams,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Dream journal (optional)',
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Skip'),
        ),
        ElevatedButton(
          onPressed: () async {
            if (!_formKey.currentState!.validate()) return;
            final db = ref.read(dbProvider);
            await db.insertSleep(
              SleepEntriesCompanion.insert(
                date: DateTime.now(),
                hoursSlept: double.parse(_hours.text),
                quality: drift.Value(_quality.toInt()),
                dreamJournal: drift.Value(
                  _dreams.text.trim().isEmpty ? null : _dreams.text.trim(),
                ),
              ),
            );
            if (mounted) Navigator.pop(context);
          },
          child: const Text('Save'),
        ),
      ],
    );
  }
}
