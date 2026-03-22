export type LessonSection = {
  id: string;
  title: string;
  subtitle: string;
};

export type LessonContentBlock = {
  heading?: string;
  body: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
  practiceLink?: { label: string; screen: string };
};

export type Lesson = {
  id: string;
  sectionId: string;
  title: string;
  subtitle: string;
  icon: string;
  content: LessonContentBlock[];
};

export const sections: LessonSection[] = [
  { id: 'raices', title: 'Raíces', subtitle: 'Roots' },
  { id: 'brotes', title: 'Brotes', subtitle: 'Sprouts' },
  { id: 'ramas', title: 'Ramas', subtitle: 'Branches' },
  { id: 'copa', title: 'Copa', subtitle: 'Canopy' },
];

export const lessons: Lesson[] = [
  // ── Raíces ──
  {
    id: 'alfabeto',
    sectionId: 'raices',
    title: 'El Alfabeto',
    subtitle: 'The Alphabet',
    icon: '🔤',
    content: [
      {
        heading: 'The Spanish Alphabet',
        body: 'The Spanish alphabet has all of the same letters as English plus one extra: ñ. The beauty of Spanish is that every letter has a consistent pronunciation, meaning it is pronounced every time, no matter what the context is. Once you know the sounds, you can read any word aloud and start sounding like a Spanish speaker right away.',
      },
      {
        heading: 'Vowels: The Foundation',
        body: 'Spanish has five vowels. A key part of Spanish pronunciation is keeping vowels brief. For example, the "o" sound is not quite like "oh" in English. The mouth should be fixed and form a crisp "o" sound. Additionally, it is important to stress every vowel in every word, much unlike English.',
        table: {
          headers: ['Letter', 'Sound', 'Like in...'],
          rows: [
            ['A', 'ah', 'father'],
            ['E', 'eh', 'pet'],
            ['I', 'ee', 'machine'],
            ['O', 'oh', 'go'],
            ['U', 'oo', 'flute'],
          ],
        },
      },
      {
        heading: 'Consonants That Differ from English',
        body: 'Most consonants sound similar to English, but a few are much different:',
        table: {
          headers: ['Letter', 'Sound', 'Example'],
          rows: [
            ['H', 'silent', '"Hola" → oh-lah'],
            ['J', 'throat "h"', 'stronger than English h'],
            ['LL', '"y" sound', 'like "y" in most countries'],
            ['Ñ', '"ny"', 'like "ny" in canyon'],
            ['R', 'tongue tap', 'like "tt" in butter'],
            ['RR', 'rolled "r"', 'practice makes perfect!'],
            ['V', 'same as B', 'no distinction in Spanish'],
          ],
        },
      },
      {
        heading: 'More on Pronunciation',
        body: 'You now know the key pronunciations in Spanish! Still, we suggest that you listen carefully to fluent speakers, as almost every letter is at least a littler different from English and the cadence can be much different. Then, practice speaking!',
        practiceLink: { label: 'Practice with Dillow', screen: 'DillowChat' },
      },
    ],
  },
  {
    id: 'numeros',
    sectionId: 'raices',
    title: 'Los Números',
    subtitle: 'Numbers',
    icon: '🔢',
    content: [
      {
        heading: 'Numbers 0–15: Just Memorize These',
        body: 'The first sixteen numbers are unique words you need to learn by heart. Here they are in both Spanish and English:',
        table: {
          headers: ['#', 'Spanish', 'Pronunciation'],
          rows: [
            ['0', 'cero', 'SEH-roh'],
            ['1', 'uno', 'OO-noh'],
            ['2', 'dos', 'dohs'],
            ['3', 'tres', 'trehs'],
            ['4', 'cuatro', 'KWAH-troh'],
            ['5', 'cinco', 'SEEN-koh'],
            ['6', 'seis', 'says'],
            ['7', 'siete', 'see-EH-teh'],
            ['8', 'ocho', 'OH-choh'],
            ['9', 'nueve', 'NWEH-veh'],
            ['10', 'diez', 'dee-EHS'],
            ['11', 'once', 'OHN-seh'],
            ['12', 'doce', 'DOH-seh'],
            ['13', 'trece', 'TREH-seh'],
            ['14', 'catorce', 'kah-TOHR-seh'],
            ['15', 'quince', 'KEEN-seh'],
          ],
        },
      },
      {
        heading: 'Numbers 16–29: The Combo Pattern',
        body: 'From 16 to 29, numbers are formed by combining "dieci-" or "veinti-" with the ones digit, written as one word:',
        table: {
          headers: ['#', 'Spanish', 'How it\'s built'],
          rows: [
            ['16', 'dieciséis', 'diez + y + seis'],
            ['17', 'diecisiete', 'diez + y + siete'],
            ['18', 'dieciocho', 'diez + y + ocho'],
            ['19', 'diecinueve', 'diez + y + nueve'],
            ['20', 'veinte', '—'],
            ['21', 'veintiuno', 'veinte + y + uno'],
            ['22', 'veintidós', 'veinte + y + dos'],
            ['23', 'veintitrés', 'veinte + y + tres'],
            ['24', 'veinticuatro', 'veinte + y + cuatro'],
            ['25', 'veinticinco', 'veinte + y + cinco'],
            ['26', 'veintiséis', 'veinte + y + seis'],
            ['27', 'veintisiete', 'veinte + y + siete'],
            ['28', 'veintiocho', 'veinte + y + ocho'],
            ['29', 'veintinueve', 'veinte + y + nueve'],
          ],
        },
      },
      {
        heading: 'Numbers 30–99: "Y" in the Middle',
        body: 'From 30 onward, the tens and ones are separate words joined by "y" (and). The pattern is always: [tens word] + y + [ones word].',
        table: {
          headers: ['#', 'Spanish'],
          rows: [
            ['30', 'treinta'],
            ['40', 'cuarenta'],
            ['50', 'cincuenta'],
            ['60', 'sesenta'],
            ['70', 'setenta'],
            ['80', 'ochenta'],
            ['90', 'noventa'],
          ],
        },
      },
      {
        heading: 'Hundreds and Beyond',
        body: 'Watch out for the irregular hundreds — they don\'t follow the simple pattern:',
        table: {
          headers: ['#', 'Spanish', 'Note'],
          rows: [
            ['100', 'cien / ciento', '"cien" alone, "ciento" + more'],
            ['200', 'doscientos', ''],
            ['300', 'trescientos', ''],
            ['500', 'quinientos', 'not "cincocientos"!'],
            ['700', 'setecientos', 'not "sietecientos"!'],
            ['900', 'novecientos', 'not "nuevecientos"!'],
            ['1,000', 'mil', ''],
            ['1,000,000', 'un millón', ''],
          ],
        },
      },
      {
        heading: 'Quick Tips',
        body: 'A few things to watch for:\n\n• "Uno" becomes "un" before masculine nouns: "un libro" (one book)\n• "Uno" becomes "una" before feminine nouns: "una mesa" (one table)\n• Hundreds agree in gender: "doscientos libros" but "doscientas mesas"\n• "Millón" needs "de" before a noun: "un millón de personas" (a million people)\n\nNote: Spanish uses periods for thousands and commas for decimals — the opposite of English!\n\nTry counting everyday objects in Spanish — it is the fastest way to make numbers automatic!',
        practiceLink: { label: 'Practice with Dillow', screen: 'DillowChat' },
      },
    ],
  },
  {
    id: 'pronunciacion',
    sectionId: 'raices',
    title: 'La Pronunciación',
    subtitle: 'Pronunciation',
    icon: '🗣️',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'saludos',
    sectionId: 'raices',
    title: 'Saludos Básicos',
    subtitle: 'Basic Greetings',
    icon: '👋',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'presentaciones',
    sectionId: 'raices',
    title: 'Presentaciones',
    subtitle: 'Introductions',
    icon: '🤝',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },

  // ── Brotes ──
  {
    id: 'articulos',
    sectionId: 'brotes',
    title: 'Los Artículos',
    subtitle: 'Articles',
    icon: '📝',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'sustantivos',
    sectionId: 'brotes',
    title: 'Sustantivos y Género',
    subtitle: 'Nouns & Gender',
    icon: '📌',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'pronombres',
    sectionId: 'brotes',
    title: 'Pronombres Personales',
    subtitle: 'Personal Pronouns',
    icon: '👤',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'ser-estar',
    sectionId: 'brotes',
    title: 'Ser vs. Estar',
    subtitle: 'To Be',
    icon: '⚖️',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'presente-regular',
    sectionId: 'brotes',
    title: 'Presente Regular',
    subtitle: 'Regular Present Tense',
    icon: '⏰',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },

  // ── Ramas ──
  {
    id: 'presente-irregular',
    sectionId: 'ramas',
    title: 'Presente Irregular',
    subtitle: 'Irregular Present Tense',
    icon: '🔀',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'preguntas',
    sectionId: 'ramas',
    title: 'Hacer Preguntas',
    subtitle: 'Asking Questions',
    icon: '❓',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'adjetivos',
    sectionId: 'ramas',
    title: 'Adjetivos',
    subtitle: 'Adjectives & Agreement',
    icon: '🎨',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'preterito',
    sectionId: 'ramas',
    title: 'Pretérito',
    subtitle: 'Preterite Past',
    icon: '⏪',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'imperfecto',
    sectionId: 'ramas',
    title: 'Imperfecto',
    subtitle: 'Imperfect Past',
    icon: '📖',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },

  // ── Copa ──
  {
    id: 'futuro',
    sectionId: 'copa',
    title: 'Futuro Simple',
    subtitle: 'Simple Future',
    icon: '🔮',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'subjuntivo',
    sectionId: 'copa',
    title: 'El Subjuntivo',
    subtitle: 'Subjunctive Mood',
    icon: '💭',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'condicional',
    sectionId: 'copa',
    title: 'Condicional',
    subtitle: 'Conditional',
    icon: '🔄',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'por-para',
    sectionId: 'copa',
    title: 'Por vs. Para',
    subtitle: 'For / By / Through',
    icon: '↔️',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
  {
    id: 'expresiones',
    sectionId: 'copa',
    title: 'Expresiones',
    subtitle: 'Idioms & Expressions',
    icon: '💬',
    content: [
      { heading: 'In Development', body: 'These lessons will be written after Hoo Hacks, look at the first two for a sample!' },
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function getLessonsForSection(sectionId: string): Lesson[] {
  return lessons.filter((l) => l.sectionId === sectionId);
}

export function getSectionForLesson(lesson: Lesson): LessonSection | undefined {
  return sections.find((s) => s.id === lesson.sectionId);
}
