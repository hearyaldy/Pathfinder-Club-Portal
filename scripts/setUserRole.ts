// One-off admin utility: force a leader's role directly via the Admin SDK.
// Useful for bootstrapping the very first Super Admin (the in-app Manage
// Users page needs an existing Super Admin to use, so it can't bootstrap
// itself) and otherwise mirrors the Manage Users page.
//
// Usage: npm run set-role -- <email> <role>
// Example: npm run set-role -- heary@hopetv.asia "Super Admin"
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const [email, role] = process.argv.slice(2);
if (!email || !role) {
  console.error('Usage: npm run set-role -- <email> <role>');
  process.exit(1);
}

const serviceAccountPath = resolve(process.cwd(), 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();
const db = getFirestore();

async function main() {
  const user = await auth.getUserByEmail(email);
  const ref = db.collection('users').doc(user.uid);
  const before = await ref.get();
  if (!before.exists) {
    // Auth account exists (e.g. created directly in the Firebase Console)
    // but has no app profile doc yet — create a minimal one.
    await ref.set({
      name: user.displayName || email.split('@')[0],
      email,
      role,
      orgId: 'org-grace',
    });
    console.log(`No profile existed for ${email} — created one.`);
  } else {
    await ref.set({ role }, { merge: true });
  }
  const after = await ref.get();
  console.log(`${email} (${user.uid}):`, after.data());
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
