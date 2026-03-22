const CACHE = new Map<string, string>();

export async function translateText(
  text: string,
  from = 'es',
  to = 'en'
): Promise<string> {
  const key = `${from}:${to}:${text.toLowerCase().trim()}`;
  const cached = CACHE.get(key);
  if (cached) return cached;

  try {
    const q = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${q}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = (data[0] as [string, string][] | null)
      ?.map((seg) => seg[0])
      .join('');
    if (!translated) return text;
    CACHE.set(key, translated);
    return translated;
  } catch {
    return text;
  }
}

const SPANISH_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'de', 'en', 'que', 'es', 'por',
  'con', 'para', 'como', 'pero', 'más', 'este', 'esta', 'muy', 'también',
  'hay', 'ser', 'está', 'son', 'tiene', 'puede', 'todo', 'donde', 'cuando',
  'qué', 'hola', 'bien', 'sí', 'yo', 'tú', 'él', 'ella', 'usted', 'cómo',
  'sobre', 'hablar', 'quiero', 'puedo', 'tengo', 'vamos', 'gracias', 'si',
  'no', 'y', 'o', 'del', 'al', 'se', 'su', 'le', 'lo', 'me', 'te', 'nos',
  'mi', 'tu', 'ya', 'aquí', 'ahora', 'hoy', 'ayer', 'mañana', 'eso',
  'esto', 'esa', 'ese', 'otros', 'otras', 'otro', 'otra', 'porque', 'pues',
  'entonces', 'así', 'algo', 'nada', 'mucho', 'poco', 'bueno', 'buena',
  'malo', 'mala', 'grande', 'pequeño', 'nuevo', 'viejo', 'primero', 'último',
  'una', 'tiempo', 'día', 'casa', 'agua', 'comer', 'hacer', 'ir', 'ver',
  'saber', 'poder', 'decir', 'dar', 'creo', 'verdad', 'vida', 'mundo',
]);

export function isLikelySpanish(text: string): boolean {
  if (/[áéíóúñ¿¡]/i.test(text)) return true;

  const words = text
    .toLowerCase()
    .replace(/[^\w\sáéíóúñü]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return false;

  let count = 0;
  for (const w of words) {
    if (SPANISH_WORDS.has(w)) count++;
  }
  return count / words.length > 0.15;
}
