import assert from 'node:assert/strict';
import test from 'node:test';
import { INITIAL_ORGANIZATIONS } from '../data/seedData.ts';
import { districtOptions, resolveDistrict } from './district.ts';

const mission = INITIAL_ORGANIZATIONS[0].missionName;

test('existing district selections reuse their real ID instead of always using dist-4', () => {
  assert.deepEqual(resolveDistrict('District 2 (Valley East)', mission, INITIAL_ORGANIZATIONS), {
    districtId: 'dist-2', districtName: 'District 2 (Valley East)',
  });
  assert.equal(resolveDistrict('  district  2 (VALLEY EAST) ', mission, INITIAL_ORGANIZATIONS).districtId, 'dist-2');
});

test('new districts have stable IDs, including names in local scripts', () => {
  for (const name of ['Sabah East', 'กรุงเทพมหานคร', 'Distrito de Díli']) {
    const first = resolveDistrict(name, mission, INITIAL_ORGANIZATIONS);
    const repeat = resolveDistrict(` ${name} `, mission, []);
    assert.equal(first.districtId, repeat.districtId);
    assert.notEqual(first.districtId, 'dist-4');
    assert.equal(first.districtName, name);
  }
  assert.equal(resolveDistrict('SABAH  EAST', mission, []).districtId, resolveDistrict('Sabah East', mission, []).districtId);
});

test('the same district name in another mission remains separate', () => {
  const local = resolveDistrict('District 2 (Valley East)', 'Sabah Mission', INITIAL_ORGANIZATIONS);
  assert.notEqual(local.districtId, 'dist-2');
  assert.notEqual(resolveDistrict('Sabah East', mission, []).districtId, resolveDistrict('Sabah East', 'Sabah Mission', []).districtId);
});

test('suggestions come from existing churches and include newly saved districts', () => {
  const district = resolveDistrict('Sabah East', mission, []);
  const organizations = [...INITIAL_ORGANIZATIONS, { ...INITIAL_ORGANIZATIONS[0], id: 'new-church', ...district }];
  assert.deepEqual(districtOptions(organizations, mission), ['District 2 (Valley East)', 'District 4 (Cascade Metro)', 'Sabah East']);
  assert.equal(resolveDistrict('Sabah East', mission, organizations).districtId, district.districtId);
  assert.deepEqual(districtOptions(organizations, 'Another Mission'), []);
});

test('blank district names are rejected', () => {
  assert.throws(() => resolveDistrict('   ', mission, INITIAL_ORGANIZATIONS), /district name/);
});
