// One-time / re-runnable seed script: pushes the local demo data in
// src/data/seedData.ts into a real Firebase project (Firestore + Auth),
// so the app has something to show once it's wired up to the cloud.
//
// Usage: npm run seed:firebase
// Requires serviceAccountKey.json at the repo root (Firebase Console ->
// Project settings -> Service accounts -> Generate new private key).
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_CLUBS,
  INITIAL_DIVISIONS,
  INITIAL_UNITS,
  INITIAL_MEMBERS,
  INITIAL_EVENTS,
  INITIAL_ATTENDANCE,
  INITIAL_STAFF_USERS,
} from '../src/data/seedData';

const SHARED_TEMP_PASSWORD = 'Pathfinder2026!';

const serviceAccountPath = resolve(process.cwd(), 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

async function seedCollection<T extends { id: string }>(collectionName: string, items: T[]) {
  const batch = db.batch();
  items.forEach((item) => {
    batch.set(db.collection(collectionName).doc(item.id), item);
  });
  await batch.commit();
  console.log(`  ${collectionName}: wrote ${items.length} document(s).`);
}

async function seedAttendance() {
  const batch = db.batch();
  INITIAL_ATTENDANCE.forEach((record) => {
    // The app itself uses a deterministic `${eventId}_${memberId}` doc id
    // (see ClubContext.recordAttendance) so re-checking someone in updates
    // the same record instead of racing a find-or-create. Match that here.
    const id = `${record.eventId}_${record.memberId}`;
    batch.set(db.collection('attendance').doc(id), { ...record, id });
  });
  await batch.commit();
  console.log(`  attendance: wrote ${INITIAL_ATTENDANCE.length} document(s).`);
}

async function seedStaffUsers() {
  const credentials: Array<{ email: string; role: string }> = [];
  for (const staff of INITIAL_STAFF_USERS) {
    let uid: string;
    try {
      const created = await auth.createUser({
        email: staff.email,
        password: SHARED_TEMP_PASSWORD,
        displayName: staff.name,
      });
      uid = created.uid;
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-exists') {
        uid = (await auth.getUserByEmail(staff.email)).uid;
      } else {
        throw err;
      }
    }
    const { id, ...profile } = staff;
    void id; // the Firestore doc id is the Auth uid, not the old local demo id
    await db.collection('users').doc(uid).set(profile);
    credentials.push({ email: staff.email, role: staff.role });
  }
  console.log(`  users: wrote ${INITIAL_STAFF_USERS.length} leader account(s).`);
  return credentials;
}

async function main() {
  console.log('Seeding Firestore...');
  await seedCollection('organizations', INITIAL_ORGANIZATIONS);
  await seedCollection('clubs', INITIAL_CLUBS);
  await seedCollection('divisions', INITIAL_DIVISIONS);
  await seedCollection('units', INITIAL_UNITS);
  await seedCollection('members', INITIAL_MEMBERS);
  await seedCollection('events', INITIAL_EVENTS);
  await seedAttendance();
  const credentials = await seedStaffUsers();

  console.log('\nDone. Leader sign-in credentials (all share one temp password):\n');
  console.log(`  Password: ${SHARED_TEMP_PASSWORD}\n`);
  credentials.forEach((c) => console.log(`  ${c.email}  —  ${c.role}`));
  console.log('\nSign in with any of the emails above from the app\'s "Sign In" tab.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
