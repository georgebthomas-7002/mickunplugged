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

// Move the Stool - One High-Impact Shift
export function getMoveTheStoolInsight(
  scores: ScoreBreakdown,
  typeCode: LeadershipTypeCode
): string {
  const type = LEADERSHIP_TYPES[typeCode];

  // Find the lowest scoring area
  const allScores = {
    'Self-Awareness': scores.eq.SA,
    'Self-Regulation': scores.eq.SR,
    'Motivation': scores.eq.M,
    'Empathy': scores.eq.E,
    'Social Skill': scores.eq.SS,
    'Beliefs': scores.bed.B,
    'Excuses': scores.bed.EX,
    'Decisions': scores.bed.D,
  };

  const lowestArea = Object.entries(allScores).sort((a, b) => a[1] - b[1])[0];
  const [area] = lowestArea;

  const moveInsights: Record<string, string> = {
    'Self-Awareness': `Your one move: Start a daily "emotional check-in" practice. Before your first meeting each day, ask yourself: "What emotion am I carrying right now, and how might it show up?" This simple pause will transform how you show up as ${type.name}.`,
    'Self-Regulation': `Your one move: Create a "pause protocol." When you feel emotional intensity rising, physically step back, take three breaths, and ask: "What response serves the outcome I want?" This shift from reaction to response will unlock your leadership potential.`,
    'Motivation': `Your one move: Reconnect with your "why" weekly. Set a 15-minute calendar block each Monday to write down one thing that matters about your work this week. As ${type.name}, this practice will reignite your natural drive.`,
    'Empathy': `Your one move: Practice "listen-first" leadership. In your next five important conversations, commit to understanding before being understood. Ask one follow-up question before offering your perspective.`,
    'Social Skill': `Your one move: Initiate one meaningful conversation each week with someone outside your immediate circle. As ${type.name}, expanding your relational influence will multiply your leadership impact.`,
    'Beliefs': `Your one move: Challenge one limiting belief this week. When you notice negative self-talk, write it down and ask: "What evidence contradicts this story?" Rewriting your internal narrative will shift your external results.`,
    'Excuses': `Your one move: Adopt radical ownership for 30 days. When something goes wrong, ask "What could I have done differently?" before looking at external factors. This mindset shift will transform how others trust your leadership.`,
    'Decisions': `Your one move: Make one decisive choice each morning before 9 AM. Build the muscle of swift decision-making in low-stakes situations so it becomes natural when the stakes rise.`,
  };

  return moveInsights[area] || moveInsights['Self-Awareness'];
}

// Because Statement - Emotional Engine
export function getBecauseStatementInsight(
  scores: ScoreBreakdown,
  typeCode: LeadershipTypeCode,
  familyCode: LeadershipFamilyCode
): string {
  const type = LEADERSHIP_TYPES[typeCode];
  const motivationLevel = getLevel((scores.eq.M / 100) * 100);
  const beliefsLevel = getLevel((scores.bed.B / 100) * 100);

  const familyBecause: Record<LeadershipFamilyCode, string> = {
    REGULATORS: 'you believe stability creates the foundation for others to thrive',
    CONNECTORS: 'you know that people perform best when they feel genuinely seen and valued',
    DRIVERS: 'you understand that momentum and decisive action move teams forward',
    STRATEGISTS: 'you see patterns others miss and know that insight drives transformation',
  };

  const typeBecause: Record<string, string> = {
    high: `I lead BECAUSE ${familyBecause[familyCode]}. As ${type.name}, I show up every day because my ${type.tagline.toLowerCase()} creates impact that matters. I refuse to quit because I've seen what's possible when leadership is done with emotional intelligence.`,
    moderate: `I lead BECAUSE ${familyBecause[familyCode]}. Even when it's hard, I show up as ${type.name} because I believe in the power of emotionally intelligent leadership. I'm building toward a version of myself that leads with both strength and heart.`,
    developing: `I lead BECAUSE ${familyBecause[familyCode]}. I may still be discovering my full potential as ${type.name}, but I refuse to quit because I know that every step forward in emotional intelligence creates ripples of positive change.`,
  };

  // Use the higher of motivation or beliefs to determine tone
  const overallLevel = motivationLevel === 'high' || beliefsLevel === 'high'
    ? 'high'
    : motivationLevel === 'developing' && beliefsLevel === 'developing'
    ? 'developing'
    : 'moderate';

  return typeBecause[overallLevel];
}

