import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/database/app_database.dart';
import '../../../providers/db_provider.dart';

class ReactionTestScreen extends ConsumerStatefulWidget {
  const ReactionTestScreen({super.key});

  @override
  ConsumerState<ReactionTestScreen> createState() => _ReactionTestScreenState();
}

class _ReactionTestScreenState extends ConsumerState<ReactionTestScreen> {
  static const int totalRounds = 5;
  final List<double> _reactionTimes = [];
  bool _waitingForGreen = false;
  bool _canTap = false;
  String _status = 'Tap to start';
  Color _screenColor = Colors.black;
  Timer? _waitTimer;
  Stopwatch _stopwatch = Stopwatch();

  void _startRound() {
    setState(() {
      _status = 'Wait for green...';
      _screenColor = Colors.red.shade700;
      _waitingForGreen = true;
      _canTap = false;
    });

    final delay = Duration(milliseconds: Random().nextInt(2000) + 1500);
    _waitTimer = Timer(delay, () {
      setState(() {
        _screenColor = Colors.green.shade700;
        _status = 'Tap!';
        _canTap = true;
        _stopwatch = Stopwatch()..start();
      });
    });
  }

  void _handleTap() {
    if (_canTap) {
      _stopwatch.stop();
      final time = _stopwatch.elapsedMilliseconds.toDouble();
      _reactionTimes.add(time);
      _nextOrFinish();
    } else if (_waitingForGreen) {
      _waitTimer?.cancel();
      _waitingForGreen = false;
      setState(() {
        _status = 'Too soon! Wait for green.';
        _screenColor = Colors.orange.shade800;
      });
      Future.delayed(const Duration(seconds: 2), _startRound);
    } else if (_reactionTimes.length >= totalRounds) {
      _restart();
    } else {
      _startRound();
    }
  }

  void _nextOrFinish() {
    if (_reactionTimes.length >= totalRounds) {
      _saveResult();
    } else {
      setState(() {
        _waitingForGreen = false;
        _canTap = false;
        _screenColor = Theme.of(context).colorScheme.surfaceVariant;
        _status = 'Tap to start next round';
      });
    }
  }

  void _saveResult() async {
    final db = ref.read(dbProvider);
    final avg = _reactionTimes.reduce((a, b) => a + b) / _reactionTimes.length;
    final fastest = _reactionTimes.reduce(min);
    final slowest = _reactionTimes.reduce(max);

    await db
        .into(db.reactionResults)
        .insert(
          ReactionResultsCompanion.insert(
            timestamp: DateTime.now(),
            averageTime: avg,
            fastest: fastest,
            slowest: slowest,
          ),
        );

    setState(() {
      _status =
          'Done!\nAvg: ${avg.toStringAsFixed(1)}ms\nFastest: ${fastest.toStringAsFixed(1)}ms';
      _screenColor = Colors.teal.shade400;
    });
  }

  void _restart() {
    setState(() {
      _reactionTimes.clear();
      _status = 'Tap to start';
      _screenColor = Theme.of(context).colorScheme.surfaceVariant;
      _waitingForGreen = false;
      _canTap = false;
    });
  }

  @override
  void dispose() {
    _waitTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Reaction Time Test')),
      body: GestureDetector(
        onTap: _handleTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          color: _screenColor,
          alignment: Alignment.center,
          child: Text(
            _status,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black,
            ),
          ),
        ),
      ),
    );
  }
}
