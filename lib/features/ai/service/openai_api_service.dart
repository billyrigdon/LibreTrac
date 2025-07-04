import 'dart:convert';
import 'package:dart_openai/dart_openai.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:libretrac/core/database/app_database.dart';

class OpenAIAPI {
  OpenAIAPI._() {
    OpenAI.apiKey = dotenv.env['api_key'] ?? '';
  }
  static final instance = OpenAIAPI._();

  Future<String> getSubstanceProfile(
    String substanceName,
    List<String> currentStack, {
    String? notes,
  }) async {
    final filteredStack =
        currentStack
            .where((s) => s.toLowerCase() != substanceName.toLowerCase())
            .toList();

    final chat = await OpenAI.instance.chat.create(
      model: "gpt-4o-mini",
      temperature: 0.5,
      responseFormat: {"type": "json_object"},
      messages: [
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.system,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              "You are a clinical pharmacist. "
              "Respond ONLY with valid JSON in the format:\n"
              "{ \"benefits\": [\"...\"], \"cautions\": [\"...\"], "
              "\"ingredients\": [\"...\"] if applicable, "
              "\"interactsWith\": [\"...\"] (ONLY those from the stack that interact) }.\n"
              "Take the user's notes into account if relevant.",
            ),
          ],
        ),
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.user,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              "Substance: $substanceName\n"
              "User notes: ${notes ?? 'none'}\n"
              "Current stack: ${filteredStack.join(', ')}.\n"
              "Give its benefits, cautions, ingredients (if compound), and ONLY include interactions between the given substance and substances from the stack that are known to interact, not just all interactions in the stack.",
            ),
          ],
        ),
      ],
    );

    final raw = chat.choices.first.message.content!.first.text!.trim();

    Map<String, dynamic> decoded;
    try {
      decoded = jsonDecode(raw);
    } catch (_) {
      return '⚠️ Failed to parse substance info.';
    }

    final b = (decoded['benefits'] as List?)?.cast<String>() ?? [];
    final c = (decoded['cautions'] as List?)?.cast<String>() ?? [];
    final i = (decoded['ingredients'] as List?)?.cast<String>() ?? [];
    final x = (decoded['interactsWith'] as List?)?.cast<String>() ?? [];

    return [
      '## ✅ Benefits',
      if (b.isNotEmpty) ...b.map((e) => '- $e') else ['- None noted.'],
      '\n## ⚠️ Cautions',
      if (c.isNotEmpty) ...c.map((e) => '- $e') else ['- No known cautions.'],
      if (i.isNotEmpty) ...['\n## 🧪 Ingredients', ...i.map((e) => '- $e')],
      if (x.isNotEmpty) ...[
        '\n## 🔗 Interactions with Your Stack',
        ...x.map((e) => '- $e'),
      ],
    ].join('\n');
  }

  Future<bool> isIngestible(String name) async {
    final chat = await OpenAI.instance.chat.create(
      model: 'gpt-4o-mini',
      temperature: 0,
      responseFormat: {'type': 'json_object'},
      messages: [
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.system,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              'Respond ONLY with valid JSON like {"edible": true}. '
              'Definition: edible = humans intentionally ingest it '
              '(eat, drink, smoke, snort, inject, topicals, suppository) for nourishment, therapy, or psychoactive use. '
              'Interpret emojis and slang. For example, "🚹 hormone" means testosterone, which is edible. '
              'If it’s normally taken by mouth, injection, patch, or sublingually, it counts. '
              'If unsure or clearly non-edible (e.g. "smartphone"), return false.',
            ),
          ],
        ),
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.user,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              'Classify "$name". edible = true | false',
            ),
          ],
        ),
      ],
    );

    final raw = chat.choices.first.message.content!.first.text!.trim();
    dynamic decoded;
    try {
      decoded = jsonDecode(raw);
    } catch (_) {
      decoded = null; // malformed → treat as false
    }
    return decoded is Map && decoded['edible'] == true;
  }

  Future<List<String>> checkInteractions({
    required String candidate,
    required List<String> currentStack,
    String? candidateDosage,
    String? notes,
  }) async {
    final chat = await OpenAI.instance.chat.create(
      model: "gpt-4o-mini",
      temperature: 2,
      responseFormat: {"type": "json_object"},
      messages: [
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.system,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              "You are a clinical drug-interaction checker. "
              "Check for drug interactions between the candidate and the current stack. Only show the interactions between the candidate and the current stack, not the interactions within the stack"
              "Include considerations based on user-provided notes if relevant. "
              "Respond ONLY with a JSON array of warning strings. Return [] if none.",
            ),
          ],
        ),
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.user,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              "Current stack: ${currentStack.join(', ')}. "
              "Candidate: $candidate${candidateDosage == null ? '' : ' at $candidateDosage'}. "
              "${notes != null ? 'User notes: $notes. ' : ''}"
              "Check for any interactions or cautions.",
            ),
          ],
        ),
      ],
    );

    final raw = chat.choices.first.message.content!.first.text!.trim();

    // ── Robust JSON cast ─────────────────────────────────────────────
    dynamic decoded;
    try {
      decoded = jsonDecode(raw);
    } catch (_) {
      decoded = null;
    }

    if (decoded is List) {
      return decoded.cast<String>();
    } else if (decoded is Map) {
      // handle the rare case the model nests the list inside a map
      for (final v in decoded.values) {
        if (v is List) return v.cast<String>();
      }
    }
    // Fallback: treat anything else as “no warnings”
    return <String>[];
  }

  Future<String> analyzeTrends(TrendRequest req) async {
    final chat = await OpenAI.instance.chat.create(
      model: "gpt-4o-mini", // pick whichever model tier you prefer
      temperature: 0.2,
      messages: [
        // system prompt
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.system,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              "You are a data analyst specialised in mood, cognition, sleep and "
              "pharmacology.  Analyse the JSON-encoded data and identify any "
              "correlations or concerning trends."
              "Refer to entries by date, not by ID.  Respond in concise Markdown.",
            ),
          ],
        ),
        // user payload
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.user,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              "Here is the anonymised data:\n${req.toPrettyJson()}",
            ),
          ],
        ),
      ],
    );

    return chat.choices.first.message.content!.first.text!.trim();
  }
}

class TrendRequest {
  TrendRequest({
    required this.since,
    required this.moods,
    required this.cognitive,
    required this.substances,
    required this.sleeps,
  });

  final DateTime since;
  final List<MoodEntry> moods;
  final List<ReactionResult> cognitive;
  final List<Substance> substances;
  final List<SleepEntry> sleeps;

  Map<String, dynamic> toMap() => {
    'since': since.toIso8601String(),
    'moodEntries': moods.map((m) => m.toJson()).toList(),
    'cognitiveResults': cognitive.map((c) => c.toJson()).toList(),
    'substances': substances.map((s) => s.toJson()).toList(),
    'sleeps': sleeps.map((s) => s.toJson()).toList(),
  };

  String toPrettyJson() => const JsonEncoder.withIndent('  ').convert(toMap());
}
