import { AttendanceStatus, ClubEvent } from '../types/club';

export interface EvaluationScores {
  marchingDrillScore: number;
  uniformScore: number;
  disciplineScore: number;
  investitureBonusScore?: number;
}

export const SCORE_CATEGORY_MAX = {
  ATTENDANCE: 10,
  MARCHING_DRILL: 20,
  UNIFORM: 20,
  DISCIPLINE: 20,
  INVESTITURE_BONUS: 10,
} as const;

export function isInvestitureEvent(eventType: ClubEvent['type']): boolean {
  return eventType === 'Investiture';
}

// Regular events: Attendance(10) + Drill(20) + Uniform(20) + Discipline(20) = 70.
// Investiture events add a 10-point "Investiture Readiness" bonus category = 80.
export function getMaxScoreForEvent(eventType: ClubEvent['type']): number {
  const base = SCORE_CATEGORY_MAX.ATTENDANCE + SCORE_CATEGORY_MAX.MARCHING_DRILL + SCORE_CATEGORY_MAX.UNIFORM + SCORE_CATEGORY_MAX.DISCIPLINE;
  return isInvestitureEvent(eventType) ? base + SCORE_CATEGORY_MAX.INVESTITURE_BONUS : base;
}

export function calculateScore(eventType: ClubEvent['type'], status: AttendanceStatus | undefined, scores: EvaluationScores) {
  const categories = [
    [scores.marchingDrillScore, 20, 'Marching / drill'],
    [scores.uniformScore, 20, 'Uniform'],
    [scores.disciplineScore, 20, 'Discipline'],
    [scores.investitureBonusScore ?? 0, 10, 'Investiture bonus'],
  ] as const;
  for (const [value, maximum, label] of categories) {
    if (!Number.isInteger(value) || value < 0 || value > maximum) {
      throw new Error(`${label} must be a whole number between 0 and ${maximum}.`);
    }
  }
  const attendanceScore = status === 'Present' || status === 'Late' ? SCORE_CATEGORY_MAX.ATTENDANCE : 0;
  const investitureBonusScore = isInvestitureEvent(eventType) ? (scores.investitureBonusScore ?? 0) : undefined;
  return {
    attendanceScore, investitureBonusScore,
    maxScore: getMaxScoreForEvent(eventType),
    totalScore: attendanceScore + scores.marchingDrillScore + scores.uniformScore + scores.disciplineScore + (investitureBonusScore ?? 0),
  };
}
