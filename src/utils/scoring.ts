// E.Q.U.I.P. 360 Scoring System
import type {
  ScoreArray,
  ScoreBreakdown,
  AssessmentResponse,
  LeadershipFamilyCode,
  LeadershipTypeCode,
} from '@/types';

// Maximum score per metric per scenario
const MAX_SCORE_PER_METRIC = 4;

// Number of scenarios
const TOTAL_SCENARIOS = 20;

// Calculate aggregated scores from all responses
export function calculateScoreBreakdown(responses: AssessmentResponse[]): ScoreBreakdown {
  // Initialize totals
  const totals: ScoreArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Sum all scores
  responses.forEach((response) => {
    response.scores.forEach((score, index) => {
      totals[index] += score;
    });
  });

  // Calculate max possible scores
  const maxPerMetric = MAX_SCORE_PER_METRIC * TOTAL_SCENARIOS;
  const maxEQ = maxPerMetric * 5; // 5 EQ pillars
  const maxBED = maxPerMetric * 3; // 3 BED factors
  const maxCulture = maxPerMetric * 5; // 5 Culture dimensions
  const maxOverall = maxPerMetric * 13; // All 13 metrics

  // EQ Scores (indices 0-4)
  const eqScores = {
    SA: totals[0],
    SR: totals[1],
    M: totals[2],
    E: totals[3],
    SS: totals[4],
    total: totals[0] + totals[1] + totals[2] + totals[3] + totals[4],
    percentage: 0,
  };
  eqScores.percentage = Math.round((eqScores.total / maxEQ) * 100);

  // B.E.D. Scores (indices 5-7)
  const bedScores = {
    B: totals[5],
    EX: totals[6],
    D: totals[7],
    total: totals[5] + totals[6] + totals[7],
    percentage: 0,
  };
  bedScores.percentage = Math.round((bedScores.total / maxBED) * 100);

  // Culture Scores (indices 8-12)
  const cultureScores = {
    T: totals[8],
    PS: totals[9],
    CQ: totals[10],
    TS: totals[11],
    ER: totals[12],
    total: totals[8] + totals[9] + totals[10] + totals[11] + totals[12],
    percentage: 0,
  };
  cultureScores.percentage = Math.round((cultureScores.total / maxCulture) * 100);

  // Overall
  const overallTotal = eqScores.total + bedScores.total + cultureScores.total;

  return {
    eq: eqScores,
    bed: bedScores,
    culture: cultureScores,
    overall: {
      total: overallTotal,
      percentage: Math.round((overallTotal / maxOverall) * 100),
      maxPossible: maxOverall,
    },
  };
}

// Determine Leadership Family based on score patterns
export function determineLeadershipFamily(scores: ScoreBreakdown): LeadershipFamilyCode {
  // Calculate dominant traits
  const regulationScore = scores.eq.SR + scores.eq.SA; // Self-Regulation + Awareness
  const connectionScore = scores.eq.E + scores.eq.SS + scores.culture.T; // Empathy + Social + Trust
  const driveScore = scores.eq.M + scores.bed.D; // Motivation + Decisions
  const strategyScore = scores.eq.SA + scores.bed.B; // Awareness + Beliefs

  const familyScores = {
    REGULATORS: regulationScore,
    CONNECTORS: connectionScore,
    DRIVERS: driveScore,
    STRATEGISTS: strategyScore,
  };

  // Find the highest scoring family
  let maxFamily: LeadershipFamilyCode = 'REGULATORS';
  let maxScore = familyScores.REGULATORS;

  (Object.keys(familyScores) as LeadershipFamilyCode[]).forEach((family) => {
    if (familyScores[family] > maxScore) {
      maxScore = familyScores[family];
      maxFamily = family;
    }
  });

  return maxFamily;
}

// Determine specific Leadership Type within a family
export function determineLeadershipType(
  scores: ScoreBreakdown,
  family: LeadershipFamilyCode
): LeadershipTypeCode {
  const { eq, bed, culture } = scores;

  switch (family) {
    case 'REGULATORS':
      // Determine which Regulator type
      if (eq.SR >= eq.SA && eq.M > eq.E) return 'GROUNDED_COMMANDER';
      if (eq.SA >= eq.SR && eq.SR > eq.E) return 'ANCHOR';
      if (eq.SR > eq.SA && eq.SS > eq.E) return 'GUARDIAN';
      if (eq.SR > eq.E && bed.D > bed.B) return 'RESPONDER';
      return 'STABILIZER';

    case 'CONNECTORS':
      // Determine which Connector type
      if (eq.E >= eq.SS && eq.SA > eq.SR) return 'EMPATHIC_STRATEGIST';
      if (eq.E > eq.SA && eq.SS > eq.SR) return 'BRIDGE_BUILDER';
      if (eq.E > eq.SS && bed.D > bed.EX) return 'MENTOR';
      if (eq.E > eq.SA && eq.E > eq.SS && eq.E > eq.SR) return 'HARMONIZER';
      return 'CULTURAL_ARCHITECT';

    case 'DRIVERS':
      // Determine which Driver type
      if (eq.M >= bed.D && eq.M > eq.E) return 'CATALYST';
      if (eq.M > eq.E && bed.D < eq.M) return 'ENFORCER';
      if (bed.D > eq.M && eq.SR > eq.E) return 'OPTIMIZER';
      if (eq.M > eq.SR && bed.D > bed.B) return 'ACCELERATOR';
      return 'STANDARD_BEARER';

    case 'STRATEGISTS':
      // Determine which Strategist type
      if (eq.SA >= eq.M && eq.M > eq.E) return 'VISIONARY';
      if (eq.SA > eq.SS && bed.B > bed.D) return 'ARCHITECT';
      if (eq.SA > eq.E && bed.D > eq.M) return 'ANALYST';
      if (eq.SA > eq.SR && culture.TS < culture.CQ) return 'NAVIGATOR';
      return 'INTEGRATOR';

    default:
      return 'STABILIZER';
  }
}

// Get score level label
export function getScoreLevel(percentage: number): string {
  if (percentage >= 90) return 'Exceptional';
  if (percentage >= 75) return 'Strong';
  if (percentage >= 60) return 'Developing';
  if (percentage >= 40) return 'Emerging';
  return 'Foundational';
}

// Get score color based on percentage
export function getScoreColor(percentage: number): string {
  if (percentage >= 75) return 'var(--color-success)';
  if (percentage >= 50) return 'var(--color-gold)';
  if (percentage >= 25) return 'var(--color-warning)';
  return 'var(--color-error)';
}

// Calculate individual metric percentage
export function getMetricPercentage(score: number): number {
  const maxScore = MAX_SCORE_PER_METRIC * TOTAL_SCENARIOS;
  return Math.round((score / maxScore) * 100);
}
