// E.Q.U.I.P. 360 Type Definitions
// Emotional Quotient Under Intelligent Pressure

// ============================================
// LAYER 1: Emotional Readiness (EQ Pillars)
// ============================================

export type EQPillarCode = 'SA' | 'SR' | 'M' | 'E' | 'SS';

export interface EQPillar {
  code: EQPillarCode;
  name: string;
  fullName: string;
  description: string;
}

export const EQ_PILLARS: Record<EQPillarCode, EQPillar> = {
  SA: {
    code: 'SA',
    name: 'Self-Awareness',
    fullName: 'Self-Awareness',
    description: 'Recognition of own emotions, triggers, and patterns',
  },
  SR: {
    code: 'SR',
    name: 'Self-Regulation',
    fullName: 'Self-Regulation',
    description: 'Control of emotional responses and impulses',
  },
  M: {
    code: 'M',
    name: 'Motivation',
    fullName: 'Motivation',
    description: 'Internal drive and persistence toward goals',
  },
  E: {
    code: 'E',
    name: 'Empathy',
    fullName: 'Empathy',
    description: "Understanding and responding to others' emotions",
  },
  SS: {
    code: 'SS',
    name: 'Social Skill',
    fullName: 'Social Skill',
    description: 'Managing relationships and building influence',
  },
};

// ============================================
// LAYER 2: Behavioral Reality (B.E.D. Factors)
// ============================================

export type BEDFactorCode = 'B' | 'EX' | 'D';

export interface BEDFactor {
  code: BEDFactorCode;
  name: string;
  fullName: string;
  description: string;
}

export const BED_FACTORS: Record<BEDFactorCode, BEDFactor> = {
  B: {
    code: 'B',
    name: 'Beliefs',
    fullName: 'Beliefs',
    description: 'Stories you tell yourself that shape your lens on pressure',
  },
  EX: {
    code: 'EX',
    name: 'Excuses',
    fullName: 'Excuses',
    description: 'Protection patterns or rationalizations under tension',
  },
  D: {
    code: 'D',
    name: 'Decisions',
    fullName: 'Decisions',
    description: 'How boldly, clearly, and consistently you choose direction',
  },
};

// ============================================
// LAYER 3: Cultural Influence (Culture Index)
// ============================================

export type CultureDimensionCode = 'T' | 'PS' | 'CQ' | 'TS' | 'ER';

export interface CultureDimension {
  code: CultureDimensionCode;
  name: string;
  fullName: string;
  description: string;
}

export const CULTURE_DIMENSIONS: Record<CultureDimensionCode, CultureDimension> = {
  T: {
    code: 'T',
    name: 'Trust',
    fullName: 'Trust-Building',
    description: 'Ability to establish and maintain credibility',
  },
  PS: {
    code: 'PS',
    name: 'Psych Safety',
    fullName: 'Psychological Safety',
    description: 'Creating space for risk-taking without fear',
  },
  CQ: {
    code: 'CQ',
    name: 'Communication',
    fullName: 'Communication Quality',
    description: 'Clarity and effectiveness of messaging',
  },
  TS: {
    code: 'TS',
    name: 'Team Stability',
    fullName: 'Team Stability',
    description: 'Consistency and reliability in team dynamics',
  },
  ER: {
    code: 'ER',
    name: 'Emotional Ripple',
    fullName: 'Emotional Ripple',
    description: 'Impact of your emotional state on others',
  },
};

// ============================================
// SCORING SYSTEM
// ============================================

// The 13-metric scoring array order:
// SA | SR | M | E | SS | B | EX | D | T | PS | CQ | TS | ER
export type ScoreArray = [
  number, // SA - Self-Awareness
  number, // SR - Self-Regulation
  number, // M - Motivation
  number, // E - Empathy
  number, // SS - Social Skill
  number, // B - Beliefs
  number, // EX - Excuses
  number, // D - Decisions
  number, // T - Trust
  number, // PS - Psychological Safety
  number, // CQ - Communication Quality
  number, // TS - Team Stability
  number, // ER - Emotional Ripple
];

export const SCORE_INDICES = {
  SA: 0,
  SR: 1,
  M: 2,
  E: 3,
  SS: 4,
  B: 5,
  EX: 6,
  D: 7,
  T: 8,
  PS: 9,
  CQ: 10,
  TS: 11,
  ER: 12,
} as const;

