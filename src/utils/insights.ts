// E.Q.U.I.P. 360 Insights Generator
import type { ScoreBreakdown, LeadershipTypeCode, LeadershipFamilyCode } from '@/types';
import { LEADERSHIP_TYPES, LEADERSHIP_FAMILIES } from '@/types';

// Get score level description
function getLevel(percentage: number): 'high' | 'moderate' | 'developing' {
  if (percentage >= 75) return 'high';
  if (percentage >= 50) return 'moderate';
  return 'developing';
}

// Culture Ripple Insights
export function getCultureRippleInsight(
  scores: ScoreBreakdown,
  familyCode: LeadershipFamilyCode
): string {
  const family = LEADERSHIP_FAMILIES[familyCode];
  const cultureLevel = getLevel(scores.culture.percentage);
  const trustLevel = getLevel((scores.culture.T / 100) * 100);
  const safetyLevel = getLevel((scores.culture.PS / 100) * 100);

  const insights: Record<string, string> = {
    high: `Your emotional presence creates a strong positive ripple across your team. As a ${family.name} leader, your ${family.tagline.toLowerCase()} naturally fosters an environment where people feel valued and heard. Your high Cultural Influence score (${scores.culture.percentage}%) indicates that your emotional state significantly elevates team morale and productivity.`,
    moderate: `Your emotional influence on team culture is developing well. As a ${family.name} leader, you bring ${family.tagline.toLowerCase()} to your interactions. With a Cultural Influence score of ${scores.culture.percentage}%, you have solid foundations but opportunity to amplify your positive impact on psychological safety and trust-building.`,
    developing: `Your cultural ripple is an area for focused growth. As a ${family.name} leader, you have the potential to leverage ${family.tagline.toLowerCase()} more consistently. Your Cultural Influence score of ${scores.culture.percentage}% suggests that being more intentional about your emotional presence could significantly improve team dynamics.`,
  };

  let additionalInsight = '';
  if (trustLevel === 'high') {
    additionalInsight = ' Your strength in trust-building creates lasting bonds with team members.';
  } else if (safetyLevel === 'developing') {
    additionalInsight = ' Focus on creating more psychological safety to help your team take healthy risks.';
  }

  return insights[cultureLevel] + additionalInsight;
}

// B.E.D. Profile Insights
export function getBEDProfileInsight(
  scores: ScoreBreakdown,
  typeCode: LeadershipTypeCode
): { beliefs: string; excuses: string; decisions: string } {
  const type = LEADERSHIP_TYPES[typeCode];
  const beliefsLevel = getLevel((scores.bed.B / 100) * 100);
  const excusesLevel = getLevel((scores.bed.EX / 100) * 100);
  const decisionsLevel = getLevel((scores.bed.D / 100) * 100);

  const beliefs: Record<string, string> = {
    high: `Your belief patterns are empowering. You operate from a mindset of possibility and growth, which aligns with your identity as ${type.name}. You tend to see challenges as opportunities and maintain constructive narratives even under pressure.`,
    moderate: `Your belief patterns show a balance of optimism and caution. As ${type.name}, you generally maintain constructive thinking but may occasionally slip into limiting narratives when stressed. Building awareness of these moments can strengthen your leadership presence.`,
    developing: `Your belief patterns may be holding you back. Consider examining the stories you tell yourself about your capabilities and circumstances. As ${type.name}, shifting toward more empowering beliefs could unlock significant leadership potential.`,
  };

  const excuses: Record<string, string> = {
    high: `You demonstrate strong accountability and rarely fall into excuse-making patterns. This ownership mentality is a key strength that builds trust with your team and drives results.`,
    moderate: `You generally take ownership but may occasionally defer responsibility under pressure. Recognizing these moments and choosing accountability can strengthen your leadership credibility.`,
    developing: `Under pressure, you may tend toward protective excuse patterns. This is common but worth addressing. Building habits of radical ownership, even in difficult situations, will significantly elevate your leadership impact.`,
  };

  const decisions: Record<string, string> = {
    high: `You make bold, timely decisions even with incomplete information. This decisiveness inspires confidence in your team and keeps momentum strong during uncertainty.`,
    moderate: `Your decision-making is generally sound but may slow under pressure. Trust your judgment more and remember that a good decision now often beats a perfect decision later.`,
    developing: `Decision hesitancy may be limiting your leadership effectiveness. As ${type.name}, leaning into your natural strengths and trusting your instincts more can help you make faster, more confident choices.`,
  };

  return {
    beliefs: beliefs[beliefsLevel],
    excuses: excuses[excusesLevel],
    decisions: decisions[decisionsLevel],
  };
}

