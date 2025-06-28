import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/providers/db_provider.dart';

class NBackTestScreen extends ConsumerStatefulWidget {
  const NBackTestScreen({super.key});

  @override
  ConsumerState<NBackTestScreen> createState() => _NBackTestScreenState();
}

class _NBackTestScreenState extends ConsumerState<NBackTestScreen> {
  // ── Config ──────────────────────────────────────────────────
  final List<String> _letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  final int _n = 2; // N-back
  int _maxRounds = 15; // total letters

  // ── Runtime ─────────────────────────────────────────────────
  final List<String> _sequence = [];
  final List<bool> _correctness = [];
  int _round = 0;

  String? _currentLetter;
  bool _showing = false;
  Timer? _stepTimer;

  /* ── Runtime ───────────────────────────────────────────────── */
  bool _responded = false; // NEW – one-tap per trial
  final List<bool> _hitOrMiss = []; // renamed from _correctness

  void _showInstructions() {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder:
          (_) => AlertDialog(
            title: const Text('2-Back Instructions'),
            content: const Text(
              'Letters appear one at a time.\n\n'
              'Tap the “Match?” button ONLY if the current letter is the same as '
              'the one shown exactly 2 steps earlier.\n'
              'Do nothing when it does not match.\n\n'
              'There are 15 letters in total.  Be quick and accurate!',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Start'),
              ),
            ],
          ),
    ).then((_) => _restart());
  }

  // ── Flow helpers ────────────────────────────────────────────
  void _restart() {
    _sequence.clear();
    _correctness.clear();
    _round = 0;
    _nextStep();
  }

  void _nextStep() {
    if (_round >= _maxRounds) {
      _endTest();
      return;
    }

    final next = _letters[Random().nextInt(_letters.length)];
    _currentLetter = next;
    _sequence.add(next);
    _responded = false; // NEW – reset each letter
    _showing = true;
    setState(() {});

    _stepTimer = Timer(const Duration(seconds: 2), () {
      _showing = false;
      setState(() {});
      _round++;
      Future.delayed(const Duration(seconds: 1), _nextStep);
    });
  }

  void _handleTap() {
    if (!_showing || _responded) return; // ignore extra taps
    _responded = true;

    final idx = _sequence.length - 1;
    final hit = idx >= _n && _sequence[idx] == _sequence[idx - _n];
    _hitOrMiss.add(hit); // true = hit, false = false-alarm
    setState(() {});
  }

  // ── Finish & persist ────────────────────────────────────────
  Future<void> _endTest() async {
    final hits = _hitOrMiss.where((e) => e).length;
    final taps = _hitOrMiss.length;
    final percent = taps == 0 ? 0 : hits / taps; // accuracy over responses

    // 1. Save
    final db = ref.read(dbProvider);
    await db
        .into(db.nBackResults)
        .insert(
          NBackResultsCompanion.insert(
            n: _n,
            trials: taps,
            correct: hits,
            percentCorrect: percent as double,
          ),
        );

    // 2. Summary
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder:
          (_) => AlertDialog(
            title: const Text('2-Back Complete'),
            content: Text(
              'Hits: $hits / $taps '
              '(${(percent * 100).toStringAsFixed(1)}% correct taps)',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  _showInstructions(); // offer another run
                },
                child: const Text('OK'),
              ),
            ],
          ),
    );
  }

  // ── Lifecycle ───────────────────────────────────────────────
  @override
  void initState() {
    super.initState();
    Future.microtask(_showInstructions);
  }

  @override
  void dispose() {
    _stepTimer?.cancel();
    super.dispose();
  }

  // ── UI ──────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('N-Back Test'),
      actions: [
        IconButton(
          icon: const Icon(Icons.info_outline),
          tooltip: 'Instructions',
          onPressed: _showInstructions,
        ),
      ],
    ),
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Round: $_round / $_maxRounds',
            style: const TextStyle(fontSize: 18),
          ),
          const SizedBox(height: 40),
          Text(
            _showing ? _currentLetter ?? '' : '',
            style: const TextStyle(fontSize: 64, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 40),
          ElevatedButton(onPressed: _handleTap, child: const Text('Match?')),
        ],
      ),
    ),
  );
}
