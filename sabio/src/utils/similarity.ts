const ACCENT_MAP: Record<string, string> = {
  á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n',
};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[áéíóúüñ]/g, (ch) => ACCENT_MAP[ch] ?? ch)
    .replace(/[¿¡.,!?;:'"()-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function similarity(input: string, expected: string): number {
  const a = normalize(input);
  const b = normalize(expected);
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

export function isCloseEnough(input: string, expected: string, threshold = 0.8): boolean {
  return similarity(input, expected) >= threshold;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * True if the user said the color somewhere in the phrase (STT rarely returns a single word).
 * Handles e.g. "es rojo", "digo azul", "el color verde", or English "red" if `english` is passed.
 */
export function transcriptMatchesColor(
  transcript: string,
  colorName: string,
  options?: { english?: string; threshold?: number; wordThreshold?: number },
): boolean {
  const threshold = options?.threshold ?? 0.72;
  const wordThreshold = options?.wordThreshold ?? 0.82;

  if (!transcript.trim()) return false;

  // Whole utterance is basically just the color
  if (isCloseEnough(transcript, colorName, threshold)) return true;

  const t = normalize(transcript);
  const cn = normalize(colorName);
  if (!t || !cn) return false;

  // Color appears as its own word inside a longer sentence
  const asWord = new RegExp(`(^|\\s)${escapeRegExp(cn)}($|\\s)`);
  if (asWord.test(t)) return true;

  // Any token close to the Spanish color name (handles STT typos per word)
  for (const word of t.split(/\s+/)) {
    if (!word) continue;
    if (isCloseEnough(word, colorName, wordThreshold)) return true;
    if (word === cn) return true;
  }

  if (options?.english) {
    if (isCloseEnough(transcript, options.english, threshold)) return true;
    const en = normalize(options.english);
    if (en) {
      const enWord = new RegExp(`(^|\\s)${escapeRegExp(en)}($|\\s)`);
      if (enWord.test(t)) return true;
      for (const word of t.split(/\s+/)) {
        if (isCloseEnough(word, options.english, wordThreshold)) return true;
      }
    }
  }

  return false;
}
