import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:libretrac/core/database/app_database.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:libretrac/features/substances/add_edit_substance_screen.dart';
import 'package:libretrac/features/substances/substance_detail_screen.dart';
import 'package:libretrac/providers/db_provider.dart';

class SubstanceListScreen extends ConsumerStatefulWidget {
  const SubstanceListScreen({super.key});

  @override
  ConsumerState<SubstanceListScreen> createState() =>
      _SubstanceListScreenState();
}

class _SubstanceListScreenState extends ConsumerState<SubstanceListScreen> {
  static const _prefsKey = 'substanceOrder';
  bool _showPast = false;
  List<int> _savedOrder = [];

  // ──────────────────────────────────────────────────────────────────────
  // INIT ─ load any saved order once
  // ──────────────────────────────────────────────────────────────────────
  @override
  void initState() {
    super.initState();
    _loadSavedOrder();
  }

  Future<void> _loadSavedOrder() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _savedOrder =
          prefs.getStringList(_prefsKey)?.map(int.parse).toList() ?? [];
    });
  }

  Future<void> _saveOrder(List<int> ids) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_prefsKey, ids.map((e) => e.toString()).toList());
  }

  // Apply the saved order to whatever list we get from the DB.
  List<Substance> _sorted(List<Substance> original) {
    if (_savedOrder.isEmpty) return original;

    final indexOf = <int, int>{
      for (var i = 0; i < _savedOrder.length; i++) _savedOrder[i]: i,
    };

    final sorted = [...original]..sort(
      (a, b) => (indexOf[a.id] ?? 99999).compareTo(indexOf[b.id] ?? 99999),
    );
    return sorted;
  }

  // ──────────────────────────────────────────────────────────────────────
  // UI
  // ──────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext ctx) {
    final substances = ref.watch(
      _showPast ? pastSubstancesStreamProvider : activeSubstancesStreamProvider,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Medications / Supplements'),
        actions: [
          IconButton(
            tooltip: _showPast ? 'Show current' : 'Show past',
            icon: Icon(_showPast ? Icons.history_toggle_off : Icons.history),
            onPressed: () => setState(() => _showPast = !_showPast),
          ),
        ],
      ),
      body: substances.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString())),
        // ── DATA ────────────────────────────────────────────────────────
        data: (list) {
          final items = _sorted(list);

          // 1️⃣ PAST list – plain ListView
          if (_showPast) {
            return ListView.separated(
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 0),
              itemBuilder:
                  (_, i) => _tile(
                    ctx,
                    items[i],
                    allNames: items.map((e) => e.name).toList(),
                    deletable: true,
                    permaDeletable: true,
                  ),
            );
          }

          // 2️⃣ ACTIVE list – reorderable
          return Padding(
            padding: const EdgeInsets.only(bottom: 32.0),
            child: ReorderableListView.builder(
              itemCount: items.length,
              proxyDecorator: _proxyDecorator, // nice drag shadow
              onReorder: (oldIndex, newIndex) async {
                // Normalise index because ReorderableListView’s callback
                // gives a +1 offset when dragging downwards.
                if (newIndex > oldIndex) newIndex -= 1;

                setState(() {
                  final item = items.removeAt(oldIndex);
                  items.insert(newIndex, item);
                  _savedOrder = items.map((e) => e.id).toList();
                });
                await _saveOrder(_savedOrder);
              },
              itemBuilder:
                  (_, i) => _tile(
                    ctx,
                    items[i],
                    allNames: items.map((e) => e.name).toList(),
                    key: ValueKey(items[i].id),
                  ),
            ),
          );
          // );
        },
      ),
      floatingActionButton:
          _showPast
              ? null
              : FloatingActionButton(
                onPressed:
                    () => Navigator.push(
                      ctx,
                      MaterialPageRoute(
                        builder: (_) => const AddEditSubstanceScreen(),
                      ),
                    ),
                child: const Icon(Icons.add),
              ),
    );
  }

  // ────────────────────────────────────────────────────────────────────
  // HELPER: one ListTile
  // ────────────────────────────────────────────────────────────────────
  Widget _tile(
    BuildContext ctx,
    Substance s, {
    required List<String> allNames,
    bool deletable = true,
    bool permaDeletable = false,
    Key? key,
  }) {
    return ListTile(
      key: key,
      title: Text(s.name),
      subtitle: Text(s.dosage ?? ''),
      trailing:
          deletable
              ? IconButton(
                icon: const Icon(Icons.delete),
                onPressed: () async {
                  if (permaDeletable) {
                    final confirm = await showDialog<bool>(
                      context: ctx,
                      builder:
                          (_) => AlertDialog(
                            title: const Text('Permanently delete?'),
                            content: const Text(
                              'This will completely remove the substance and its history. Are you sure?',
                            ),
                            actions: [
                              TextButton(
                                child: const Text('Cancel'),
                                onPressed: () => Navigator.pop(ctx, false),
                              ),
                              TextButton(
                                child: const Text('Delete'),
                                onPressed: () => Navigator.pop(ctx, true),
                              ),
                            ],
                          ),
                    );

                    if (confirm == true) {
                      await ref.read(substanceRepoProvider).delete(s.id);
                    }
                  } else {
                    await ref.read(substanceRepoProvider).stop(s.id);
                  }
                },
              )
              : null,

      onTap:
          () => Navigator.push(
            ctx,
            MaterialPageRoute(
              builder:
                  (_) =>
                      SubstanceDetailScreen(substance: s, substances: allNames),
            ),
          ),
    );
  }

  // Optional: give the dragged item a Material “lift” effect
  static Widget _proxyDecorator(
    Widget child,
    int index,
    Animation<double> animation,
  ) {
    return Material(
      elevation: 6,
      color: Colors.transparent,
      child: Opacity(opacity: 0.95, child: child),
    );
  }
}