// Pressure Pattern Insights
export function getPressurePatternInsight(
  scores: ScoreBreakdown,
  typeCode: LeadershipTypeCode
): string {
  const type = LEADERSHIP_TYPES[typeCode];
  const regulationScore = (scores.eq.SR / 100) * 100;
  const awarenessScore = (scores.eq.SA / 100) * 100;

  let pressureResponse = '';

  if (regulationScore >= 75) {
    pressureResponse = 'When pressure rises, you maintain remarkable composure. Your ability to regulate your emotional state keeps you grounded when others might react impulsively.';
  } else if (regulationScore >= 50) {
    pressureResponse = 'Under pressure, you generally maintain composure but may experience moments of emotional reactivity. Building stronger regulation habits will help you stay centered in high-stakes moments.';
  } else {
    pressureResponse = 'Pressure tends to trigger emotional responses that may not serve you well. Developing stronger self-regulation practices will help you respond rather than react in challenging situations.';
  }

  const stressBehaviors = type.stressBehaviors.join(', ').toLowerCase();

  return `${pressureResponse} As ${type.name}, your typical stress behaviors include: ${stressBehaviors}. ${
    awarenessScore >= 70
      ? 'Your strong self-awareness helps you recognize these patterns early, giving you the chance to course-correct.'
      : 'Building greater self-awareness will help you catch these patterns earlier and choose more effective responses.'
  }`;
}

// Your Move - Growth Recommendations
export function getGrowthRecommendations(
  scores: ScoreBreakdown,
  typeCode: LeadershipTypeCode,
  familyCode: LeadershipFamilyCode
): string[] {
  const type = LEADERSHIP_TYPES[typeCode];
  const recommendations: string[] = [];

  // Based on lowest EQ pillar
  const eqScores = {
    'Self-Awareness': scores.eq.SA,
    'Self-Regulation': scores.eq.SR,
    'Motivation': scores.eq.M,
    'Empathy': scores.eq.E,
    'Social Skill': scores.eq.SS,
  };

  const lowestEQ = Object.entries(eqScores).sort((a, b) => a[1] - b[1])[0];
  const eqRecommendations: Record<string, string> = {
    'Self-Awareness': 'Practice daily reflection. Spend 5 minutes each evening reviewing your emotional responses and their impact on others.',
    'Self-Regulation': 'Develop a pause practice. When triggered, take three deep breaths before responding to create space between stimulus and response.',
    'Motivation': 'Reconnect with your core purpose. Write down why your work matters and review it weekly to maintain intrinsic drive.',
    'Empathy': 'Practice active listening. In your next three conversations, focus entirely on understanding before responding.',
    'Social Skill': 'Invest in relationship building. Schedule one informal connection conversation with a team member each week.',
  };
  recommendations.push(eqRecommendations[lowestEQ[0]]);

  // Based on B.E.D. patterns
  if (scores.bed.B < scores.bed.EX && scores.bed.B < scores.bed.D) {
    recommendations.push('Challenge limiting beliefs. When you notice negative self-talk, write it down and actively reframe it with evidence-based alternatives.');
  } else if (scores.bed.EX < scores.bed.D) {
    recommendations.push('Practice radical ownership. For the next week, eliminate phrases like "I had to" or "They made me" from your vocabulary.');
  } else {
    recommendations.push('Build decision momentum. Start each day by making one clear decision quickly, building your confidence in faster decision-making.');
  }

  // Based on blind spots
  const blindSpot = type.blindSpots[0];
  recommendations.push(`Address your primary blind spot: ${blindSpot}. Ask a trusted colleague for feedback on this specific area.`);

  // Family-specific recommendation
  const familyRecs: Record<LeadershipFamilyCode, string> = {
    REGULATORS: 'Balance your stability with flexibility. Challenge yourself to embrace one change or new approach this week.',
    CONNECTORS: 'Set boundaries around emotional investment. Schedule recovery time after intense relational work.',
    DRIVERS: 'Slow down to speed up. Take time to bring others along rather than pushing ahead alone.',
    STRATEGISTS: 'Move from planning to action. Identify one insight you can implement immediately rather than continuing to analyze.',
  };
  recommendations.push(familyRecs[familyCode]);

  return recommendations;
}