export interface ScoreBreakdown {
  eq: {
    SA: number;
    SR: number;
    M: number;
    E: number;
    SS: number;
    total: number;
    percentage: number;
  };
  bed: {
    B: number;
    EX: number;
    D: number;
    total: number;
    percentage: number;
  };
  culture: {
    T: number;
    PS: number;
    CQ: number;
    TS: number;
    ER: number;
    total: number;
    percentage: number;
  };
  overall: {
    total: number;
    percentage: number;
    maxPossible: number;
  };
}

// ============================================
// LEADERSHIP FAMILIES & IDENTITY TYPES
// ============================================

export type LeadershipFamilyCode = 'REGULATORS' | 'CONNECTORS' | 'DRIVERS' | 'STRATEGISTS';

export interface LeadershipFamily {
  code: LeadershipFamilyCode;
  name: string;
  tagline: string;
  description: string;
  color: string;
}

export const LEADERSHIP_FAMILIES: Record<LeadershipFamilyCode, LeadershipFamily> = {
  REGULATORS: {
    code: 'REGULATORS',
    name: 'Regulators',
    tagline: 'Composure, Steadiness, Emotional Grounding',
    description: 'They stabilize teams.',
    color: '#0791f1', // Blue
  },
  CONNECTORS: {
    code: 'CONNECTORS',
    name: 'Connectors',
    tagline: 'Empathy, Trust, Human Intelligence',
    description: 'They humanize leadership.',
    color: '#0791f1', // Blue
  },
  DRIVERS: {
    code: 'DRIVERS',
    name: 'Drivers',
    tagline: 'Action, Standards, Momentum',
    description: 'They create results and standards.',
    color: '#DC143C', // Crimson
  },
  STRATEGISTS: {
    code: 'STRATEGISTS',
    name: 'Strategists',
    tagline: 'Awareness, Vision, Intentionality',
    description: 'They shape direction and intelligence.',
    color: '#C9A227', // Gold
  },
};

export type LeadershipTypeCode =
  // Regulators
  | 'GROUNDED_COMMANDER'
  | 'ANCHOR'
  | 'STABILIZER'
  | 'RESPONDER'
  | 'GUARDIAN'
  // Connectors
  | 'EMPATHIC_STRATEGIST'
  | 'BRIDGE_BUILDER'
  | 'MENTOR'
  | 'HARMONIZER'
  | 'CULTURAL_ARCHITECT'
  // Drivers
  | 'CATALYST'
  | 'ENFORCER'
  | 'OPTIMIZER'
  | 'ACCELERATOR'
  | 'STANDARD_BEARER'
  // Strategists
  | 'VISIONARY'
  | 'ARCHITECT'
  | 'ANALYST'
  | 'NAVIGATOR'
  | 'INTEGRATOR';

export interface LeadershipType {
  code: LeadershipTypeCode;
  name: string;
  family: LeadershipFamilyCode;
  tagline: string;
  description: string;
  strengths: string[];
  blindSpots: string[];
  stressBehaviors: string[];
  bestUtilization: string;
}

