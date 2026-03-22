export type Phrase = {
  id: string;
  english: string;
  spanish: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
};

export const phrases: Phrase[] = [
  // ── Beginner: Greetings ──
  { id: 'b1', english: 'Hello, how are you?', spanish: 'Hola, ¿cómo estás?', difficulty: 'beginner', category: 'greetings' },
  { id: 'b2', english: 'Good morning', spanish: 'Buenos días', difficulty: 'beginner', category: 'greetings' },
  { id: 'b3', english: 'Good night', spanish: 'Buenas noches', difficulty: 'beginner', category: 'greetings' },
  { id: 'b4', english: 'See you later', spanish: 'Hasta luego', difficulty: 'beginner', category: 'greetings' },
  { id: 'b5', english: 'Nice to meet you', spanish: 'Mucho gusto', difficulty: 'beginner', category: 'greetings' },

  // ── Beginner: Essentials ──
  { id: 'b6', english: 'Please', spanish: 'Por favor', difficulty: 'beginner', category: 'essentials' },
  { id: 'b7', english: 'Thank you very much', spanish: 'Muchas gracias', difficulty: 'beginner', category: 'essentials' },
  { id: 'b8', english: 'Excuse me', spanish: 'Disculpe', difficulty: 'beginner', category: 'essentials' },
  { id: 'b9', english: 'Yes, of course', spanish: 'Sí, claro', difficulty: 'beginner', category: 'essentials' },
  { id: 'b10', english: 'I don\'t understand', spanish: 'No entiendo', difficulty: 'beginner', category: 'essentials' },

  // ── Intermediate: Conversation ──
  { id: 'i1', english: 'Where are you from?', spanish: '¿De dónde eres?', difficulty: 'intermediate', category: 'conversation' },
  { id: 'i2', english: 'What do you do for a living?', spanish: '¿A qué te dedicas?', difficulty: 'intermediate', category: 'conversation' },
  { id: 'i3', english: 'I would like a coffee', spanish: 'Me gustaría un café', difficulty: 'intermediate', category: 'food' },
  { id: 'i4', english: 'How much does it cost?', spanish: '¿Cuánto cuesta?', difficulty: 'intermediate', category: 'shopping' },
  { id: 'i5', english: 'Where is the bathroom?', spanish: '¿Dónde está el baño?', difficulty: 'intermediate', category: 'directions' },
  { id: 'i6', english: 'I agree with you', spanish: 'Estoy de acuerdo contigo', difficulty: 'intermediate', category: 'conversation' },
  { id: 'i7', english: 'Can you repeat that?', spanish: '¿Puedes repetir eso?', difficulty: 'intermediate', category: 'conversation' },
  { id: 'i8', english: 'I need help', spanish: 'Necesito ayuda', difficulty: 'intermediate', category: 'essentials' },
  { id: 'i9', english: 'What time is it?', spanish: '¿Qué hora es?', difficulty: 'intermediate', category: 'time' },
  { id: 'i10', english: 'I like this a lot', spanish: 'Me gusta mucho esto', difficulty: 'intermediate', category: 'conversation' },

  // ── Advanced: Complex ──
  { id: 'a1', english: 'I would have gone if I had known', spanish: 'Habría ido si hubiera sabido', difficulty: 'advanced', category: 'subjunctive' },
  { id: 'a2', english: 'It\'s important that you study', spanish: 'Es importante que estudies', difficulty: 'advanced', category: 'subjunctive' },
  { id: 'a3', english: 'I\'ve been waiting for an hour', spanish: 'Llevo una hora esperando', difficulty: 'advanced', category: 'tenses' },
  { id: 'a4', english: 'If I were you, I would leave', spanish: 'Si yo fuera tú, me iría', difficulty: 'advanced', category: 'subjunctive' },
  { id: 'a5', english: 'He told me that he had already finished', spanish: 'Me dijo que ya había terminado', difficulty: 'advanced', category: 'tenses' },
  { id: 'a6', english: 'As soon as I arrive, I\'ll call you', spanish: 'En cuanto llegue, te llamo', difficulty: 'advanced', category: 'subjunctive' },
  { id: 'a7', english: 'I doubt he will come', spanish: 'Dudo que él venga', difficulty: 'advanced', category: 'subjunctive' },
  { id: 'a8', english: 'Despite being tired, I kept going', spanish: 'A pesar de estar cansado, seguí adelante', difficulty: 'advanced', category: 'complex' },
  { id: 'a9', english: 'The more I practice, the better I get', spanish: 'Cuanto más practico, mejor me va', difficulty: 'advanced', category: 'complex' },
  { id: 'a10', english: 'I wish I could speak fluently', spanish: 'Ojalá pudiera hablar con fluidez', difficulty: 'advanced', category: 'subjunctive' },
];

export function getPhrasesByDifficulty(difficulty: Phrase['difficulty']): Phrase[] {
  return phrases.filter((p) => p.difficulty === difficulty);
}

export type GameColor = {
  name: string;
  english: string;
  hex: string;
};

export const GAME_COLORS: GameColor[] = [
  { name: 'rojo', english: 'red', hex: '#E74C3C' },
  { name: 'azul', english: 'blue', hex: '#3498DB' },
  { name: 'verde', english: 'green', hex: '#27AE60' },
  { name: 'amarillo', english: 'yellow', hex: '#F1C40F' },
  { name: 'naranja', english: 'orange', hex: '#E67E22' },
  { name: 'morado', english: 'purple', hex: '#8E44AD' },
  { name: 'rosa', english: 'pink', hex: '#E91E8B' },
  { name: 'blanco', english: 'white', hex: '#ECF0F1' },
  { name: 'negro', english: 'black', hex: '#2C3E50' },
  { name: 'gris', english: 'gray', hex: '#95A5A6' },
];
