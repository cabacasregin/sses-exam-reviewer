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
            description: 'Numbers to 100, shapes, ordinals, number bonds & addition',
            questionSets: mathQuestionSets,
          },
          {
            key: 'science',
            title: 'Science',
            emoji: '🔬',
            description: 'Matter, states of matter, handling materials & body parts',
            questionSets: scienceQuestionSets,
          },
          {
            key: 'gmrc',
            title: 'GMRC',
            emoji: '🤝',
            description: 'Sarili, pagkakaibigan, pagtitipid, pananampalataya, at karapatan',
            questionSets: gmrcQuestionSets,
          },
          {
            key: 'makabansa',
            title: 'Makabansa',
            emoji: '🇵🇭',
            description: 'Sarili, pangangailangan, kakayahan, karapatan, at paggalang',
            questionSets: makabansaQuestionSets,
          },
          {
            key: 'reading',
            title: 'Reading & Literacy',
            emoji: '📖',
            description: 'Rhyming, syllables, sounds, signs & story details',
            questionSets: readingQuestionSets,
          },
          {
            key: 'language',
            title: 'Language',
            emoji: '🗣️',
            description: 'Family, greetings, word types, volume/pitch & emotions',
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
