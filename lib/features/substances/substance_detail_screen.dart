import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/features/substances/add_edit_substance_screen.dart';
import 'package:libretrac/features/ai/service/openai_api_service.dart';

class SubstanceDetailScreen extends ConsumerStatefulWidget {
  const SubstanceDetailScreen({required this.substance, super.key});
  final Substance substance;

  @override
  ConsumerState<SubstanceDetailScreen> createState() => _SubstanceDetailState();
}

class _SubstanceDetailState extends ConsumerState<SubstanceDetailScreen> {
  late Future<String> _summary;

  @override
  void initState() {
    super.initState();
    _summary = OpenAIAPI.instance.getSummary(widget.substance.name);
  }

  @override
  Widget build(BuildContext ctx) {
    final dateFmt = DateFormat.yMMMd(); // e.g. “Jun 22, 2025”

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.substance.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed:
                () => Navigator.push(
                  ctx,
                  MaterialPageRoute(
                    builder:
                        (_) => AddEditSubstanceScreen(toEdit: widget.substance),
                  ),
                ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.substance.dosage != null)
              Text(
                'Dosage: ${widget.substance.dosage!}',
                style: Theme.of(ctx).textTheme.titleMedium,
              ),
            Text(
              'Started: ${dateFmt.format(widget.substance.addedAt)}',
              style: Theme.of(ctx).textTheme.bodyMedium,
            ),

            if (widget.substance.stoppedAt != null)
              Text('Ended: ${dateFmt.format(widget.substance.stoppedAt!)}'),

            if (widget.substance.notes != null) ...[
              const SizedBox(height: 12),
              Text(widget.substance.notes!),
            ],
            const SizedBox(height: 24),
            FutureBuilder<String>(
              future: _summary,
              builder: (_, snap) {
                if (snap.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snap.hasError) {
                  return Text('⚠️ ${snap.error}');
                }
                return Text(
                  snap.data ?? '',
                  style: Theme.of(ctx).textTheme.bodyLarge,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
