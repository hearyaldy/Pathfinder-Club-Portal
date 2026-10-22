import type { ChurchOrganization } from '../types/club';

const normalize = (value: string) => value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();

export function districtOptions(organizations: ChurchOrganization[], missionName: string): string[] {
  const names = new Map<string, string>();
  organizations.filter(org => normalize(org.missionName) === normalize(missionName)).forEach(org => {
    const name = org.districtName.trim().replace(/\s+/g, ' ');
    if (name) names.set(normalize(name), name);
  });
  return [...names.values()].sort((a, b) => a.localeCompare(b));
}

export function resolveDistrict(name: string, missionName: string, organizations: ChurchOrganization[]): Pick<ChurchOrganization, 'districtId' | 'districtName'> {
  const districtName = name.trim().replace(/\s+/g, ' ');
  if (!districtName) throw new Error('Enter a district name.');
  const existing = organizations.find(org => org.districtId && normalize(org.missionName) === normalize(missionName) && normalize(org.districtName) === normalize(districtName));
  return existing
    ? { districtId: existing.districtId, districtName: existing.districtName }
    : { districtId: `district:${encodeURIComponent(normalize(missionName))}:${encodeURIComponent(normalize(districtName))}`, districtName };
}