export const LEADERSHIP_TYPES: Record<LeadershipTypeCode, LeadershipType> = {
  // REGULATORS
  GROUNDED_COMMANDER: {
    code: 'GROUNDED_COMMANDER',
    name: 'The Grounded Commander',
    family: 'REGULATORS',
    tagline: 'High Self-Regulation + High Motivation',
    description: 'Calm under fire, confident decision-maker.',
    strengths: ['Crisis management', 'Decisive action', 'Emotional steadiness'],
    blindSpots: ['May appear detached', 'Can miss emotional nuances'],
    stressBehaviors: ['Becomes more directive', 'Narrows focus'],
    bestUtilization: 'Leading through high-stakes situations and organizational change.',
  },
  ANCHOR: {
    code: 'ANCHOR',
    name: 'The Anchor',
    family: 'REGULATORS',
    tagline: 'High Awareness + High Regulation',
    description: 'Emotionally consistent, prevents escalation.',
    strengths: ['Stability under pressure', 'De-escalation', 'Predictable presence'],
    blindSpots: ['May resist necessary change', 'Can seem inflexible'],
    stressBehaviors: ['Doubles down on routines', 'Avoids confrontation'],
    bestUtilization: 'Maintaining team morale during uncertainty and transition.',
  },
  STABILIZER: {
    code: 'STABILIZER',
    name: 'The Stabilizer',
    family: 'REGULATORS',
    tagline: 'Balanced across regulation skills',
    description: 'Keeps teams focused, protects psychological safety.',
    strengths: ['Team cohesion', 'Conflict prevention', 'Consistent leadership'],
    blindSpots: ['May avoid necessary conflict', 'Can plateau on innovation'],
    stressBehaviors: ['Over-focuses on harmony', 'Delays difficult decisions'],
    bestUtilization: 'Building and maintaining high-performing team environments.',
  },
  RESPONDER: {
    code: 'RESPONDER',
    name: 'The Responder',
    family: 'REGULATORS',
    tagline: 'High Regulation + Mid Empathy',
    description: 'Composed, reliable, systematic.',
    strengths: ['Process adherence', 'Reliable execution', 'Calm presence'],
    blindSpots: ['May miss emotional cues', 'Can seem mechanical'],
    stressBehaviors: ['Retreats to process', 'Becomes overly procedural'],
    bestUtilization: 'Operational leadership requiring consistent, methodical approach.',
  },
  GUARDIAN: {
    code: 'GUARDIAN',
    name: 'The Guardian',
    family: 'REGULATORS',
    tagline: 'High Regulation + High Social Skill',
    description: 'Strong protector of team stability.',
    strengths: ['Team protection', 'Boundary setting', 'Loyal leadership'],
    blindSpots: ['May be overprotective', 'Can resist outside input'],
    stressBehaviors: ['Circles the wagons', 'Becomes defensive'],
    bestUtilization: 'Protecting teams from external pressures while maintaining performance.',
  },

  // CONNECTORS
  EMPATHIC_STRATEGIST: {
    code: 'EMPATHIC_STRATEGIST',
    name: 'The Empathic Strategist',
    family: 'CONNECTORS',
    tagline: 'High Empathy + High Awareness',
    description: 'Sees emotional patterns, drives trust quickly.',
    strengths: ['Reading rooms', 'Building rapport', 'Strategic empathy'],
    blindSpots: ['May over-empathize', 'Can delay tough decisions'],
    stressBehaviors: ['Absorbs others\' stress', 'Becomes indecisive'],
    bestUtilization: 'Navigating complex stakeholder relationships and change management.',
  },
  BRIDGE_BUILDER: {
    code: 'BRIDGE_BUILDER',
    name: 'The Bridge Builder',
    family: 'CONNECTORS',
    tagline: 'Empathy + Social Skill',
    description: 'Connects disconnected people, creates psychological safety.',
    strengths: ['Conflict resolution', 'Cross-functional collaboration', 'Trust building'],
    blindSpots: ['May avoid taking sides', 'Can spread too thin'],
    stressBehaviors: ['Over-mediates', 'Loses own voice'],
    bestUtilization: 'Unifying divided teams and departments.',
  },
  MENTOR: {
    code: 'MENTOR',
    name: 'The Mentor',
    family: 'CONNECTORS',
    tagline: 'High Empathy + High Decisions',
    description: 'Grows people, spots talent early.',
    strengths: ['Talent development', 'Coaching', 'Patient guidance'],
    blindSpots: ['May over-invest in individuals', 'Can enable dependency'],
    stressBehaviors: ['Takes on others\' problems', 'Neglects own needs'],
    bestUtilization: 'Developing next-generation leaders and high-potential talent.',
  },
  HARMONIZER: {
    code: 'HARMONIZER',
    name: 'The Harmonizer',
    family: 'CONNECTORS',
    tagline: 'Very High Empathy',
    description: 'Excellent one-on-one relationships.',
    strengths: ['Deep connections', 'Emotional intelligence', 'Supportive presence'],
    blindSpots: ['May struggle with group dynamics', 'Can be conflict-averse'],
    stressBehaviors: ['Withdraws from conflict', 'Becomes passive'],
    bestUtilization: 'Building deep trust in key relationships and sensitive negotiations.',
  },
  CULTURAL_ARCHITECT: {
    code: 'CULTURAL_ARCHITECT',
    name: 'The Cultural Architect',
    family: 'CONNECTORS',
    tagline: 'High Empathy + Awareness + Social Skill',
    description: 'Shapes culture intentionally.',
    strengths: ['Culture design', 'Values alignment', 'Organizational influence'],
    blindSpots: ['May focus on culture over results', 'Can be idealistic'],
    stressBehaviors: ['Becomes preachy', 'Over-focuses on values'],
    bestUtilization: 'Transforming organizational culture and building values-driven teams.',
  },

  // DRIVERS
  CATALYST: {
    code: 'CATALYST',
    name: 'The Catalyst',
    family: 'DRIVERS',
    tagline: 'High Motivation + High Decisions',
    description: 'Moves fast, inspires action.',
    strengths: ['Speed of execution', 'Energy creation', 'Momentum building'],
    blindSpots: ['May move too fast', 'Can burn out teams'],
    stressBehaviors: ['Pushes harder', 'Becomes impatient'],
    bestUtilization: 'Launching initiatives and driving rapid organizational change.',
  },
  ENFORCER: {
    code: 'ENFORCER',
    name: 'The Enforcer',
    family: 'DRIVERS',
    tagline: 'High Motivation + Low Empathy',
    description: 'Gets results regardless, sets clear expectations.',
    strengths: ['Accountability', 'Clear standards', 'Results focus'],
    blindSpots: ['May damage relationships', 'Can create fear'],
    stressBehaviors: ['Becomes demanding', 'Ignores emotional impact'],
    bestUtilization: 'Turnaround situations requiring tough accountability.',
  },
  OPTIMIZER: {
    code: 'OPTIMIZER',
    name: 'The Optimizer',
    family: 'DRIVERS',
    tagline: 'High Standards + Process Focus',
    description: 'Drives efficiency and excellence.',
    strengths: ['Process improvement', 'Quality standards', 'Systematic thinking'],
    blindSpots: ['May over-engineer', 'Can slow innovation'],
    stressBehaviors: ['Micro-manages', 'Obsesses over details'],
    bestUtilization: 'Improving operational efficiency and quality systems.',
  },
  ACCELERATOR: {
    code: 'ACCELERATOR',
    name: 'The Accelerator',
    family: 'DRIVERS',
    tagline: 'High Energy + High Pace',
    description: 'Creates urgency and forward motion.',
    strengths: ['Speed', 'Energy', 'Deadline orientation'],
    blindSpots: ['May sacrifice quality', 'Can exhaust teams'],
    stressBehaviors: ['Races faster', 'Skips steps'],
    bestUtilization: 'Time-sensitive projects and competitive situations.',
  },
  STANDARD_BEARER: {
    code: 'STANDARD_BEARER',
    name: 'The Standard Bearer',
    family: 'DRIVERS',
    tagline: 'High Accountability + High Consistency',
    description: 'Maintains excellence across teams.',
    strengths: ['Consistent excellence', 'Role modeling', 'Standards enforcement'],
    blindSpots: ['May be inflexible', 'Can resist adaptation'],
    stressBehaviors: ['Becomes rigid', 'Judges others harshly'],
    bestUtilization: 'Establishing and maintaining organizational standards.',
  },

  // STRATEGISTS
  VISIONARY: {
    code: 'VISIONARY',
    name: 'The Visionary',
    family: 'STRATEGISTS',
    tagline: 'High Awareness + High Motivation',
    description: 'Sees future possibilities, inspires direction.',
    strengths: ['Future thinking', 'Inspiration', 'Strategic clarity'],
    blindSpots: ['May disconnect from present', 'Can seem unrealistic'],
    stressBehaviors: ['Retreats to big picture', 'Avoids tactical details'],
    bestUtilization: 'Setting long-term direction and inspiring organizational vision.',
  },
  ARCHITECT: {
    code: 'ARCHITECT',
    name: 'The Architect',
    family: 'STRATEGISTS',
    tagline: 'High Awareness + Systems Thinking',
    description: 'Designs organizational structures.',
    strengths: ['System design', 'Structural thinking', 'Long-term planning'],
    blindSpots: ['May over-complicate', 'Can ignore human factors'],
    stressBehaviors: ['Retreats to planning', 'Analysis paralysis'],
    bestUtilization: 'Designing organizational structures and systems.',
  },
  ANALYST: {
    code: 'ANALYST',
    name: 'The Analyst',
    family: 'STRATEGISTS',
    tagline: 'High Awareness + Data-Driven',
    description: 'Makes decisions based on evidence and patterns.',
    strengths: ['Data analysis', 'Pattern recognition', 'Objective decision-making'],
    blindSpots: ['May ignore intuition', 'Can seem cold'],
    stressBehaviors: ['Demands more data', 'Delays decisions'],
    bestUtilization: 'Complex problem-solving requiring analytical rigor.',
  },
  NAVIGATOR: {
    code: 'NAVIGATOR',
    name: 'The Navigator',
    family: 'STRATEGISTS',
    tagline: 'High Awareness + Adaptability',
    description: 'Guides through complexity and change.',
    strengths: ['Adaptability', 'Course correction', 'Change navigation'],
    blindSpots: ['May lack commitment', 'Can seem inconsistent'],
    stressBehaviors: ['Over-pivots', 'Loses direction'],
    bestUtilization: 'Leading through ambiguity and rapid change.',
  },
  INTEGRATOR: {
    code: 'INTEGRATOR',
    name: 'The Integrator',
    family: 'STRATEGISTS',
    tagline: 'Balanced Awareness across all dimensions',
    description: 'Synthesizes competing priorities.',
    strengths: ['Holistic thinking', 'Priority balancing', 'Integration'],
    blindSpots: ['May lack specialization', 'Can seem uncommitted'],
    stressBehaviors: ['Over-balances', 'Avoids strong positions'],
    bestUtilization: 'Leading cross-functional initiatives requiring balanced perspective.',
  },
};

