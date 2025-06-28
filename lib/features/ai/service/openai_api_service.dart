import 'dart:convert';
import 'package:dart_openai/dart_openai.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:libretrac/core/database/app_database.dart';

class OpenAIAPI {
  OpenAIAPI._() {
    // Put your key in --dart-define=OPENAI_KEY=... or .env; this picks it up.
    OpenAI.apiKey = dotenv.env['api_key'] ?? '';
  }
  static final instance = OpenAIAPI._();

  Future<String> getSummary(String substanceName) async {
    final chat = await OpenAI.instance.chat.create(
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.system,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              "You are a clinical pharmacist. "
              "Summaries must be ≤120 words, plain language.",
            ),
          ],
        ),
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.user,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              "Summarize $substanceName.",
            ),
          ],
        ),
      ],
    );

    return chat.choices.first.message.content!.first.text!.trim();
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
              'Definition of edible = humans INTENTIONALLY ingest it '
              '(eat, drink, smoke, snort, inject) for nourishment, therapy, '
              'or psychoactive use. If it\'s something such as lithium, consider it\'s medical use.'
              'If people do NOT normally ingest it on '
              'purpose (e.g. pillowcase, smartphone, shampoo, gasoline), '
              'return false.  When unsure, return false.',
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
  }) async {
    final chat = await OpenAI.instance.chat.create(
      model: "gpt-4o-mini",
      temperature: 0,
      responseFormat: {"type": "json_object"}, // keep strict JSON
      messages: [
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.system,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              "You are a clinical drug-interaction checker. "
              "Respond ONLY with a JSON array of warning strings. "
              "If the candidate dosage exceeds typical adult upper limits, "
              "also include a \"High dose\" warning. Return [] if no warnings.",
            ),
          ],
        ),
        OpenAIChatCompletionChoiceMessageModel(
          role: OpenAIChatMessageRole.user,
          content: [
            OpenAIChatCompletionChoiceMessageContentItemModel.text(
              "Current stack: ${currentStack.join(', ')}. "
              "Candidate: $candidate"
              "${candidateDosage == null ? '' : ' at $candidateDosage'}. "
              "List any interactions.",
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
              "correlations or concerning trends.  Mention limitations and "
              "suggest next steps. Refer to entries by date, not by ID.  Respond in concise Markdown.",
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
