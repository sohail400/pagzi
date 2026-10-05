const MIN_WORDS = 6;
const MAX_WORDS = 8;
const MAX_LENGTH = 120;

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
  if (text.length > MAX_LENGTH || words < MIN_WORDS || words > MAX_WORDS) {
    return "Describe the site in 6 to 8 words.";
  }
  return null;
}
