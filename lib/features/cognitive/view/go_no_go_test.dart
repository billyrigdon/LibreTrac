import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/providers/db_provider.dart';

class GoNoGoTestScreen extends ConsumerStatefulWidget {
  const GoNoGoTestScreen({super.key});

  @override
  ConsumerState<GoNoGoTestScreen> createState() => _GoNoGoTestScreenState();
}

class _GoNoGoTestScreenState extends ConsumerState<GoNoGoTestScreen> {
  // ── Task parameters ──────────────────────────────────────────
  static const _stimDuration = Duration(milliseconds: 800);
  static const _isi = Duration(milliseconds: 600); // inter-stimulus interval
  static const _trials = 40;
  static const _goProb = .7; // 70 % GO trials

  // ── Runtime state ───────────────────────────────────────────
  final _rand = Random();
  int _trial = 0;
  bool _isGo = false;
  bool _showStim = false;

  final Stopwatch _rtWatch = Stopwatch();
  final List<int> _responseTimes = [];
  int _commissionErrors = 0; // tapped on NO-GO
  int _omissionErrors = 0; // missed GO

  Timer? _timer;
  /* ── Runtime state ─────────────────────────── */
  bool _responded = false; // <-- NEW

  // ── Instructions ────────────────────────────────────────────
  void _showInstructions() {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder:
          (_) => AlertDialog(
            title: const Text('Go / No-Go Instructions'),
            content: const Text(
              '• Tap the screen **ONLY** when you see a green circle (GO).\n'
              '• Do **NOT** tap when a red stop icon appears (NO-GO).\n'
              '• Each stimulus is on-screen for 0.8 s, then a short pause.\n\n'
              'Try to react quickly while avoiding mistakes.\n'
              'Tap “Start” to begin the 40-trial test.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Start'),
              ),
            ],
          ),
    ).then((_) => _nextTrial());
  }

  // ── Trial loop ───────────────────────────────────────────────
  void _nextTrial() {
    if (_trial >= _trials) {
      _endTest();
      return;
    }

    _isGo = _rand.nextDouble() < _goProb;
    _responded = false; // <-- NEW  (reset every trial)
    _showStim = true;
    _rtWatch
      ..reset()
      ..start();
    setState(() {});

    _timer = Timer(_stimDuration, () {
      _rtWatch.stop();
      if (_isGo && !_responded) _omissionErrors++; // <-- check flag
      _showStim = false;
      setState(() {});

      _trial++;
      _timer = Timer(_isi, _nextTrial);
    });
  }

  void _handleTap() {
    if (!_showStim) return;

    final rt = _rtWatch.elapsedMilliseconds;
    _rtWatch.stop();
    _responded = true; // <-- mark that the participant responded

    if (_isGo) {
      _responseTimes.add(rt);
    } else {
      _commissionErrors++;
    }

    _showStim = false;
    setState(() {});
  }

  // ── Finish & persist ────────────────────────────────────────
  Future<void> _endTest() async {
    _timer?.cancel();

    final meanRt =
        _responseTimes.isEmpty
            ? 0
            : _responseTimes.reduce((a, b) => a + b) ~/ _responseTimes.length;

    // 1. Write to DB
    final db = ref.read(dbProvider);
    await db
        .into(db.goNoGoResults)
        .insert(
          GoNoGoResultsCompanion.insert(
            meanRt: meanRt.toDouble(),
            commissionErrors: _commissionErrors,
            omissionErrors: _omissionErrors,
          ),
        );

    // 2. Show summary
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder:
          (_) => AlertDialog(
            title: const Text('Go / No-Go Complete'),
            content: Text(
              'Mean RT (hits): $meanRt ms\n'
              'Commission errors: $_commissionErrors\n'
              'Omission errors: $_omissionErrors',
            ),
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
    Future.microtask(_showInstructions); // open instructions first
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  // ── UI ──────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Go / No-Go'),
      actions: [
        IconButton(
          icon: const Icon(Icons.info_outline),
          tooltip: 'Instructions',
          onPressed: _showInstructions,
        ),
      ],
    ),
    body: GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: _handleTap,
      child: Center(
        child:
            _showStim
                ? Icon(
                  _isGo ? Icons.circle : Icons.stop,
                  size: 120,
                  color: _isGo ? Colors.green : Colors.red,
                )
                : Text(
                  _trial >= _trials ? '' : 'Tap when GREEN!',
                  style: const TextStyle(fontSize: 24),
                ),
      ),
    ),
  );
}
