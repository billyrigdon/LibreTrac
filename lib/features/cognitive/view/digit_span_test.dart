import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/providers/db_provider.dart';

class DigitSpanTestScreen extends ConsumerStatefulWidget {
  const DigitSpanTestScreen({super.key});

  @override
  ConsumerState<DigitSpanTestScreen> createState() =>
      _DigitSpanTestScreenState();
}

class _DigitSpanTestScreenState extends ConsumerState<DigitSpanTestScreen> {
  // ── Config ───────────────────────────────────────────────────
  final _rand = Random();
  int _span = 3; // starting length
  int _bestSpan = 0;

  // ── Runtime ──────────────────────────────────────────────────
  late List<int> _sequence;
  bool _showSeq = true;
  String _userInput = '';
  Timer? _hideTimer;

  // ── Flow helpers ─────────────────────────────────────────────
  void _showInstructions() {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder:
          (_) => AlertDialog(
            title: const Text('Digit Span Instructions'),
            content: const Text(
              'A sequence of numbers will flash on the screen.\n\n'
              'When they disappear, type the sequence in the same order.\n'
              'Each time you succeed, the sequence gets longer by 1 digit.\n'
              'The test ends after your first mistake.\n\n'
              'Tap “Start” when you’re ready.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Start'),
              ),
            ],
          ),
    ).then((_) => _nextRound());
  }

  void _nextRound() {
    _sequence = List.generate(_span, (_) => _rand.nextInt(10));
    _showSeq = true;
    _userInput = '';
    setState(() {});

    _hideTimer?.cancel();
    _hideTimer = Timer(Duration(seconds: _span + 1), () {
      setState(() => _showSeq = false);
    });
  }

  void _submit() {
    if (_userInput.length != _span) return;

    final isCorrect = listEquals(
      _userInput.split('').map(int.parse).toList(),
      _sequence,
    );

    if (isCorrect) {
      _bestSpan = max(_bestSpan, _span);
      _span++;
      _nextRound();
    } else {
      _endTest();
    }
  }

  Future<void> _endTest() async {
    // 1. Persist result
    final db = ref.read(dbProvider);
    await db
        .into(db.digitSpanResults)
        .insert(DigitSpanResultsCompanion.insert(bestSpan: _bestSpan));

    // 2. Show summary dialog
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder:
          (_) => AlertDialog(
            title: const Text('Digit Span Complete'),
            content: Text('Best span: $_bestSpan digits'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('OK'),
              ),
            ],
          ),
    );

    if (mounted) Navigator.pop(context); // leave screen
  }

  // ── Lifecycle ────────────────────────────────────────────────
  @override
  void initState() {
    super.initState();
    // show instructions on first frame
    Future.microtask(_showInstructions);
  }

  @override
  void dispose() {
    _hideTimer?.cancel();
    super.dispose();
  }

  // ── UI ───────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Digit Span'),
      actions: [
        IconButton(
          icon: const Icon(Icons.info_outline),
          tooltip: 'Instructions',
          onPressed: _showInstructions,
        ),
      ],
    ),
    body: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (_showSeq)
            Text(
              _sequence.join(' '),
              style: const TextStyle(fontSize: 32, letterSpacing: 4),
            )
          else
            Column(
              children: [
                TextField(
                  autofocus: true,
                  decoration: const InputDecoration(hintText: 'Enter sequence'),
                  keyboardType: TextInputType.number,
                  onChanged: (v) => _userInput = v,
                  onSubmitted: (_) => _submit(),
                ),
                const SizedBox(height: 12),
                ElevatedButton(onPressed: _submit, child: const Text('OK')),
              ],
            ),
          const SizedBox(height: 24),
          Text('Current span: $_span   •   Best so far: $_bestSpan'),
        ],
      ),
    ),
  );
}
