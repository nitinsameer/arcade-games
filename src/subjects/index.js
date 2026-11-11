/**
 * Subjects Registry
 * Defines 12 subjects with metadata
 * Lesson content is extracted separately
 */

export const SUBJECTS = [
  { id: 'math', name: 'Math', emoji: '🔢', tint: '#ff6b6b', lessons: 5 },
  { id: 'science', name: 'Science', emoji: '🔬', tint: '#339af0', lessons: 5 },
  { id: 'reading', name: 'Reading', emoji: '📖', tint: '#f06595', lessons: 5 },
  { id: 'art', name: 'Art', emoji: '🎨', tint: '#ee5a6f', lessons: 5 },
  { id: 'music', name: 'Music', emoji: '🎵', tint: '#a8e6cf', lessons: 5 },
  { id: 'puzzle', name: 'Puzzle', emoji: '🧩', tint: '#ffd93d', lessons: 5 },
  { id: 'animals', name: 'Animals', emoji: '🦁', tint: '#ffa06b', lessons: 5 },
  { id: 'space', name: 'Space', emoji: '🚀', tint: '#6bcf7f', lessons: 5 },
  { id: 'world', name: 'World', emoji: '🌍', tint: '#4a90e2', lessons: 5 },
  { id: 'hindi', name: 'हिंदी', emoji: '🔡', tint: '#9b59b6', lessons: 5 },
  { id: 'health', name: 'Health', emoji: '❤️', tint: '#e74c3c', lessons: 5 },
  { id: 'money', name: 'Money', emoji: '💰', tint: '#16a085', lessons: 5 }
];

export function getSubject(id) {
  return SUBJECTS.find(s => s.id === id);
}

export function getSubjects() {
  return SUBJECTS;
}

export default { SUBJECTS, getSubject, getSubjects };
