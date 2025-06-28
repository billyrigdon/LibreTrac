import 'dart:convert';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:libretrac/providers/db_provider.dart';
import 'package:libretrac/providers/theme_provider.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    Future<void> _clearMood(BuildContext ctx) async {
      final ok = await _confirm(ctx, 'Clear all mood data?');
      if (!ok) return;
      await ref.read(dbProvider).delete(ref.read(dbProvider).moodEntries).go();
      ScaffoldMessenger.of(
        ctx,
      ).showSnackBar(const SnackBar(content: Text('Mood data cleared')));
    }

    Future<void> _clearCognitive(BuildContext ctx) async {
      final ok = await _confirm(
        ctx,
        'Clear all cognitive-test data (all tests)?',
      );
      if (!ok) return;
      final db = ref.read(dbProvider);
      await db.batch(
        (b) =>
            b
              ..deleteAll(db.reactionResults)
              ..deleteAll(db.stroopResults)
              ..deleteAll(db.nBackResults)
              ..deleteAll(db.goNoGoResults)
              ..deleteAll(db.digitSpanResults)
              ..deleteAll(db.symbolSearchResults),
      );
      ScaffoldMessenger.of(
        ctx,
      ).showSnackBar(const SnackBar(content: Text('Cognitive data cleared')));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          SwitchListTile(
            title: const Text('Light theme'),
            subtitle: const Text('Toggle between light and dark mode'),
            value: themeMode == ThemeMode.light,
            onChanged:
                (v) =>
                    ref.read(themeModeProvider.notifier).state =
                        v ? ThemeMode.light : ThemeMode.dark,
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.backup),
            title: const Text('Export data'),
            onTap: () => _exportData(context, ref),
          ),
          ListTile(
            leading: const Icon(Icons.import_export),
            title: const Text('Import data'),
            onTap: () => _importData(context, ref),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.delete_outline, color: Colors.red),
            title: const Text('Clear mood data'),
            onTap: () => _clearMood(context),
          ),
          ListTile(
            leading: const Icon(Icons.delete_sweep_outlined, color: Colors.red),
            title: const Text('Clear cognitive data'),
            onTap: () => _clearCognitive(context),
          ),
          const Divider(),

          // -- room for future prefs --
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('App version'),
            subtitle: const Text('LibreTrac 3.0.0'),
          ),
        ],
      ),
    );
  }

  Future<bool> _confirm(BuildContext ctx, String msg) async {
    return await showDialog<bool>(
          context: ctx,
          builder:
              (_) => AlertDialog(
                title: const Text('Are you sure?'),
                content: Text(msg),
                actions: [
                  TextButton(
                    child: const Text('Cancel'),
                    onPressed: () => Navigator.pop(ctx, false),
                  ),
                  ElevatedButton(
                    child: const Text('Delete'),
                    onPressed: () => Navigator.pop(ctx, true),
                  ),
                ],
              ),
        ) ==
        true;
  }

  Future<void> _exportData(BuildContext ctx, WidgetRef ref) async {
    final dbJson = await ref.read(dbProvider).exportData();
    final tmpDir = await getTemporaryDirectory();
    final file = File(
      '${tmpDir.path}/libretrac_backup_${DateTime.now().toIso8601String()}.json',
    );
    await file.writeAsString(jsonEncode(dbJson));

    await Share.shareXFiles([
      XFile(file.path),
    ], text: 'LibreTrac backup – keep this file safe!');
  }

  Future<void> _importData(BuildContext ctx, WidgetRef ref) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['json'],
    );
    if (result == null) return;

    final ok = await _confirm(
      ctx,
      'This will overwrite ALL current data. Continue?',
    );
    if (!ok) return;

    final file = File(result.files.single.path!);
    final jsonBlob =
        jsonDecode(await file.readAsString()) as Map<String, dynamic>;
    await ref.read(dbProvider).importData(jsonBlob);

    if (ctx.mounted) {
      ScaffoldMessenger.of(
        ctx,
      ).showSnackBar(const SnackBar(content: Text('Import complete')));
    }
  }
}
