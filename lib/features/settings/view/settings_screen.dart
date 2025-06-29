import 'dart:convert';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:libretrac/providers/db_provider.dart';
import 'package:libretrac/providers/theme_provider.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool expanded = false;

  @override
  Widget build(BuildContext context) {
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
            onChanged: (v) {
              final newMode = v ? ThemeMode.light : ThemeMode.dark;
              ref.read(themeModeProvider.notifier).update(newMode);
            },
          ),

          const Divider(),
          ListTile(
            title: const Text('Accent Color'),
            subtitle: const Text('Tap to expand and customize'),
            trailing: Icon(expanded ? Icons.expand_less : Icons.expand_more),
            onTap: () => setState(() => expanded = !expanded),
          ),
          if (expanded)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: const _AccentColorPicker(),
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

  Future<void> _changeThemeColor(BuildContext context) async {
    final color = await showDialog<Color>(
      context: context,
      builder:
          (_) => AlertDialog(
            title: const Text('Pick a new theme color'),
            content: SingleChildScrollView(
              child: Column(
                children: [
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context, Colors.blue),
                    child: const Text('Blue'),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context, Colors.teal),
                    child: const Text('Teal'),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context, Colors.deepOrange),
                    child: const Text('Deep Orange'),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context, Colors.purple),
                    child: const Text('Purple (default)'),
                  ),
                ],
              ),
            ),
          ),
    );

    if (color != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        'primary_seed_color',
        color.value.toRadixString(16),
      );
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Theme color saved! Restart app to apply.'),
          ),
        );
      }
    }
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

class _AccentColorPicker extends ConsumerWidget {
  const _AccentColorPicker({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selected = ref.watch(accentColorProvider);
    final colors = [
      Colors.brown.shade700,
      Colors.pinkAccent,
      Colors.purple,
      Colors.deepPurpleAccent,
      Colors.indigo,
      Colors.blue,
      Colors.lightBlue,
      Colors.cyan,
      Colors.green.shade900,
      Colors.lightGreen,
      Colors.amber.shade300,
      Colors.orange,
      Colors.red.shade600,
      Colors.teal,
      Colors.blueGrey,
      Colors.deepOrangeAccent,
    ];

    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children:
          colors.map((color) {
            final isSelected = color.value == selected.value;
            return GestureDetector(
              onTap: () => ref.read(accentColorProvider.notifier).update(color),
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                  border:
                      isSelected
                          ? Border.all(color: Colors.white, width: 3)
                          : null,
                ),
                child:
                    isSelected
                        ? const Center(
                          child: Icon(
                            Icons.check,
                            color: Colors.white,
                            size: 20,
                          ),
                        )
                        : null,
              ),
            );
          }).toList(),
    );
  }
}
