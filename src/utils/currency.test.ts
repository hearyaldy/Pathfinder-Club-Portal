import assert from 'node:assert/strict';
import test from 'node:test';
import { INITIAL_CLUBS, INITIAL_MEMBERS, INITIAL_ORGANIZATIONS, INITIAL_UNITS } from '../data/seedData.ts';
import { branchClub, CURRENCIES, currencyStep, formatClubDues, formatMemberDues, formatMoney } from './currency.ts';

const org = { ...INITIAL_ORGANIZATIONS[0], annualDuesAmount: 100, currency: 'THB' as const };
const club = { ...INITIAL_CLUBS[0], annualDues: 42.5, currency: 'MYR' as const };
const member = { ...INITIAL_MEMBERS[0], clubId: club.id };

test('all supported currencies format large fees and include an unambiguous code', () => {
  for (const { code } of CURRENCIES) {
    assert.ok(formatMoney(2500000, code).includes(code));
    assert.match(formatMoney(2500000, code), /2,500,000/);
  }
  assert.match(formatMoney(42.5, 'MYR'), /MYR\s+42\.50/);
  assert.match(formatMoney(500000, 'VND'), /VND\s+500,000$/);
  assert.equal(currencyStep('VND'), '1');
  assert.equal(currencyStep('THB'), '0.01');
});

test('legacy clubs retain USD even after the church currency changes', () => {
  assert.equal(formatClubDues(INITIAL_CLUBS[0], org), formatMoney(INITIAL_CLUBS[0].annualDues, 'USD'));
  assert.equal(formatMoney(35), formatMoney(35, 'USD'));
});

test('member dues use their assigned club currency and amount rather than the church default', () => {
  assert.equal(formatMemberDues(member, org, [club], INITIAL_UNITS), formatMoney(42.5, 'MYR'));
  const legacyMember = { ...member, clubId: undefined, unitId: INITIAL_UNITS[0].id };
  assert.equal(formatMemberDues(legacyMember, org, [club], INITIAL_UNITS), formatMoney(42.5, 'MYR'));
  assert.equal(formatClubDues({ ...club, annualDues: 0 }, org), formatMoney(0, 'MYR'));
});

test('unassigned members and foreign church assignments fall back to church fees', () => {
  assert.equal(formatMemberDues({ ...member, clubId: undefined, unitId: undefined }, org, [club], []), formatMoney(100, 'THB'));
  assert.equal(formatMemberDues(member, org, [{ ...club, orgId: 'other-church' }], []), formatMoney(100, 'THB'));
});

test('branch fee selection honors the selected club and avoids guessing between multiple clubs', () => {
  const other = { ...club, id: 'another-club', annualDues: 75 };
  assert.equal(branchClub('Pathfinders', [club, other], other), other);
  assert.equal(branchClub('Pathfinders', [club]), club);
  assert.equal(branchClub('Pathfinders', [club, other]), undefined);
  assert.equal(branchClub('Adventurers', [club]), undefined);
});
