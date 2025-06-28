import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/providers/db_provider.dart';

class StroopTestScreen extends ConsumerStatefulWidget {
  const StroopTestScreen({super.key});

  @override
  ConsumerState<StroopTestScreen> createState() => _StroopTestScreenState();
}

class _StroopTestScreenState extends ConsumerState<StroopTestScreen> {
  // ── Config ───────────────────────────────────────────────────
  static const int totalRounds = 20;
  final List<String> _colorWords = ['Red', 'Green', 'Blue', 'Yellow'];
  final Map<String, Color> _colorMap = {
    'Red': Colors.red,
    'Green': Colors.green,
    'Blue': Colors.blue,
    'Yellow': Colors.yellow,
  };

  // ── Runtime ──────────────────────────────────────────────────
  bool _showIntro = true;
  int _currentRound = 0;
  int _correct = 0;
  int _incorrect = 0;

  final List<double> _congruentRTs = [];
  final List<double> _incongruentRTs = [];

  late Stopwatch _sw;
  late String _currentWord;
  late Color _currentColor;
  late bool _isCongruent;
  bool _awaitingResponse = true;

  // ── Helpers ──────────────────────────────────────────────────
  void _showInstructions() => showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder:
        (_) => AlertDialog(
          title: const Text('Stroop Instructions'),
          content: const Text(
            'You’ll see a color WORD in a colored font.\n'
            'Tap the button that matches the **FONT COLOR**, not the word.\n'
            'React quickly but avoid mistakes.\n',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                if (_showIntro) {
                  setState(() => _showIntro = false);
                  _nextRound();
                }
              },
              child: const Text('Start'),
            ),
          ],
        ),
  );

  void _nextRound() {
    if (_currentRound >= totalRounds) {
      _endTest();
      return;
    }

    final rand = Random();
    _currentWord = _colorWords[rand.nextInt(_colorWords.length)];
    _currentColor = _colorMap[_colorWords[rand.nextInt(_colorWords.length)]]!;
    _isCongruent = _colorMap[_currentWord] == _currentColor;

    _currentRound++;
    _awaitingResponse = true;
    _sw = Stopwatch()..start();
    setState(() {});
  }

  void _handleAnswer(String chosenColor) {
    if (!_awaitingResponse) return;
    _sw.stop();
    _awaitingResponse = false;

    final correctColorName =
        _colorMap.entries.firstWhere((e) => e.value == _currentColor).key;

    final rt = _sw.elapsedMilliseconds.toDouble();
    if (_isCongruent) {
      _congruentRTs.add(rt);
    } else {
      _incongruentRTs.add(rt);
    }

    if (chosenColor == correctColorName) {
      _correct++;
    } else {
      _incorrect++;
    }

    Future.delayed(const Duration(milliseconds: 400), _nextRound);
  }

  Future<void> _endTest() async {
    final avgCong =
        _congruentRTs.isEmpty
            ? 0
            : _congruentRTs.reduce((a, b) => a + b) / _congruentRTs.length;
    final avgIncong =
        _incongruentRTs.isEmpty
            ? 0
            : _incongruentRTs.reduce((a, b) => a + b) / _incongruentRTs.length;
    final delta = avgIncong - avgCong;

    // ── Persist
    final db = ref.read(dbProvider);
    await db
        .into(db.stroopResults)
        .insert(
          StroopResultsCompanion.insert(
            congruentMs: avgCong as double,
            incongruentMs: avgIncong as double,
            deltaMs: delta as double,
          ),
        );

    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder:
          (_) => AlertDialog(
            title: const Text('Stroop Complete'),
            content: Text(
              'Correct: $_correct  |  Incorrect: $_incorrect\n'
              'Avg congruent RT: ${avgCong.toStringAsFixed(1)} ms\n'
              'Avg incongruent RT: ${avgIncong.toStringAsFixed(1)} ms\n'
              'Δ (incong − cong): ${delta.toStringAsFixed(1)} ms',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Done'),
              ),
            ],
          ),
    );

    if (mounted) Navigator.pop(context);
  }

  // ── UI ───────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    if (_showIntro) {
      return Scaffold(
        appBar: AppBar(title: const Text('Stroop Test')),
        body: Center(
          child: ElevatedButton(
            onPressed: _showInstructions,
            child: const Text('View Instructions'),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Stroop Test'),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: _showInstructions,
          ),
        ],
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Round $_currentRound / $totalRounds',
            style: const TextStyle(fontSize: 18),
          ),
          const SizedBox(height: 32),
          Center(
            child: Text(
              _currentWord,
              style: TextStyle(
                fontSize: 48,
                color: _currentColor,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 32),
          Wrap(
            spacing: 16,
            runSpacing: 16,
            alignment: WrapAlignment.center,
            children:
                _colorWords
                    .map(
                      (color) => ElevatedButton(
                        onPressed:
                            _awaitingResponse
                                ? () => _handleAnswer(color)
                                : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _colorMap[color],
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 16,
                          ),
                        ),
                        child: Text(color),
                      ),
                    )
                    .toList(),
          ),
        ],
      ),
    );
  }
}
