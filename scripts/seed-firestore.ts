/**
 * Seeds Firestore with the app's built-in question bank and bootstraps the
 * first teacher account, using the same client SDK the app itself uses (no
 * service-account key required). Safe to re-run: every write is an upsert.
 *
 * Usage (against the local emulator):
 *   EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true \
 *   EXPO_PUBLIC_FIREBASE_PROJECT_ID=demo-review-buddy \
 *   SEED_TEACHER_EMAIL=teacher@example.com \
 *   SEED_TEACHER_PASSWORD=changeme123 \
 *   npx tsx scripts/seed-firestore.ts
 *
 * Usage against a real Firebase project: set the EXPO_PUBLIC_FIREBASE_*
 * variables from the Firebase console (Project settings > General > Your
 * apps), drop EXPO_PUBLIC_USE_FIREBASE_EMULATOR, and run the same command.
 */
import { doc, setDoc } from 'firebase/firestore';
import { gradeLevels } from '../src/data';
import { db } from '../src/services/firebase';
import { signInTeacher, signUpTeacher } from '../src/services/auth';
import { QuestionDoc, SetDoc, setIdOf, subjectPathOf } from '../src/services/types';

const SEED_TEACHER_EMAIL = process.env.SEED_TEACHER_EMAIL ?? 'teacher@reviewbuddy.app';
const SEED_TEACHER_PASSWORD = process.env.SEED_TEACHER_PASSWORD ?? 'changeme123';
const SEED_TEACHER_NAME = process.env.SEED_TEACHER_NAME ?? 'Teacher';
const INVITE_CODE = process.env.EXPO_PUBLIC_TEACHER_INVITE_CODE ?? 'REVIEWBUDDY-TEACHER';

async function ensureSeedTeacher(): Promise<string> {
  try {
    await signUpTeacher(SEED_TEACHER_NAME, SEED_TEACHER_EMAIL, SEED_TEACHER_PASSWORD, INVITE_CODE);
    console.log(`Created teacher account ${SEED_TEACHER_EMAIL}`);
  } catch {
    await signInTeacher(SEED_TEACHER_EMAIL, SEED_TEACHER_PASSWORD);
    console.log(`Signed in as existing teacher ${SEED_TEACHER_EMAIL}`);
  }
  return SEED_TEACHER_EMAIL;
}

async function seedContent(updatedBy: string) {
  let setCount = 0;
  let questionCount = 0;

  for (const grade of gradeLevels) {
    for (const term of grade.terms) {
      for (const subject of term.subjects) {
        for (const [setIndex, set] of subject.questionSets.entries()) {
          const subjectPath = subjectPathOf(grade.key, term.key, subject.key);
          const setId = setIdOf(grade.key, term.key, subject.key, set.key);

          const setDocData: SetDoc = {
            id: setId,
            gradeKey: grade.key,
            termKey: term.key,
            subjectKey: subject.key,
            key: set.key,
            subjectPath,
            title: set.title,
            order: setIndex + 1,
            questionCount: set.questions.length,
            status: 'approved',
            updatedAt: Date.now(),
            updatedBy,
          };
          await setDoc(doc(db, 'sets', setId), setDocData);
          setCount++;

          for (const [qIndex, question] of set.questions.entries()) {
            const questionDoc: QuestionDoc = {
              id: question.id,
              gradeKey: grade.key,
              termKey: term.key,
              subjectKey: subject.key,
              setKey: set.key,
              setId,
              subjectPath,
              order: qIndex + 1,
              question: question.question,
              options: question.options,
              correctIndex: question.correctIndex,
              explanation: question.explanation,
              status: 'approved',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              updatedBy,
            };
            await setDoc(doc(db, 'questions', question.id), questionDoc);
            questionCount++;
          }
        }
      }
    }
  }

  console.log(`Seeded ${setCount} sets and ${questionCount} questions.`);
}

async function main() {
  const updatedBy = await ensureSeedTeacher();
  await seedContent(updatedBy);
  console.log('Done.');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
