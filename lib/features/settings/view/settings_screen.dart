import 'dart:convert';
import 'dart:io';

import 'package:archive/archive.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:libretrac/providers/db_provider.dart';
import 'package:libretrac/providers/theme_provider.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:collection/collection.dart'; // for firstWhereOrNull

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
            onTap: () => _exportEverything(context, ref),
          ),
          ListTile(
            leading: const Icon(Icons.import_export),
            title: const Text('Import data'),
            onTap: () => _importEverything(context, ref),
          ),
          // ListTile(
          //   leading: const Icon(Icons.backup),
          //   title: const Text('Export preferences'),
          //   onTap: () => _exportPrefs(context),
          // ),
          // ListTile(
          //   leading: const Icon(Icons.import_export),
          //   title: const Text('Import preferences'),
          //   onTap: () => _importPrefs(context),
          // ),
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
                    child: const Text('Continue'),
                    onPressed: () => Navigator.pop(ctx, true),
                  ),
                ],
              ),
        ) ==
        true;
  }

  Future<void> _exportEverything(BuildContext ctx, WidgetRef ref) async {
    final db = ref.read(dbProvider);
    final dbJson = await db.exportData();
    final prefs = await SharedPreferences.getInstance();
    final prefsJson = await db.exportSharedPrefs();

    final archive = Archive();

    // Replace full path with 'profile.jpg' if exists
    final profilePath = prefs.getString('user_profile_picture');
    debugPrint(profilePath);
    if (profilePath != null && File(profilePath).existsSync()) {
      debugPrint('saving');
      final profileFile = File(profilePath);
      final bytes = profileFile.readAsBytesSync();
      final ext = profilePath.split('.').last;
      final archiveFile = ArchiveFile('profile.$ext', bytes.length, bytes);
      archive.addFile(archiveFile);

      // Override the picture path in prefs
      prefsJson['user_profile_picture'] = 'profile.$ext';
    }

    // Add data and prefs JSON
    archive.addFile(
      ArchiveFile('data.json', 0, utf8.encode(jsonEncode(dbJson))),
    );
    archive.addFile(
      ArchiveFile('prefs.json', 0, utf8.encode(jsonEncode(prefsJson))),
    );

    final zipBytes = ZipEncoder().encode(archive)!;
    final tmpDir = await getTemporaryDirectory();
    final file = File(
      '${tmpDir.path}/libretrac_backup_${DateTime.now().toIso8601String()}.zip',
    );
    await file.writeAsBytes(zipBytes);

    await Share.shareXFiles(
      [XFile(file.path)],
      text:
          'LibreTrac backup – contains all data, prefs, and your profile picture',
    );
  }

  Future<void> _importEverything(BuildContext ctx, WidgetRef ref) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['zip'],
    );
    if (result == null) return;

    final ok = await showDialog<bool>(
      context: ctx,
      builder:
          (ctx) => AlertDialog(
            title: const Text('Confirm Import'),
            content: const Text(
              'This will overwrite all data and preferences. Continue?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Import'),
              ),
            ],
          ),
    );

    if (ok != true) return;

    final zipFile = File(result.files.single.path!);
    final zipBytes = zipFile.readAsBytesSync();
    final archive = ZipDecoder().decodeBytes(zipBytes);

    final dataFile = archive.files.firstWhere((f) => f.name == 'data.json');
    final prefsFile = archive.files.firstWhere((f) => f.name == 'prefs.json');

    final dataJson =
        jsonDecode(utf8.decode(dataFile.content)) as Map<String, dynamic>;
    final prefsJson =
        jsonDecode(utf8.decode(prefsFile.content)) as Map<String, dynamic>;

    // Import SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    for (final entry in prefsJson.entries) {
      final key = entry.key;
      final value = entry.value;

      if (value is bool) {
        await prefs.setBool(key, value);
      } else if (value is int) {
        await prefs.setInt(key, value);
      } else if (value is double) {
        await prefs.setDouble(key, value);
      } else if (value is String) {
        await prefs.setString(key, value);
      } else if (value is List && value.every((e) => e is String)) {
        await prefs.setStringList(key, List<String>.from(value));
      }
    }

    for (final f in archive.files) {
      debugPrint('File in archive: ${f.name}');
    }

    final profileFile = archive.files.firstWhereOrNull(
      (f) => f.name.startsWith('profile.'), // <- removed isFile check
    );

    if (profileFile != null) {
      print('import img');
      final tmpDir = await getTemporaryDirectory();
      final ext = profileFile.name.split('.').last;
      final newPath = '${tmpDir.path}/restored_profile.$ext';
      final restoredFile = File(newPath)
        ..writeAsBytesSync(profileFile.content as List<int>);

      // Actually update SharedPreferences
      await prefs.setString('user_profile_picture', newPath);
    }
    await ref.read(customMetricsProvider.notifier).reload();
    await ref.read(userProfileProvider.notifier).reload();
    await ref.read(themeModeProvider.notifier).reload();
    await ref.read(accentColorProvider.notifier).reload();
    // Import DB
    await ref.read(dbProvider).importData(dataJson);

    if (ctx.mounted) {
      ScaffoldMessenger.of(
        ctx,
      ).showSnackBar(const SnackBar(content: Text('Import complete')));
    }
  }

  //   Future<void> _exportData(BuildContext ctx, WidgetRef ref) async {
  //     final dbJson = await ref.read(dbProvider).exportData();
  //     final tmpDir = await getTemporaryDirectory();
  //     final file = File(
  //       '${tmpDir.path}/libretrac_backup_${DateTime.now().toIso8601String()}.json',
  //     );
  //     await file.writeAsString(jsonEncode(dbJson));

  //     await Share.shareXFiles([
  //       XFile(file.path),
  //     ], text: 'LibreTrac backup – keep this file safe!');
  //   }

  //   Future<void> _exportPrefs(BuildContext ctx) async {
  //     final prefs = await SharedPreferences.getInstance();
  //     final keys = prefs.getKeys();

  //     final Map<String, dynamic> prefsJson = {};
  //     for (final key in keys) {
  //       prefsJson[key] = prefs.get(key);
  //     }

  //     final tmpDir = await getTemporaryDirectory();
  //     final file = File(
  //       '${tmpDir.path}/shared_prefs_backup_${DateTime.now().toIso8601String()}.json',
  //     );
  //     await file.writeAsString(jsonEncode(prefsJson));

  //     await Share.shareXFiles([
  //       XFile(file.path),
  //     ], text: 'LibreTrac SharedPreferences backup – keep this file safe!');
  //   }

  //   Future<void> _importPrefs(BuildContext ctx) async {
  //     final result = await FilePicker.platform.pickFiles(
  //       type: FileType.custom,
  //       allowedExtensions: ['json'],
  //     );
  //     if (result == null) return;

  //     final ok = await showDialog<bool>(
  //       context: ctx,
  //       builder:
  //           (ctx) => AlertDialog(
  //             title: const Text('Confirm Import'),
  //             content: const Text(
  //               'This will overwrite all current SharedPreferences data with the backup file. Continue?',
  //             ),
  //             actions: [
  //               TextButton(
  //                 onPressed: () => Navigator.pop(ctx, false),
  //                 child: const Text('Cancel'),
  //               ),
  //               TextButton(
  //                 onPressed: () => Navigator.pop(ctx, true),
  //                 child: const Text('Import'),
  //               ),
  //             ],
  //           ),
  //     );

  //     if (ok != true) return;

  //     final file = File(result.files.single.path!);
  //     final jsonBlob =
  //         jsonDecode(await file.readAsString()) as Map<String, dynamic>;
  //     final prefs = await SharedPreferences.getInstance();

  //     for (final entry in jsonBlob.entries) {
  //       final key = entry.key;
  //       final value = entry.value;

  //       if (value is bool) {
  //         await prefs.setBool(key, value);
  //       } else if (value is int) {
  //         await prefs.setInt(key, value);
  //       } else if (value is double) {
  //         await prefs.setDouble(key, value);
  //       } else if (value is String) {
  //         await prefs.setString(key, value);
  //       } else if (value is List) {
  //         if (value.every((e) => e is String)) {
  //           await prefs.setStringList(key, List<String>.from(value));
  //         }
  //       }
  //     }

  //     // Optional: notify user
  //     if (ctx.mounted) {
  //       ScaffoldMessenger.of(ctx).showSnackBar(
  //         const SnackBar(content: Text('SharedPreferences import complete')),
  //       );
  //     }
  //   }

  //   Future<void> _importData(BuildContext ctx, WidgetRef ref) async {
  //     final result = await FilePicker.platform.pickFiles(
  //       type: FileType.custom,
  //       allowedExtensions: ['json'],
  //     );
  //     if (result == null) return;

  //     final ok = await _confirm(
  //       ctx,
  //       'This will overwrite ALL current data. Continue?',
  //     );
  //     if (!ok) return;

  //     final file = File(result.files.single.path!);
  //     final jsonBlob =
  //         jsonDecode(await file.readAsString()) as Map<String, dynamic>;
  //     await ref.read(dbProvider).importData(jsonBlob);

  //     if (ctx.mounted) {
  //       ScaffoldMessenger.of(
  //         ctx,
  //       ).showSnackBar(const SnackBar(content: Text('Import complete')));
  //     }
  //   }
  // }
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