// ============================================
// SCENARIO & ASSESSMENT TYPES
// ============================================

export interface ScenarioChoice {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  scores: ScoreArray;
}

export interface Scenario {
  id: string;
  number: number;
  title: string;
  context: string;
  question: string;
  choices: ScenarioChoice[];
}

export interface AssessmentResponse {
  scenarioId: string;
  selectedChoice: 'A' | 'B' | 'C' | 'D';
  scores: ScoreArray;
  timestamp: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  role?: string;
  createdAt: Date;
}

export interface AssessmentSession {
  id: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  currentScenarioIndex: number;
  responses: AssessmentResponse[];
  startedAt?: Date;
  completedAt?: Date;
  lastSavedAt?: Date;
}

export interface AssessmentResult {
  id: string;
  sessionId: string;
  userId: string;
  scores: ScoreBreakdown;
  leadershipFamily: LeadershipFamilyCode;
  leadershipType: LeadershipTypeCode;
  narrativeReport?: NarrativeReport;
  completedAt: Date;
}

// ============================================
// NARRATIVE REPORT TYPES
// ============================================

export interface NarrativeReport {
  leadershipMandate: string;
  leadershipIdentity: {
    family: LeadershipFamily;
    type: LeadershipType;
    personalizedInsight: string;
  };
  cultureRipple: {
    summary: string;
    dimensions: {
      code: CultureDimensionCode;
      score: number;
      insight: string;
    }[];
  };
  bedProfile: {
    beliefs: string;
    excuses: string;
    decisions: string;
    summary: string;
  };
  pressurePattern: {
    stressResponse: string;
    relationshipTension: string;
    standardsPressure: string;
    uncertaintyResponse: string;
  };
  selInsight: {
    emotionRecognition: string;
    emotionRegulation: string;
    valuesAlignment: string;
    emotionalInfluence: string;
    triggerAwareness: string;
    summary: string;
  };
  yourMove: {
    immediateActions: string[];
    developmentAreas: string[];
    coachingRecommendation: string;
  };
  generatedAt: Date;
}

