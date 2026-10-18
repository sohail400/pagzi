const MIN_WORDS = 6;
const MAX_LENGTH = 200;

export function normalizeDescription(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function wordCount(value) {
  const text = normalizeDescription(value);
  return text ? text.split(" ").length : 0;
}

export function descriptionError(value) {
  const text = normalizeDescription(value);
  const words = wordCount(text);
  if (words < MIN_WORDS) return "Write at least 6 words about the site.";
  if (text.length > MAX_LENGTH) return "Keep the description under 200 characters.";
  return null;
}
