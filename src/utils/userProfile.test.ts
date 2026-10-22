import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuthUser } from '../types/club';
import { INITIAL_ORGANIZATIONS } from '../data/seedData.ts';
import { assertCanDeleteUser, userProfileUpdate } from './userProfile.ts';

const admin: AuthUser = { id: 'admin', name: 'Admin', email: 'admin@example.com', orgId: 'org-grace', role: 'Super Admin' };
const user: AuthUser = { ...admin, id: 'director', name: 'Director', email: 'director@example.com', role: 'Club Director' };
const accounts = [admin, user];
const check = (actor: AuthUser | null, target: AuthUser, changes: Partial<AuthUser>, users = accounts) => userProfileUpdate(actor, target, changes, users, INITIAL_ORGANIZATIONS);

test('signed-in users can update their own name and phone with whitespace trimmed', () => {
  assert.deepEqual(check(user, user, { name: ' New Name ', phone: ' +60 12 345 6789 ' }), { name: 'New Name', phone: '+60 12 345 6789' });
  assert.deepEqual(check(user, user, { phone: '' }), { phone: '' });
});

test('self-service cannot edit other users or access fields', () => {
  for (const changes of [{ role: 'Super Admin' }, { orgId: 'org-berean' }, { investedMasterGuide: true }, { email: 'other@example.com' }, { id: 'other' }] as Partial<AuthUser>[]) {
    assert.throws(() => check(user, user, changes), { code: 'permission-denied' });
  }
  assert.throws(() => check(user, admin, { name: 'Changed' }), { code: 'permission-denied' });
  assert.throws(() => check(null, user, { name: 'Changed' }), { code: 'permission-denied' });
});

test('admins can edit personal information, assignments, roles, and leadership status', () => {
  assert.deepEqual(check(admin, user, { name: 'Updated', phone: '123', role: 'Unit Counselor', orgId: 'org-berean', investedMasterGuide: true }), { name: 'Updated', phone: '123', role: 'Unit Counselor', orgId: 'org-berean', investedMasterGuide: true });
  assert.throws(() => check(admin, user, { email: 'new@example.com' }), { code: 'permission-denied' });
});

test('invalid profile details are rejected before writing', () => {
  for (const changes of [{ name: '   ' }, { orgId: 'missing' }, { role: 'Invalid' }, { phone: 12 }, { investedMasterGuide: 'yes' }] as unknown as Partial<AuthUser>[]) {
    assert.throws(() => check(admin, user, changes), { code: 'invalid-user' });
  }
});

test('the last Super Admin cannot be demoted or deleted, including by another account', () => {
  assert.throws(() => check(admin, admin, { role: 'Club Director' }), { code: 'last-admin' });
  assert.throws(() => assertCanDeleteUser(admin, admin, accounts), { code: 'last-admin' });
  const anotherAdmin = { ...admin, id: 'admin-2' };
  const users = [...accounts, anotherAdmin];
  assert.equal(check(admin, admin, { role: 'Club Director' }, users).role, 'Club Director');
  assert.doesNotThrow(() => assertCanDeleteUser(anotherAdmin, admin, users));
  assert.throws(() => assertCanDeleteUser(user, admin, users), { code: 'permission-denied' });
});