// ============================================
// COACH ENCOURAGEMENT
// ============================================

export interface CoachMessage {
  trigger: 'start' | '25%' | '50%' | '75%' | 'complete';
  message: string;
}

export const COACH_MESSAGES: CoachMessage[] = [
  {
    trigger: 'start',
    message: "Let's discover the leader you already are, and the one you're becoming.",
  },
  {
    trigger: '25%',
    message: "You're making great progress. Trust your instincts.",
  },
  {
    trigger: '50%',
    message: 'Halfway there. Your patterns are revealing themselves.',
  },
  {
    trigger: '75%',
    message: 'Almost done. The insights waiting for you are worth it.',
  },
  {
    trigger: 'complete',
    message: "You showed up. Now let's show you what you've been building.",
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getCoachMessage(progress: number): CoachMessage | null {
  if (progress === 0) return COACH_MESSAGES.find((m) => m.trigger === 'start') || null;
  if (progress >= 100) return COACH_MESSAGES.find((m) => m.trigger === 'complete') || null;
  if (progress >= 75) return COACH_MESSAGES.find((m) => m.trigger === '75%') || null;
  if (progress >= 50) return COACH_MESSAGES.find((m) => m.trigger === '50%') || null;
  if (progress >= 25) return COACH_MESSAGES.find((m) => m.trigger === '25%') || null;
  return null;
}

export function calculateProgress(currentIndex: number, totalScenarios: number): number {
  return Math.round((currentIndex / totalScenarios) * 100);
}
