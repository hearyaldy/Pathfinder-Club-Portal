import { ClubEvent } from '../types/club';

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
