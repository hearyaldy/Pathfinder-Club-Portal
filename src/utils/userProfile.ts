import { USER_ROLES } from '../types/club';
import type { AuthUser, ChurchOrganization } from '../types/club';

function fail(code: string, message: string): never {
  throw Object.assign(new Error(message), { code });
}

export function userProfileUpdate(actor: AuthUser | null, target: AuthUser, updates: Partial<AuthUser>, users: AuthUser[], organizations: ChurchOrganization[]): Partial<AuthUser> {
  const admin = actor?.role === 'Super Admin';
  if (!actor || (!admin && actor.id !== target.id)) fail('permission-denied', 'You do not have permission to edit this user.');
  const allowed = admin ? ['name', 'phone', 'role', 'orgId', 'investedMasterGuide'] : ['name', 'phone'];
  if (Object.keys(updates).some(key => !allowed.includes(key))) fail('permission-denied', 'That account field cannot be changed here.');
  const result: Partial<AuthUser> = {};
  if ('name' in updates) {
    if (typeof updates.name !== 'string' || !updates.name.trim()) fail('invalid-user', 'Enter a display name.');
    result.name = updates.name.trim();
  }
  if ('phone' in updates) {
    if (typeof updates.phone !== 'string') fail('invalid-user', 'Enter a valid phone number.');
    result.phone = updates.phone.trim();
  }
  if ('role' in updates) {
    if (!updates.role || !USER_ROLES.includes(updates.role)) fail('invalid-user', 'Choose a valid role.');
    if (target.role === 'Super Admin' && updates.role !== target.role && users.filter(user => user.role === 'Super Admin').length <= 1) fail('last-admin', 'Promote another Super Admin before changing the last Super Admin’s role.');
    result.role = updates.role;
  }
  if ('orgId' in updates) {
    if (!organizations.some(org => org.id === updates.orgId)) fail('invalid-user', 'Choose an available church.');
    result.orgId = updates.orgId;
  }
  if ('investedMasterGuide' in updates) {
    if (typeof updates.investedMasterGuide !== 'boolean') fail('invalid-user', 'Choose a valid Master Guide status.');
    result.investedMasterGuide = updates.investedMasterGuide;
  }
  return result;
}

export function assertCanDeleteUser(actor: AuthUser | null, target: AuthUser, users: AuthUser[]): void {
  if (actor?.role !== 'Super Admin') fail('permission-denied', 'Only a Super Admin can remove users.');
  if (target.role === 'Super Admin' && users.filter(user => user.role === 'Super Admin').length <= 1) fail('last-admin', 'Promote another Super Admin before removing the last Super Admin.');
}
