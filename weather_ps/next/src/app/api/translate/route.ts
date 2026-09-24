import {
  getFallbackTranslations,
  type LanguageCode,
} from "@/lib/i18n";

const supportedTargets = new Set<LanguageCode>(["hi", "mr"]);
const maxTextsPerRequest = 128;
const maxCharactersPerRequest = 24_000;

type TranslationRequest = {
  texts?: unknown;
  target?: unknown;
};

type GoogleTranslationResponse = {
  data?: {
    translations?: Array<{ translatedText?: string }>;
  };
  error?: { message?: string };
};

function decodeGoogleText(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export async function POST(request: Request) {
  let payload: TranslationRequest;

  try {
    payload = (await request.json()) as TranslationRequest;
  } catch {
    return Response.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const target = payload.target;
  const texts = payload.texts;

  if (
    typeof target !== "string" ||
    !supportedTargets.has(target as LanguageCode) ||
    !Array.isArray(texts) ||
    texts.length === 0 ||
    texts.length > maxTextsPerRequest ||
    !texts.every((text) => typeof text === "string")
  ) {
    return Response.json(
      { error: "Expected 1–128 text strings and a supported target language." },
      { status: 400 },
    );
  }

  const cleanTexts = texts.map((text) => text.trim()).filter(Boolean);
  const characterCount = cleanTexts.reduce((sum, text) => sum + text.length, 0);

  if (cleanTexts.length !== texts.length || characterCount > maxCharactersPerRequest) {
    return Response.json(
      { error: "Translation request is empty or exceeds the character limit." },
      { status: 400 },
    );
  }

  const typedTarget = target as Exclude<LanguageCode, "en">;
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

  if (!apiKey) {
    return Response.json({
      translations: getFallbackTranslations(typedTarget, cleanTexts),
      provider: "bundled-fallback",
    });
  }

  try {
    const googleResponse = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: cleanTexts,
          target: typedTarget,
          source: "en",
          format: "text",
        }),
        cache: "no-store",
      },
    );

    const result = (await googleResponse.json()) as GoogleTranslationResponse;
    const translations = result.data?.translations;

    if (!googleResponse.ok || !translations || translations.length !== cleanTexts.length) {
      return Response.json({
        translations: getFallbackTranslations(typedTarget, cleanTexts),
        provider: "bundled-fallback",
        warning: "Google Cloud Translation was unavailable; bundled translations were used.",
      });
    }

    return Response.json({
      translations: translations.map((translation, index) =>
        decodeGoogleText(translation.translatedText ?? cleanTexts[index]),
      ),
      provider: "google-cloud",
    });
  } catch {
    return Response.json({
      translations: getFallbackTranslations(typedTarget, cleanTexts),
      provider: "bundled-fallback",
      warning: "Google Cloud Translation was unavailable; bundled translations were used.",
    });
  }
}
