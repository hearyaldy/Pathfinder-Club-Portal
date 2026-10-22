import { AttendanceStatus, ClubEvent } from '../types/club';

export const ATTENDANCE_SCORE = 10;

export const MEMBER_UNIFORM_ITEMS = [
  { key: 'topsPass', label: 'Tops (Polo)' },
  { key: 'pantsPass', label: 'Pants' },
  { key: 'beltPass', label: 'Belt' },
  { key: 'socksPass', label: 'Socks' },
  { key: 'shoesPass', label: 'Shoes' },
  { key: 'neckerchiefPass', label: 'Neckerchief' },
  { key: 'sliderPass', label: 'Slider' },
  { key: 'capCordSashPatchesPass', label: 'Cap/Cord/Sash/Patches' },
] as const;

export type UniformItemKey = (typeof MEMBER_UNIFORM_ITEMS)[number]['key'];
export type UniformTicks = Record<UniformItemKey, boolean>;

export function isInvestitureEvent(eventType: ClubEvent['type']): boolean {
  return eventType === 'Investiture';
}

// Full mark stays 70 for every event type except Investiture, which is 80 —
// unchanged from the previous rubric's totals.
export function getMemberMaxScore(eventType: ClubEvent['type']): number {
  return isInvestitureEvent(eventType) ? 80 : 70;
}

export interface MemberScoreResult {
  attendanceScore: number;
  totalScore: number;
  maxScore: number;
}

// The 8 uniform items evenly split whatever's left after Attendance's fixed
// 10 points (60/8 = 7.5 for a 70-point event, 70/8 = 8.75 for Investiture).
export function calculateMemberScore(
  eventType: ClubEvent['type'],
  attendanceStatus: AttendanceStatus | undefined,
  ticks: UniformTicks
): MemberScoreResult {
  for (const { key } of MEMBER_UNIFORM_ITEMS) {
    if (typeof ticks[key] !== 'boolean') {
      throw new Error(`"${key}" must be ticked or unticked.`);
    }
  }
  const maxScore = getMemberMaxScore(eventType);
  const perItemValue = (maxScore - ATTENDANCE_SCORE) / MEMBER_UNIFORM_ITEMS.length;
  const attendanceScore = attendanceStatus === 'Present' || attendanceStatus === 'Late' ? ATTENDANCE_SCORE : 0;
  const uniformScore = MEMBER_UNIFORM_ITEMS.reduce((sum, item) => sum + (ticks[item.key] ? perItemValue : 0), 0);
  return { attendanceScore, totalScore: attendanceScore + uniformScore, maxScore };
}

export const DRILL_COMMANDS = [
  { key: 'fallIn', label: 'Fall In' },
  { key: 'coverDressRightDress', label: 'Cover / Dress Right Dress' },
  { key: 'recoverReadyFront', label: 'Recover / Ready Front' },
  { key: 'paradeRest', label: 'Parade Rest' },
  { key: 'countOff', label: 'Count Off' },
  { key: 'attention', label: 'Attention' },
  { key: 'leftRightFace', label: 'Left Face / Right Face' },
  { key: 'aboutFace', label: 'About Face' },
  { key: 'markTimeMarch', label: 'Mark Time March' },
  { key: 'forwardMarch', label: 'Forward March' },
  { key: 'readyHalt', label: 'Ready Halt' },
  { key: 'presentArms', label: 'Present Arms' },
  { key: 'orderArms', label: 'Order Arms' },
  { key: 'dismiss', label: 'Dismiss' },
] as const;

export type DrillCommandKey = (typeof DRILL_COMMANDS)[number]['key'];
export type DrillCommandScores = Record<DrillCommandKey, number>;

export const MAX_COMMAND_SCORE = 10;
export const DRILL_MAX_SCORE = DRILL_COMMANDS.length * MAX_COMMAND_SCORE; // 140

export interface DrillScoreResult {
  commandSubtotal: number;
  totalScore: number;
  maxScore: number;
}

// Each command is the evaluator's own 0-10 judgment call (not a tick). The two
// demerit fields are raw points the evaluator deducts directly — no cap on
// how many points a demerit can cost, the total just floors at 0.
export function calculateDrillScore(
  commandScores: DrillCommandScores,
  demeritUnitCaptain: number,
  demeritMembers: number
): DrillScoreResult {
  for (const { key, label } of DRILL_COMMANDS) {
    const value = commandScores[key];
    if (!Number.isInteger(value) || value < 0 || value > MAX_COMMAND_SCORE) {
      throw new Error(`"${label}" must be a whole number between 0 and ${MAX_COMMAND_SCORE}.`);
    }
  }
  for (const [label, value] of [['Demerit (Unit Captain)', demeritUnitCaptain], ['Demerit (Members)', demeritMembers]] as const) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`"${label}" must be a number of 0 or more.`);
    }
  }
  const commandSubtotal = DRILL_COMMANDS.reduce((sum, cmd) => sum + commandScores[cmd.key], 0);
  const totalScore = Math.max(0, commandSubtotal - demeritUnitCaptain - demeritMembers);
  return { commandSubtotal, totalScore, maxScore: DRILL_MAX_SCORE };
}
