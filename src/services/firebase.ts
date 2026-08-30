import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Points the app at the local Firebase Emulator Suite instead of a live
// project. Used for development/testing; never set in production.
let emulatorsConnected = false;
if (process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && !emulatorsConnected) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  emulatorsConnected = true;
}

// The invite code a would-be teacher must enter to create a teacher account.
// This is a lightweight gate (not a security boundary) to keep learners from
// accidentally landing in the teacher sign-up flow -- Firestore security
// rules are what actually restrict teacher-only writes.
export const TEACHER_INVITE_CODE = process.env.EXPO_PUBLIC_TEACHER_INVITE_CODE ?? 'REVIEWBUDDY-TEACHER';

export const LEARNER_EMAIL_DOMAIN = 'learner.reviewbuddy.app';
