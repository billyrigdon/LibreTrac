import 'dart:convert';

import 'package:drift/drift.dart';

class MetricsConverter extends TypeConverter<Map<String, int>, String> {
  const MetricsConverter();

  @override
  Map<String, int> fromSql(String fromDb) {
    final map = jsonDecode(fromDb);
    return Map<String, int>.from(map);
  }

  @override
  String toSql(Map<String, int> value) => jsonEncode(value);
}
