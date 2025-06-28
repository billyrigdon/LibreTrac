import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:libretrac/core/database/app_database.dart';
import 'package:libretrac/providers/db_provider.dart';

class SymbolSearchScreen extends ConsumerStatefulWidget {
  const SymbolSearchScreen({super.key});

  @override
  ConsumerState<SymbolSearchScreen> createState() => _SymbolSearchScreenState();
}

class _SymbolSearchScreenState extends ConsumerState<SymbolSearchScreen> {
  // ── Config ───────────────────────────────────────────────────
  static const _symbols = ['△', '□', '○', '◇', '☆', '♢'];
  final _rand = Random();
  final int _trials = 20;

  // ── Runtime ──────────────────────────────────────────────────
  late String _target;
  late List<String> _row;
  int _trial = 0;
  int _hits = 0;
  final List<int> _rts = [];
  late Stopwatch _sw;
  bool _showIntro = true;

  // ── Instructions ─────────────────────────────────────────────
  void _showInstructions() {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder:
          (_) => AlertDialog(
            title: const Text('Symbol Search Instructions'),
            content: const Text(
              'A “target” symbol appears at the top.\n'
              'Below it, six symbols are shown in a grid.\n\n'
              'Tap the grid **as fast as you can** on the cell that matches the target.\n'
              'There are 20 trials total.\n',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  if (_showIntro) {
                    setState(() => _showIntro = false);
                    _startTest();
                  }
                },
                child: const Text('Start'),
              ),
            ],
          ),
    );
  }

  // ── Test flow ────────────────────────────────────────────────
  void _startTest() {
    _hits = 0;
    _trial = 0;
    _rts.clear();
    _next();
  }

  void _next() {
    if (_trial >= _trials) {
      _end();
      return;
    }

    _target = _symbols[_rand.nextInt(_symbols.length)];
    _row = List.generate(6, (_) => _symbols[_rand.nextInt(_symbols.length)]);
    if (!_row.contains(_target)) {
      _row[_rand.nextInt(6)] = _target;
    }

    _sw = Stopwatch()..start();
    setState(() {});
  }

  void _tap(int index) {
    _sw.stop();
    final rt = _sw.elapsedMilliseconds;
    if (_row[index] == _target) {
      _hits++;
      _rts.add(rt);
    }
    _trial++;
    _next();
  }

  // ── Finish & persist ────────────────────────────────────────
  Future<void> _end() async {
    final meanRT =
        _rts.isEmpty ? 0 : _rts.reduce((a, b) => a + b) ~/ _rts.length;

    // 1. Save to DB
    final db = ref.read(dbProvider);
    await db
        .into(db.symbolSearchResults)
        .insert(
          SymbolSearchResultsCompanion.insert(
            hits: _hits,
            total: _trials,
            meanRt: meanRT.toDouble(),
          ),
        );

    // 2. Show summary
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder:
          (_) => AlertDialog(
            title: const Text('Symbol Search Complete'),
            content: Text('Hits: $_hits / $_trials\nMean RT: ${meanRT} ms'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('OK'),
              ),
            ],
          ),
    );

    if (mounted) Navigator.pop(context); // back to previous screen
  }

  // ── Lifecycle ────────────────────────────────────────────────
  @override
  void initState() {
    super.initState();
    Future.microtask(_showInstructions);
  }

  // ── UI ───────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    if (_showIntro) {
      return Scaffold(
        appBar: AppBar(title: const Text('Symbol Search')),
        body: const SizedBox.shrink(), // intro handled by dialog
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Symbol Search'),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: _showInstructions,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 16),
        child: Column(
          children: [
            Text(
              'Find this symbol →  $_target',
              style: const TextStyle(fontSize: 24),
            ),
            const SizedBox(height: 32),
            Expanded(
              child: GridView.builder(
                itemCount: 6,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                ),
                itemBuilder:
                    (_, i) => ElevatedButton(
                      onPressed: () => _tap(i),
                      child: Text(
                        _row[i],
                        style: const TextStyle(fontSize: 32),
                      ),
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
