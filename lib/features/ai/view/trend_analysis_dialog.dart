import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:libretrac/features/ai/provider/trend_analysis_provider.dart';
import 'package:flutter_riverpod/src/consumer.dart';

extension on TrendRange {
  String get label => switch (this) {
    TrendRange.week => '7 d',
    TrendRange.month => '1 m',
    TrendRange.threeMonths => '3 m',
    TrendRange.sixMonths => '6 m',
  };
}

String trendLabel(TrendRange r) => r.label;

void showTrendDialog(BuildContext context, WidgetRef ref) {
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (ctx) {
      TrendRange selected = ref.read(trendRangeProvider);
      Future<String?>? future; // set after “Run” is tapped

      return StatefulBuilder(
        builder: (ctx, setState) {
          Widget body;

          // ① selector + run-button  ────────────────────────────────
          if (future == null) {
            body = Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 8,
                  children:
                      TrendRange.values.map((r) {
                        return ChoiceChip(
                          label: Text(trendLabel(r)),
                          selected: selected == r,
                          onSelected: (_) {
                            setState(() {
                              selected = r;
                              ref.read(trendRangeProvider.notifier).state =
                                  r; // update global state
                            });
                          },
                        );
                      }).toList(),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('Run Analysis'),
                  onPressed: () {
                    setState(() {
                      future = ref.read(analysisProvider.future);
                    });
                  },
                ),
              ],
            );
          }
          // ② progress / result  ────────────────────────────────────
          else {
            body = FutureBuilder<String?>(
              future: future,
              builder: (ctx, snap) {
                if (snap.connectionState == ConnectionState.waiting) {
                  return Column(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      CircularProgressIndicator(),
                      SizedBox(height: 16),
                      Text('Crunching the numbers…'),
                    ],
                  );
                } else if (snap.hasError) {
                  return Text(
                    'Error: ${snap.error}',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  );
                } else {
                  final text = snap.data;
                  return SingleChildScrollView(
                    child:
                        text == null
                            ? const Text(
                              'No data available for this period.',
                              style: TextStyle(color: Colors.grey),
                            )
                            : MarkdownBody(
                              data: text,
                              selectable: true, // allows copy-and-paste
                            ),
                  );
                }
              },
            );
          }

          return AlertDialog(
            title: const Text('AI Trends'),
            content: SizedBox(width: 320, child: body),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Close'),
              ),
            ],
          );
        },
      );
    },
  );
}
