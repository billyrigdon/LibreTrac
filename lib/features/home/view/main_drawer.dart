import 'package:flutter/material.dart';
import 'package:libretrac/features/home/view/home_screen.dart';
import 'package:libretrac/features/journal/view/journal_list_screen.dart';
import 'package:libretrac/features/profile/view/profile_view.dart';
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
              leading: const Icon(Icons.person),
              title: const Text('Profile'),
              onTap: () {
                Navigator.pop(context); // close drawer
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ProfileView()),
                );
              },
            ),
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
              leading: const Icon(Icons.mood),
              title: const Text('Check-ins'),
              onTap: () {
                Navigator.pop(context); // close drawer
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const JournalListScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.auto_graph),
              title: const Text('Metrics'),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const EditMetricsScreen()),
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
