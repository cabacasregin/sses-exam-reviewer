import { GradeLevel } from './types';
import { mathQuestionSets } from './grade1/term1/math';
import { scienceQuestionSets } from './grade1/term1/science';
import { gmrcQuestionSets } from './grade1/term1/gmrc';
import { makabansaQuestionSets } from './grade1/term1/makabansa';
import { readingQuestionSets } from './grade1/term1/reading';
import { languageQuestionSets } from './grade1/term1/language';

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
            questionSets: mathQuestionSets,
          },
          {
            key: 'science',
            title: 'Science',
            emoji: '🔬',
            description: 'Our senses, body parts, and living things',
            questionSets: scienceQuestionSets,
          },
          {
            key: 'gmrc',
            title: 'GMRC',
            emoji: '🤝',
            description: 'Mabuting asal, paggalang, at pagpapahalaga sa sarili',
            questionSets: gmrcQuestionSets,
          },
          {
            key: 'makabansa',
            title: 'Makabansa',
            emoji: '🇵🇭',
            description: 'Ang bawat tao ay natatangi',
            questionSets: makabansaQuestionSets,
          },
          {
            key: 'reading',
            title: 'Reading & Literacy',
            emoji: '📖',
            description: 'Alphabet, letter sounds, and simple words',
            questionSets: readingQuestionSets,
          },
          {
            key: 'language',
            title: 'Language',
            emoji: '🗣️',
            description: 'Naming words, greetings, and simple sentences',
            questionSets: languageQuestionSets,
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
