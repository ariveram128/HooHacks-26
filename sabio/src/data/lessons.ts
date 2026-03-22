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
        heading: 'Coming Soon',
        body: 'This lesson will cover the Spanish alphabet, including the special letter ñ and how each letter is pronounced differently from English.',
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
        heading: 'Coming Soon',
        body: 'This lesson will explain the logic behind Spanish numbers — how they form patterns and how counting works from 0 to millions.',
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
      {
        heading: 'Coming Soon',
        body: 'This lesson will break down the five pure Spanish vowels, consonant differences from English, and the rules of syllable stress.',
      },
    ],
  },
  {
    id: 'saludos',
    sectionId: 'raices',
    title: 'Saludos Básicos',
    subtitle: 'Basic Greetings',
    icon: '👋',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will teach you the essential greetings and farewells, including when to use tú vs. usted.',
      },
    ],
  },
  {
    id: 'presentaciones',
    sectionId: 'raices',
    title: 'Presentaciones',
    subtitle: 'Introductions',
    icon: '🤝',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will cover how to introduce yourself and others, ask someone\'s name, and share where you\'re from.',
      },
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
      {
        heading: 'Coming Soon',
        body: 'This lesson will explain el, la, los, las — why Spanish nouns have gender and how to choose the right article.',
      },
    ],
  },
  {
    id: 'sustantivos',
    sectionId: 'brotes',
    title: 'Sustantivos y Género',
    subtitle: 'Nouns & Gender',
    icon: '📌',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will cover noun gender rules, common exceptions, and how to make nouns plural.',
      },
    ],
  },
  {
    id: 'pronombres',
    sectionId: 'brotes',
    title: 'Pronombres Personales',
    subtitle: 'Personal Pronouns',
    icon: '👤',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will introduce yo, tú, él/ella, nosotros, vosotros, ellos/ellas — and when each is used or dropped.',
      },
    ],
  },
  {
    id: 'ser-estar',
    sectionId: 'brotes',
    title: 'Ser vs. Estar',
    subtitle: 'To Be',
    icon: '⚖️',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will untangle the two Spanish verbs for "to be" — when to use ser (identity) vs. estar (state/location).',
      },
    ],
  },
  {
    id: 'presente-regular',
    sectionId: 'brotes',
    title: 'Presente Regular',
    subtitle: 'Regular Present Tense',
    icon: '⏰',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will explain how -ar, -er, and -ir verbs conjugate in the present tense and the logic behind the endings.',
      },
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
      {
        heading: 'Coming Soon',
        body: 'This lesson will cover stem-changing verbs, yo-irregular verbs, and the most common irregular verbs in daily Spanish.',
      },
    ],
  },
  {
    id: 'preguntas',
    sectionId: 'ramas',
    title: 'Hacer Preguntas',
    subtitle: 'Asking Questions',
    icon: '❓',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will teach question formation — inversion, question words (qué, quién, dónde, cuándo, por qué, cómo), and intonation.',
      },
    ],
  },
  {
    id: 'adjetivos',
    sectionId: 'ramas',
    title: 'Adjetivos',
    subtitle: 'Adjectives & Agreement',
    icon: '🎨',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will explain how adjectives agree with nouns in gender and number, and why they usually come after the noun.',
      },
    ],
  },
  {
    id: 'preterito',
    sectionId: 'ramas',
    title: 'Pretérito',
    subtitle: 'Preterite Past',
    icon: '⏪',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will cover the preterite tense — used for completed actions in the past, with regular and irregular conjugations.',
      },
    ],
  },
  {
    id: 'imperfecto',
    sectionId: 'ramas',
    title: 'Imperfecto',
    subtitle: 'Imperfect Past',
    icon: '📖',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will explain the imperfect tense — used for habitual or ongoing past actions — and how it differs from the preterite.',
      },
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
      {
        heading: 'Coming Soon',
        body: 'This lesson will cover the simple future tense — adding endings to the full infinitive — and its irregular stems.',
      },
    ],
  },
  {
    id: 'subjuntivo',
    sectionId: 'copa',
    title: 'El Subjuntivo',
    subtitle: 'Subjunctive Mood',
    icon: '💭',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will introduce the subjunctive — what triggers it (wishes, doubts, emotions) and how to form it in the present.',
      },
    ],
  },
  {
    id: 'condicional',
    sectionId: 'copa',
    title: 'Condicional',
    subtitle: 'Conditional',
    icon: '🔄',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will explain the conditional tense — expressing "would" — and how it pairs with the subjunctive in if-clauses.',
      },
    ],
  },
  {
    id: 'por-para',
    sectionId: 'copa',
    title: 'Por vs. Para',
    subtitle: 'For / By / Through',
    icon: '↔️',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will demystify por and para — two prepositions both translated as "for" but with distinct uses in Spanish.',
      },
    ],
  },
  {
    id: 'expresiones',
    sectionId: 'copa',
    title: 'Expresiones',
    subtitle: 'Idioms & Expressions',
    icon: '💬',
    content: [
      {
        heading: 'Coming Soon',
        body: 'This lesson will explore colorful Spanish idioms, their literal translations, and how to use them naturally in conversation.',
      },
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
