import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class StreakDialog extends StatelessWidget {
  final int streakCount;
  const StreakDialog({super.key, required this.streakCount});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      // backgroundColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Lottie.asset(
            'assets/icons/animation.json',
            repeat: true,
            height: 150,
          ),
          const SizedBox(height: 16),
          Text(
            '🔥 ${streakCount}-Day Streak!',
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'You’ve checked in consistently.\nKeep it up!',
            textAlign: TextAlign.center,
          ),
        ],
      ),
      actions: [
        Center(
          child: TextButton(
            style: TextButton.styleFrom(
              // foregroundColor: Colors.deepPurple,
              textStyle: const TextStyle(fontSize: 16),
            ),
            child: const Text('Let’s go! 🚀'),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
      ],
    );
  }
}
