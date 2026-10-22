import type { ChurchOrganization, ClubBranch, ClubEntity, ClubUnit, CurrencyCode, Member } from '../types/club';

export const CURRENCIES: ReadonlyArray<{ code: CurrencyCode; name: string }> = [
  { code: 'MYR', name: 'Malaysian Ringgit (RM)' },
  { code: 'THB', name: 'Thai Baht (฿)' },
  { code: 'SGD', name: 'Singapore Dollar (S$)' },
  { code: 'BND', name: 'Brunei Dollar (B$)' },
  { code: 'IDR', name: 'Indonesian Rupiah (Rp)' },
  { code: 'PHP', name: 'Philippine Peso (₱)' },
  { code: 'VND', name: 'Vietnamese Dong (₫)' },
  { code: 'KHR', name: 'Cambodian Riel (៛)' },
  { code: 'LAK', name: 'Lao Kip (₭)' },
  { code: 'MMK', name: 'Myanmar Kyat (K)' },
  { code: 'USD', name: 'US Dollar ($) · Timor-Leste / existing clubs' },
];

export function currencyCode(value?: string): CurrencyCode {
  return CURRENCIES.find(currency => currency.code === value)?.code ?? 'USD';
}

export function formatMoney(amount: number, currency?: string): string {
  return new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode(currency), currencyDisplay: 'code' }).format(amount);
}

export function currencyStep(currency?: string): string {
  const digits = new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode(currency) }).resolvedOptions().maximumFractionDigits;
  return digits === 0 ? '1' : '0.01';
}

export function formatClubDues(club: ClubEntity | undefined, org: ChurchOrganization): string {
  return formatMoney(club?.annualDues ?? org.annualDuesAmount, club ? club.currency : org.currency);
}

export function formatMemberDues(member: Member, org: ChurchOrganization, clubs: ClubEntity[], units: ClubUnit[]): string {
  const unit = units.find(unit => unit.id === member.unitId && unit.orgId === member.orgId);
  const club = clubs.find(club => club.id === (member.clubId || unit?.clubId) && club.orgId === member.orgId);
  return formatClubDues(club, org);
}

export function branchClub(branch: ClubBranch, clubs: ClubEntity[], preferred?: ClubEntity): ClubEntity | undefined {
  const type = branch === 'Pathfinders' ? 'Pathfinder' : branch === 'Adventurers' ? 'Adventurer' : 'Master Guide';
  const candidates = clubs.filter(club => club.clubType === type);
  return candidates.find(club => club.id === preferred?.id) ?? (candidates.length === 1 ? candidates[0] : undefined);
}
