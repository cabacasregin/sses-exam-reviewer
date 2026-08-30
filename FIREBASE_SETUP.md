# Setting up the Teacher Portal (Firebase)

The Teacher Portal needs a real Firebase project for accounts, content, and
learner progress to be shared across devices. Follow these steps once.

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project (the free "Spark" plan is enough).
2. In **Build > Authentication**, click "Get started" and enable the **Email/Password** sign-in provider.
3. In **Build > Firestore Database**, click "Create database" and start in production mode (the security rules in this repo handle access control).
4. In **Project settings > General > Your apps**, click the web icon (`</>`) to register a web app, then copy the `firebaseConfig` values shown.

## 2. Configure the app

Copy `.env.example` to `.env` and fill in the values from step 1:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_TEACHER_INVITE_CODE=pick-something-private
```

If deploying to Vercel, add the same variables in **Vercel Project Settings > Environment Variables** (they must be set at build time since Expo inlines `EXPO_PUBLIC_*` variables into the web bundle).

## 3. Deploy the security rules

```
npx firebase-tools login
npx firebase-tools use --add   # pick the project you created
npx firebase-tools deploy --only firestore:rules
```

## 4. Seed the question bank and create the first teacher account

This runs against your real project (no `EXPO_PUBLIC_USE_FIREBASE_EMULATOR` flag) using the same values from your `.env`:

```
SEED_TEACHER_EMAIL=you@yourschool.edu \
SEED_TEACHER_PASSWORD=choose-a-strong-password \
SEED_TEACHER_NAME="Your Name" \
npx tsx scripts/seed-firestore.ts
```

This creates one teacher account (or signs into it if it already exists) and uploads all 600 built-in questions across the 6 subjects with `status: approved`. It's safe to re-run.

## 5. Adding more teachers later

Anyone who knows `EXPO_PUBLIC_TEACHER_INVITE_CODE` can create a teacher account from the "I'm a Teacher" > "Sign Up" screen in the app. Rotate that code (and redeploy) if it leaks.

## Local development against the emulator

You don't need a real Firebase project just to develop locally. Run the emulators and point the app at them instead:

```
npx firebase-tools emulators:start --only auth,firestore --project demo-review-buddy

# in another terminal
EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true \
EXPO_PUBLIC_FIREBASE_PROJECT_ID=demo-review-buddy \
EXPO_PUBLIC_FIREBASE_API_KEY=demo-api-key \
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-review-buddy.firebaseapp.com \
SEED_TEACHER_EMAIL=teacher@example.com \
SEED_TEACHER_PASSWORD=changeme123 \
npx tsx scripts/seed-firestore.ts

# then start the app with the same EXPO_PUBLIC_* variables set
```

## Security note

The teacher invite code is a client-side gate, not a hard security boundary — it keeps casual users from landing in the sign-up flow, but a technically determined person could still call Firebase directly. The actual data protection is Firestore's security rules (`firestore.rules`): only accounts with `role: teacher` in their `users` document can write content or read other learners' data, and once an account is created its role can never be changed from the client. For a small school app this is a reasonable trade-off; if you need a hard guarantee, add a Cloud Function that validates the invite code server-side before creating teacher accounts.
