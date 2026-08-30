import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, LEARNER_EMAIL_DOMAIN, TEACHER_INVITE_CODE } from './firebase';
import { Role, UserDoc } from './types';

export interface AuthSession {
  user: User;
  role: Role;
  displayName: string;
}

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const PIN_PATTERN = /^\d{6}$/;

function learnerEmailFor(username: string): string {
  return `${username.toLowerCase()}@${LEARNER_EMAIL_DOMAIN}`;
}

function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That username is already taken. Try another one, or log in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'That username/PIN (or email/password) combination is incorrect.';
    case 'auth/weak-password':
      return 'PIN or password is too short.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function validateUsername(username: string): string | null {
  if (!USERNAME_PATTERN.test(username.toLowerCase())) {
    return 'Username must be 3-20 letters, numbers, or underscores.';
  }
  return null;
}

export function validatePin(pin: string): string | null {
  if (!PIN_PATTERN.test(pin)) {
    return 'PIN must be exactly 6 digits.';
  }
  return null;
}

export async function signUpLearner(displayName: string, username: string, pin: string): Promise<void> {
  const usernameError = validateUsername(username);
  if (usernameError) throw new Error(usernameError);
  const pinError = validatePin(pin);
  if (pinError) throw new Error(pinError);

  try {
    const credential = await createUserWithEmailAndPassword(auth, learnerEmailFor(username), pin);
    const userDoc: UserDoc = {
      role: 'learner',
      displayName: displayName.trim(),
      username: username.toLowerCase(),
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'users', credential.user.uid), userDoc);
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }
}

export async function signInLearner(username: string, pin: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, learnerEmailFor(username), pin);
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }
}

export async function signUpTeacher(
  displayName: string,
  email: string,
  password: string,
  inviteCode: string
): Promise<void> {
  if (inviteCode.trim() !== TEACHER_INVITE_CODE) {
    throw new Error('That invite code is not valid. Ask your school administrator for the correct code.');
  }
  try {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const userDoc: UserDoc = {
      role: 'teacher',
      displayName: displayName.trim(),
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'users', credential.user.uid), userDoc);
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }
}

export async function signInTeacher(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function fetchUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export function subscribeAuthSession(callback: (session: AuthSession | null) => void): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }
    try {
      const userDoc = await fetchUserDoc(user.uid);
      callback(userDoc ? { user, role: userDoc.role, displayName: userDoc.displayName } : null);
    } catch (error) {
      console.warn('Failed to load user profile:', error);
      callback(null);
    }
  });
}
