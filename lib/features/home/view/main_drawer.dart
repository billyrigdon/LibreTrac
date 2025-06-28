import 'package:flutter/material.dart';
import 'package:libretrac/features/journal/view/journal_list_screen.dart';
import 'package:libretrac/features/settings/view/settings_screen.dart';
import 'package:libretrac/features/substances/substance_list_screen.dart';

class MainDrawer extends StatelessWidget {
  const MainDrawer(this.onReturn, {super.key});

  final VoidCallback onReturn;
  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SafeArea(
        child: ListView(
          children: [
            SizedBox(height: 20),
            ListTile(
              leading: const Icon(Icons.local_pharmacy),
              title: const Text('Medications/Supplements'),
              onTap: () {
                Navigator.pop(context); // close drawer
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const SubstanceListScreen(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.note),
              title: const Text('Journals'),
              onTap: () {
                Navigator.pop(context); // close drawer
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const JournalListScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Settings'),
              onTap: () async {
                Navigator.pop(context); // close drawer
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SettingsScreen()),
                );
                onReturn();
              },
            ),
          ],
        ),
      ),
    );
  }
}