// EQ Pillar Individual Insights
export function getEQPillarInsight(
  pillarCode: string,
  percentage: number,
  _typeCode: LeadershipTypeCode
): string {
  const level = getLevel(percentage);

  const pillarInsights: Record<string, Record<string, string>> = {
    SA: {
      high: `Your self-awareness is a significant strength. You recognize your emotions and their impact, giving you the ability to lead with intention.`,
      moderate: `Your self-awareness is developing. Continue building the habit of checking in with your emotional state throughout the day.`,
      developing: `Growing your self-awareness will unlock other areas of emotional intelligence. Start by naming your emotions as you experience them.`,
    },
    SR: {
      high: `You demonstrate excellent emotional control. This allows you to remain composed when others look to you for stability.`,
      moderate: `Your self-regulation is solid but has room to grow. Notice the moments when emotions drive your responses rather than inform them.`,
      developing: `Building self-regulation skills will transform your leadership presence. Practice pausing before responding in emotional moments.`,
    },
    M: {
      high: `Your inner drive is powerful. This intrinsic motivation keeps you moving forward even when external recognition is absent.`,
      moderate: `Your motivation is present but could be more consistent. Reconnecting with your core purpose will help sustain your drive.`,
      developing: `Strengthening your motivation will fuel all other aspects of your leadership. Identify what truly matters to you about your work.`,
    },
    E: {
      high: `Your empathy is a gift. You naturally understand others' perspectives, creating deeper connections and trust.`,
      moderate: `Your empathy is present but could go deeper. Practice being curious about others' experiences before offering solutions.`,
      developing: `Developing empathy will enhance your relationships and influence. Start by asking more questions and listening without planning your response.`,
    },
    SS: {
      high: `Your social skills create influence. You navigate relationships and group dynamics with natural ease.`,
      moderate: `Your social skills serve you well but can expand further. Focus on adapting your communication style to different audiences.`,
      developing: `Building social skills will multiply your leadership reach. Start by being more intentional about how you engage in group settings.`,
    },
  };

  return pillarInsights[pillarCode]?.[level] || `Your ${pillarCode} score reflects your current capacity in this area.`;
}

// Culture Dimension Individual Insights
export function getCultureDimensionInsight(
  dimensionCode: string,
  percentage: number,
  _familyCode: LeadershipFamilyCode
): string {
  const level = getLevel(percentage);

  const dimensionInsights: Record<string, Record<string, string>> = {
    T: {
      high: `Trust flows naturally from your leadership. People believe in your intentions and follow your direction with confidence.`,
      moderate: `You've built solid trust foundations. Consistency in your words and actions will deepen this further.`,
      developing: `Building trust is your growth edge. Focus on following through on commitments, no matter how small.`,
    },
    PS: {
      high: `You create psychological safety. Team members feel comfortable taking risks and speaking up around you.`,
      moderate: `Your team feels reasonably safe, but there's room to create more openness. Invite dissenting opinions more often.`,
      developing: `Psychological safety needs attention. Your team may hesitate to share concerns. Practice responding with curiosity, not judgment.`,
    },
    C: {
      high: `Your communication creates clarity. People understand your message and feel informed about what matters.`,
      moderate: `Your communication is effective but could be more consistent. Ensure your message reaches all levels equally.`,
      developing: `Communication is a growth area. Focus on being more explicit about expectations and more frequent with updates.`,
    },
    TS: {
      high: `You bring stability to your team. People feel secure and can focus on their work without unnecessary anxiety.`,
      moderate: `Your team experiences reasonable stability. Work on being more predictable in your responses to change.`,
      developing: `Team stability needs focus. Your emotional variability may create uncertainty. Aim for more consistency in your presence.`,
    },
    ER: {
      high: `Your emotional presence lifts others. People feel better after interacting with you and carry that energy forward.`,
      moderate: `Your emotional ripple is positive but not yet maximized. Be more intentional about the energy you bring to interactions.`,
      developing: `Your emotional ripple needs attention. Notice how your mood affects others and work on bringing consistent positive energy.`,
    },
  };

  return dimensionInsights[dimensionCode]?.[level] || `Your ${dimensionCode} score reflects your current impact in this area.`;
}
