/**
 * Normalize Arabic string for robust prefix and substring searching
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // Remove diacritics / Tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alefs
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Teh Marbuta to Heh
    .replace(/ة/g, 'ه')
    // Normalize Alef Maksura to Yeh
    .replace(/ى/g, 'ي')
    // Normalize Persian/Urdu variants if any
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

/**
 * Check if target matches query by prefix or word-prefix
 */
export function matchesArabicPrefix(target: string, query: string): boolean {
  if (!query.trim()) return true;

  const normalizedTarget = normalizeArabic(target);
  const normalizedQuery = normalizeArabic(query);

  // 1. Direct prefix match
  if (normalizedTarget.startsWith(normalizedQuery)) {
    return true;
  }

  // 2. Also handle prefix without the definite article "ال"
  const targetWithoutAl = normalizedTarget.startsWith('ال') ? normalizedTarget.slice(2) : normalizedTarget;
  const queryWithoutAl = normalizedQuery.startsWith('ال') ? normalizedQuery.slice(2) : normalizedQuery;

  if (targetWithoutAl.startsWith(normalizedQuery) || normalizedTarget.startsWith(queryWithoutAl)) {
    return true;
  }

  // 3. Word-level prefix match (e.g. user types "ريا" and target has "التمارين الرياضية")
  const words = normalizedTarget.split(/\s+/);
  return words.some(word => {
    const wordWithoutAl = word.startsWith('ال') ? word.slice(2) : word;
    return word.startsWith(normalizedQuery) || wordWithoutAl.startsWith(queryWithoutAl);
  });
}
