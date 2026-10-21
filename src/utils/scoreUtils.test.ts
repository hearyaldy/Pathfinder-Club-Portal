import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScore } from './scoreUtils';

const maximum = { marchingDrillScore: 20, uniformScore: 20, disciplineScore: 20, investitureBonusScore: 10 };
test('regular events total 70, investiture totals 80, and the bonus applies only to investiture', () => {
  assert.equal(calculateScore('Regular Meeting', 'Present', maximum).totalScore, 70);
  assert.equal(calculateScore('Regular Meeting', 'Present', maximum).investitureBonusScore, undefined);
  assert.equal(calculateScore('Investiture', 'Present', maximum).totalScore, 80);
  assert.equal(calculateScore('Investiture', 'Present', maximum).maxScore, 80);
});
test('Present and Late receive attendance points; Excused, Absent and missing check-ins do not', () => {
  for (const status of ['Present', 'Late'] as const) assert.equal(calculateScore('Campout', status, maximum).totalScore, 70);
  for (const status of ['Excused', 'Absent', undefined] as const) assert.equal(calculateScore('Campout', status, maximum).totalScore, 60);
});
test('each manual category rejects negative, fractional, non-finite and excessive values', () => {
  for (const key of ['marchingDrillScore', 'uniformScore', 'disciplineScore', 'investitureBonusScore'] as const) {
    for (const value of [-1, 0.5, NaN, Infinity, key === 'investitureBonusScore' ? 11 : 21]) {
      assert.throws(() => calculateScore('Investiture', 'Present', { ...maximum, [key]: value }));
    }
  }
  assert.equal(calculateScore('Investiture', 'Absent', { marchingDrillScore: 0, uniformScore: 0, disciplineScore: 0 }).totalScore, 0);
});
