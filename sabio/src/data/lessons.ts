export type LessonSection = {
  id: string;
  title: string;
  subtitle: string;
};

export type LessonContentBlock = {
  heading?: string;
  body: string;
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
        body: 'Spanish has five vowels:\n\n• A - "ah" sound in "father"\n• E - "eh" sound in "pet"\n• I - "ee" sound in "machine"\n• O - "oh" sound in "go"\n• U - "oo" sound in "flute"\n\nA key part of Spanish pronunciation is keeping vowels brief. For example, the "o" sound is not quite like "oh" in English. The mouth should be fixed and form a crisp "o" sound. Additionally, it is important to stress every vowel in every word, much unlike English.',
      },
      {
        heading: 'Consonants That Differ from English',
        body: 'Most consonants sound similar to English, but a few are much different:\n\n• H - silent. "Hola" is pronounced "oh-lah."\n• J - an "h" sound but with more of a throat sound.\n• LL - pronounced like "y" in most countries, though some pronounce it more like a "j".\n• Ñ - like "ny" in "canyon."\n• R - a single tap of the tongue like the "tt" in "butter".\n• RR - a rolled "r." Many who are not native speakers cannot make this sound, and that is okay! There are many tutortials on Youtube to learn, but people will understand you almost every time even if you can\'t do it.\n• V - pronounced the same as B.',
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
        body: 'The first sixteen numbers are unique words you need to learn by heart:\n\n0 — cero\n1 — uno\n2 — dos\n3 — tres\n4 — cuatro\n5 — cinco\n6 — seis\n7 — siete\n8 — ocho\n9 — nueve\n10 — diez\n11 — once\n12 — doce\n13 — trece\n14 — catorce\n15 — quince',
      },
      {
        heading: 'Numbers 16–29: The Combo Pattern',
        body: 'From 16 to 29, numbers are formed by combining "dieci-" or "veinti-" with the ones digit, written as one word:\n\n16 — dieciséis (diez + y + seis)\n17 — diecisiete\n18 — dieciocho\n19 — diecinueve\n20 — veinte\n21 — veintiuno\n22 — veintidós\n23 — veintitrés\n24 — veinticuatro\n25 — veinticinco\n26 — veintiséis\n27 — veintisiete\n28 — veintiocho\n29 — veintinueve\n\nNotice the pattern: "veinti" + the ones digit, all as one word.',
      },
      {
        heading: 'Numbers 30–99: "Y" in the Middle',
        body: 'From 30 onward, the tens and ones are separate words joined by "y" (and):\n\n30 — treinta\n31 — treinta y uno\n40 — cuarenta\n50 — cincuenta\n60 — sesenta\n70 — setenta\n80 — ochenta\n90 — noventa\n\nExamples:\n• 43 — cuarenta y tres\n• 67 — sesenta y siete\n• 85 — ochenta y cinco\n\nThe pattern is always: [tens word] + y + [ones word].',
      },
      {
        heading: 'Hundreds and Beyond',
        body: '100 — cien (when alone) or ciento (when followed by more)\n200 — doscientos\n300 — trescientos\n500 — quinientos (not "cincocientos"!)\n700 — setecientos (not "sietecientos"!)\n900 — novecientos (not "nuevecientos"!)\n1,000 — mil\n1,000,000 — un millón\n\nExamples:\n• 101 — ciento uno\n• 256 — doscientos cincuenta y seis\n• 1.492 — mil cuatrocientos noventa y dos\n\nNote: Spanish uses periods for thousands and commas for decimals — the opposite of English!',
      },
      {
        heading: 'Quick Tips',
        body: 'A few things to watch for:\n\n• "Uno" becomes "un" before masculine nouns: "un libro" (one book)\n• "Uno" becomes "una" before feminine nouns: "una mesa" (one table)\n• Hundreds agree in gender: "doscientos libros" but "doscientas mesas"\n• "Millón" needs "de" before a noun: "un millón de personas" (a million people)\n\nTry counting everyday objects in Spanish — it is the fastest way to make numbers automatic!',
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
