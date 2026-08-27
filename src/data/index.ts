import { GradeLevel } from './types';
import { mathQuestions } from './grade1/term1/math';
import { scienceQuestions } from './grade1/term1/science';
import { gmrcQuestions } from './grade1/term1/gmrc';
import { makabansaQuestions } from './grade1/term1/makabansa';
import { readingQuestions } from './grade1/term1/reading';
import { languageQuestions } from './grade1/term1/language';

export const gradeLevels: GradeLevel[] = [
  {
    key: 'grade1',
    title: 'Grade 1',
    terms: [
      {
        key: 'term1',
        title: 'Term 1 - Periodical Exam',
        subjects: [
          {
            key: 'math',
            title: 'Math',
            emoji: '🔢',
            description: 'Numbers, shapes, and basic addition & subtraction',
            questions: mathQuestions,
          },
          {
            key: 'science',
            title: 'Science',
            emoji: '🔬',
            description: 'Our senses, body parts, and living things',
            questions: scienceQuestions,
          },
          {
            key: 'gmrc',
            title: 'GMRC',
            emoji: '🤝',
            description: 'Mabuting asal, paggalang, at pagpapahalaga sa sarili',
            questions: gmrcQuestions,
          },
          {
            key: 'makabansa',
            title: 'Makabansa',
            emoji: '🇵🇭',
            description: 'Pagkilala sa sarili, pamilya, at damdamin',
            questions: makabansaQuestions,
          },
          {
            key: 'reading',
            title: 'Reading & Literacy',
            emoji: '📖',
            description: 'Alphabet, letter sounds, and simple words',
            questions: readingQuestions,
          },
          {
            key: 'language',
            title: 'Language',
            emoji: '🗣️',
            description: 'Naming words, greetings, and simple sentences',
            questions: languageQuestions,
          },
        ],
      },
    ],
  },
];

export function findGrade(gradeKey: string) {
  return gradeLevels.find((g) => g.key === gradeKey);
}

export function findTerm(gradeKey: string, termKey: string) {
  return findGrade(gradeKey)?.terms.find((t) => t.key === termKey);
}

export function findSubject(gradeKey: string, termKey: string, subjectKey: string) {
  return findTerm(gradeKey, termKey)?.subjects.find((s) => s.key === subjectKey);
}
