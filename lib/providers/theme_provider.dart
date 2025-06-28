import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Holds the current ThemeMode (dark by default).
final themeModeProvider = StateProvider<ThemeMode>((_) => ThemeMode.dark);
