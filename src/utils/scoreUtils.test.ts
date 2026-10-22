import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMemberScore, calculateDrillScore, MEMBER_UNIFORM_ITEMS, DRILL_COMMANDS, UniformTicks } from './scoreUtils';

const allTicked: UniformTicks = Object.fromEntries(MEMBER_UNIFORM_ITEMS.map(item => [item.key, true])) as UniformTicks;
const noneTicked: UniformTicks = Object.fromEntries(MEMBER_UNIFORM_ITEMS.map(item => [item.key, false])) as UniformTicks;

test('member score totals 70 for a regular event and 80 for Investiture when everything is ticked and present', () => {
  assert.equal(calculateMemberScore('Regular Meeting', 'Present', allTicked).totalScore, 70);
  assert.equal(calculateMemberScore('Regular Meeting', 'Present', allTicked).maxScore, 70);
  assert.equal(calculateMemberScore('Investiture', 'Present', allTicked).totalScore, 80);
  assert.equal(calculateMemberScore('Investiture', 'Present', allTicked).maxScore, 80);
});

test('attendance only counts for Present/Late, and unticked uniform items score 0', () => {
  for (const status of ['Present', 'Late'] as const) {
    assert.equal(calculateMemberScore('Campout', status, noneTicked).attendanceScore, 10);
  }
  for (const status of ['Excused', 'Absent', undefined] as const) {
    assert.equal(calculateMemberScore('Campout', status, noneTicked).attendanceScore, 0);
  }
  assert.equal(calculateMemberScore('Regular Meeting', 'Absent', noneTicked).totalScore, 0);
});

test('a single uniform item is worth 7.5 at a regular event and 8.75 at Investiture', () => {
  const oneTicked = { ...noneTicked, [MEMBER_UNIFORM_ITEMS[0].key]: true };
  assert.equal(calculateMemberScore('Regular Meeting', 'Absent', oneTicked).totalScore, 7.5);
  assert.equal(calculateMemberScore('Investiture', 'Absent', oneTicked).totalScore, 8.75);
});

test('calculateMemberScore rejects a missing or non-boolean tick', () => {
  const missingKey = { ...allTicked } as Partial<UniformTicks>;
  delete missingKey[MEMBER_UNIFORM_ITEMS[0].key];
  assert.throws(() => calculateMemberScore('Regular Meeting', 'Present', missingKey as UniformTicks));
});

const perfectCommands = Object.fromEntries(DRILL_COMMANDS.map(cmd => [cmd.key, 10])) as Record<string, number>;

test('a perfect drill sheet with no demerits totals 140', () => {
  const result = calculateDrillScore(perfectCommands as never, 0, 0);
  assert.equal(result.commandSubtotal, 140);
  assert.equal(result.totalScore, 140);
  assert.equal(result.maxScore, 140);
});

test('demerits subtract directly and the total floors at 0', () => {
  assert.equal(calculateDrillScore(perfectCommands as never, 50, 0).totalScore, 90);
  assert.equal(calculateDrillScore(perfectCommands as never, 0, 60).totalScore, 80);
  assert.equal(calculateDrillScore(perfectCommands as never, 1000, 1000).totalScore, 0);
});

test('calculateDrillScore rejects out-of-range, fractional, or negative inputs', () => {
  assert.throws(() => calculateDrillScore({ ...perfectCommands, fallIn: 11 } as never, 0, 0));
  assert.throws(() => calculateDrillScore({ ...perfectCommands, fallIn: -1 } as never, 0, 0));
  assert.throws(() => calculateDrillScore({ ...perfectCommands, fallIn: 5.5 } as never, 0, 0));
  assert.throws(() => calculateDrillScore(perfectCommands as never, -1, 0));
  assert.throws(() => calculateDrillScore(perfectCommands as never, 0, Number.NaN));
});
