import 'package:drift/drift.dart' as drift;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:libretrac/constants/disclaimer.dart';
import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/features/ai/service/openai_api_service.dart';
import 'package:libretrac/providers/db_provider.dart';

class AddEditSubstanceScreen extends ConsumerStatefulWidget {
  const AddEditSubstanceScreen({this.toEdit, super.key});
  final Substance? toEdit;

  @override
  ConsumerState<AddEditSubstanceScreen> createState() =>
      _AddEditSubstanceState();
}

class _AddEditSubstanceState extends ConsumerState<AddEditSubstanceScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _dosage;
  late final TextEditingController _notes;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.toEdit?.name ?? '');
    _dosage = TextEditingController(text: widget.toEdit?.dosage ?? '');
    _notes = TextEditingController(text: widget.toEdit?.notes ?? '');
  }

  @override
  void dispose() {
    _name.dispose();
    _dosage.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    print(
      '-------------------------------------------------------------------SAVING',
    );
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);

    try {
      // ── Ingestibility gate ──────────────────────────────────────────
      final edible = await OpenAIAPI.instance.isIngestible(_name.text.trim());
      if (!edible) {
        await showDialog<void>(
          context: context,
          builder:
              (_) => AlertDialog(
                title: const Text('Not an ingestible substance'),
                content: const Text(
                  'That item is not something a human should swallow. '
                  'Please enter a medication, supplement, or food-grade item.',
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('OK'),
                  ),
                ],
              ),
        );
        return;
      }

      // ── Interaction check ──────────────────────────────────────────
      // final currentStack =
      //     ref
      //         .read(substancesStreamProvider)
      //         .valueOrNull
      //         ?.map((s) => s.name)
      //         .toList() ??
      //     <String>[];

      final db = ref.read(dbProvider);
      final allSubstances = await db.select(db.substances).get();
      final currentStack = allSubstances.map((s) => s.name).toList();
      debugPrint('Current stack: $currentStack');

      print(currentStack.toString());
      print('--------------------------------------------------');
      final warnings = await OpenAIAPI.instance.checkInteractions(
        candidate: _name.text.trim(),
        candidateDosage:
            _dosage.text.trim().isEmpty ? null : _dosage.text.trim(),
        currentStack: currentStack,
      );

      if (warnings.isNotEmpty) {
        final proceed = await showDialog<bool>(
          context: context,
          builder:
              (dCtx) => AlertDialog(
                title: const Text('Potential interactions detected'),
                content: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ...warnings.map(
                      (w) => Text(
                        '• $w\n',
                        textAlign: TextAlign.left,
                        style: Theme.of(
                          context,
                        ).textTheme.bodySmall?.copyWith(fontSize: 12),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      kMedicalDisclaimer,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontSize:
                            (Theme.of(context).textTheme.bodySmall?.fontSize ??
                                12) -
                            3,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(dCtx, false),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(dCtx, true),
                    child: const Text('Add anyway'),
                  ),
                ],
              ),
        );
        if (proceed != true) return;
      }

      // ── Upsert ─────────────────────────────────────────────────────
      final repo = ref.read(substanceRepoProvider);

      if (widget.toEdit == null) {
        await repo.add(
          SubstancesCompanion.insert(
            name: _name.text.trim(),
            dosage: drift.Value(
              _dosage.text.trim().isEmpty ? null : _dosage.text.trim(),
            ),
            notes: drift.Value(
              _notes.text.trim().isEmpty ? null : _notes.text.trim(),
            ),
          ),
        );
      } else {
        await repo.update(
          widget.toEdit!.copyWith(
            name: _name.text.trim(),
            dosage: drift.Value(
              _dosage.text.trim().isEmpty ? null : _dosage.text.trim(),
            ),
            notes: drift.Value(
              _notes.text.trim().isEmpty ? null : _notes.text.trim(),
            ),
          ),
        );
      }

      if (mounted) Navigator.pop(context);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(
        widget.toEdit == null
            ? 'Add Medication/Supplement'
            : 'Edit Medication/Supplement',
      ),
    ),
    body: Padding(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: ListView(
          children: [
            TextFormField(
              controller: _name,
              decoration: const InputDecoration(labelText: 'Name'),
              validator:
                  (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            TextFormField(
              controller: _dosage,
              decoration: const InputDecoration(
                labelText: 'Dosage (e.g., 200 mg)',
              ),
            ),
            TextFormField(
              controller: _notes,
              decoration: const InputDecoration(labelText: 'Notes'),
              maxLines: null,
            ),
            const SizedBox(height: 16),
            Text(
              kMedicalDisclaimer,
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _saving ? null : _save,
              child: Text(_saving ? 'Saving…' : 'Save'),
            ),
          ],
        ),
      ),
    ),
  );
}
