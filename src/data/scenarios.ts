// E.Q.U.I.P. 360 Assessment Scenarios
// 20 scenarios measuring emotional performance under intelligent pressure

import type { Scenario } from '@/types';

// Score Array Order: SA | SR | M | E | SS | B | EX | D | T | PS | CQ | TS | ER

export const SCENARIOS: Scenario[] = [
  {
    id: 'scenario-1',
    number: 1,
    title: 'The Public Correction',
    context:
      'During a high-stakes team meeting with executives present, a direct report shares data that you immediately recognize as incorrect. The error, if left uncorrected, could influence a major decision.',
    question: 'How do you handle this situation?',
    choices: [
      {
        id: 'A',
        text: "Thank them for the contribution, then gently ask clarifying questions that allow them to self-correct without public embarrassment.",
        scores: [3, 4, 2, 3, 3, 3, 0, 2, 4, 4, 3, 3, 4],
      },
      {
        id: 'B',
        text: 'Interrupt immediately to correct the error. Accuracy is more important than feelings in front of executives.',
        scores: [1, 1, 3, 0, 1, 1, 3, 2, 0, 0, 1, 1, 0],
      },
      {
        id: 'C',
        text: "Note the error mentally, let the meeting continue, and address it privately afterward while sending a follow-up correction to attendees.",
        scores: [4, 4, 2, 4, 3, 4, 0, 3, 4, 4, 4, 4, 4],
      },
      {
        id: 'D',
        text: 'Signal to the team member nonverbally to pause, then offer to "add context" that subtly corrects without attribution.',
        scores: [3, 3, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 2],
      },
    ],
  },
  {
    id: 'scenario-2',
    number: 2,
    title: 'The Emotional Escalation',
    context:
      'A typically calm colleague becomes visibly upset during a one-on-one, raising their voice about workload concerns. Their frustration seems disproportionate to the immediate issue.',
    question: 'What is your response?',
    choices: [
      {
        id: 'A',
        text: "Stay calm, acknowledge their frustration directly, and ask what's really going on beneath the surface.",
        scores: [4, 4, 2, 4, 3, 4, 0, 3, 4, 4, 4, 3, 4],
      },
      {
        id: 'B',
        text: 'Give them space to vent, then redirect the conversation back to actionable solutions.',
        scores: [3, 3, 3, 3, 2, 3, 1, 3, 3, 3, 3, 3, 3],
      },
      {
        id: 'C',
        text: 'Match their energy briefly to show you understand, then model calmness to help them regulate.',
        scores: [2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2],
      },
      {
        id: 'D',
        text: 'Firmly but kindly ask them to lower their voice, explaining that productive conversation requires composure.',
        scores: [2, 3, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1],
      },
    ],
  },
  {
    id: 'scenario-3',
    number: 3,
    title: 'The Competing Priorities',
    context:
      'Two senior stakeholders have given you conflicting directives, both claiming executive sponsorship. Each priority requires immediate action, and you cannot satisfy both.',
    question: 'How do you navigate this?',
    choices: [
      {
        id: 'A',
        text: 'Escalate to your direct leader with a clear recommendation, requesting explicit priority guidance.',
        scores: [3, 3, 2, 2, 3, 3, 0, 3, 3, 3, 4, 3, 3],
      },
      {
        id: 'B',
        text: 'Choose the priority you believe has greater strategic impact, document your reasoning, and inform both stakeholders.',
        scores: [4, 3, 4, 2, 3, 4, 0, 4, 3, 2, 3, 2, 3],
      },
      {
        id: 'C',
        text: 'Bring both stakeholders together to discuss the conflict openly and reach alignment.',
        scores: [3, 2, 3, 3, 4, 3, 0, 3, 4, 4, 4, 4, 4],
      },
      {
        id: 'D',
        text: 'Attempt to partially satisfy both by splitting resources, accepting neither will be done optimally.',
        scores: [2, 2, 2, 2, 2, 1, 3, 1, 2, 2, 2, 2, 2],
      },
    ],
  },
  {
    id: 'scenario-4',
    number: 4,
    title: 'The Underperformer',
    context:
      "A team member who was once a strong contributor has been consistently underperforming for three months. You've had two informal conversations, but nothing has changed. HR suggests documentation for a performance plan.",
    question: 'What action do you take?',
    choices: [
      {
        id: 'A',
        text: 'Have a direct, compassionate conversation exploring what has changed, offering support while being clear about expectations and consequences.',
        scores: [4, 3, 3, 4, 3, 4, 0, 4, 4, 4, 4, 3, 4],
      },
      {
        id: 'B',
        text: "Begin the formal performance plan process. You've already tried the soft approach twice.",
        scores: [2, 3, 3, 1, 2, 2, 2, 3, 2, 1, 3, 2, 2],
      },
      {
        id: 'C',
        text: 'Assign them to a project better suited to their apparent current capacity while monitoring improvement.',
        scores: [3, 3, 2, 3, 3, 3, 1, 2, 3, 3, 2, 3, 3],
      },
      {
        id: 'D',
        text: "Wait another month to see if things improve. They've earned patience through past performance.",
        scores: [1, 2, 1, 2, 1, 1, 4, 0, 1, 2, 1, 1, 1],
      },
    ],
  },
  {
    id: 'scenario-5',
    number: 5,
    title: 'The Credit Question',
    context:
      'Your team delivered exceptional results on a visible project. During the executive presentation, your skip-level leader presents the work as "our department\'s achievement" without acknowledging your team specifically.',
    question: 'How do you handle this?',
    choices: [
      {
        id: 'A',
        text: "Accept it gracefully. The work speaks for itself, and those who matter know who did it.",
        scores: [3, 4, 2, 2, 2, 3, 2, 2, 2, 2, 2, 3, 2],
      },
      {
        id: 'B',
        text: "After the meeting, privately mention to your leader that you'd like your team recognized, framing it as important for their morale.",
        scores: [4, 3, 3, 3, 4, 4, 0, 3, 4, 3, 4, 3, 4],
      },
      {
        id: 'C',
        text: "Find an opportunity during the presentation to naturally mention your team's contribution without contradicting your leader.",
        scores: [3, 2, 3, 2, 3, 3, 1, 3, 3, 2, 3, 2, 3],
      },
      {
        id: 'D',
        text: "Ensure your team knows they're appreciated by celebrating with them privately, regardless of executive recognition.",
        scores: [3, 3, 3, 4, 3, 3, 1, 2, 3, 4, 2, 4, 3],
      },
    ],
  },
  {
    id: 'scenario-6',
    number: 6,
    title: 'The Difficult Feedback',
    context:
      "You receive anonymous feedback from an engagement survey suggesting that some team members find you 'unapproachable' and 'intimidating,' despite your open-door policy and genuine care for the team.",
    question: 'What is your response?',
    choices: [
      {
        id: 'A',
        text: 'Reflect deeply on where this perception might come from, then make intentional changes to your presence and communication style.',
        scores: [4, 4, 3, 3, 3, 4, 0, 3, 4, 4, 3, 4, 4],
      },
      {
        id: 'B',
        text: 'Schedule individual conversations with team members to better understand their experience and what would help.',
        scores: [4, 3, 3, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4],
      },
      {
        id: 'C',
        text: "Acknowledge the feedback publicly in a team meeting, express genuine desire to improve, and ask for direct input on how.",
        scores: [3, 2, 3, 3, 3, 3, 0, 3, 3, 4, 4, 3, 3],
      },
      {
        id: 'D',
        text: "Note the feedback but recognize that leadership sometimes requires being firm. Not everyone will find you approachable, and that's okay.",
        scores: [2, 3, 2, 1, 2, 2, 3, 2, 2, 1, 2, 2, 1],
      },
    ],
  },
  {
    id: 'scenario-7',
    number: 7,
    title: 'The Urgent Request',
    context:
      "It's Friday at 4pm. A peer leader messages asking for urgent help on a presentation due Monday, saying their team is overwhelmed. You have personal plans this weekend that you've been looking forward to.",
    question: 'How do you respond?',
    choices: [
      {
        id: 'A',
        text: "Offer to help for a defined period tonight, setting clear boundaries about what you can contribute while protecting your weekend.",
        scores: [3, 4, 3, 3, 3, 3, 0, 3, 3, 3, 3, 3, 3],
      },
      {
        id: 'B',
        text: 'Politely decline but offer to connect them with resources or team members who might be available.',
        scores: [3, 3, 2, 2, 3, 3, 1, 3, 2, 2, 3, 2, 2],
      },
      {
        id: 'C',
        text: 'Cancel your plans and help fully. Relationships and goodwill matter more than one weekend.',
        scores: [2, 1, 4, 4, 3, 2, 2, 2, 4, 3, 2, 3, 2],
      },
      {
        id: 'D',
        text: 'Ask probing questions about why this is urgent and whether the deadline can shift before committing.',
        scores: [4, 3, 2, 2, 2, 4, 0, 3, 2, 2, 3, 2, 2],
      },
    ],
  },
  {
    id: 'scenario-8',
    number: 8,
    title: 'The Organizational Change',
    context:
      "Senior leadership announces a major restructuring that will significantly impact your team's responsibilities and reporting lines. Details are vague, and your team is anxious and seeking answers you don't have.",
    question: 'How do you lead through this?',
    choices: [
      {
        id: 'A',
        text: "Be honest about what you don't know, share what you do know, and commit to transparent communication as details emerge.",
        scores: [4, 4, 2, 4, 3, 4, 0, 3, 4, 4, 4, 4, 4],
      },
      {
        id: 'B',
        text: 'Project confidence and focus the team on current work, minimizing discussion of the change until you have real information.',
        scores: [2, 3, 3, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2],
      },
      {
        id: 'C',
        text: "Advocate loudly to leadership for faster clarity, making clear the uncertainty is affecting your team's performance.",
        scores: [3, 2, 4, 3, 3, 3, 1, 4, 3, 2, 3, 2, 3],
      },
      {
        id: 'D',
        text: 'Create forums for the team to process emotions and concerns together while maintaining focus on controllable factors.',
        scores: [4, 3, 3, 4, 4, 4, 0, 3, 4, 4, 4, 4, 4],
      },
    ],
  },
  {
    id: 'scenario-9',
    number: 9,
    title: 'The Ethical Gray Area',
    context:
      "You discover a process that technically complies with policy but feels ethically questionable. It benefits the company short-term but could harm customer trust if discovered. Others have been doing it for years.",
    question: 'What do you do?',
    choices: [
      {
        id: 'A',
        text: 'Raise your concerns through proper channels, documenting your perspective while respecting that others may see it differently.',
        scores: [4, 4, 3, 2, 2, 4, 0, 4, 4, 3, 3, 3, 3],
      },
      {
        id: 'B',
        text: "If it's within policy, continue the practice but document your discomfort in case questions arise later.",
        scores: [2, 2, 2, 1, 2, 1, 4, 1, 1, 1, 2, 2, 1],
      },
      {
        id: 'C',
        text: 'Personally refuse to participate while not reporting others, and quietly change your team\'s approach.',
        scores: [3, 3, 3, 2, 2, 3, 1, 3, 3, 3, 2, 3, 3],
      },
      {
        id: 'D',
        text: 'Escalate immediately to compliance or ethics, treating this as a clear violation of company values regardless of technical policy.',
        scores: [3, 2, 4, 1, 2, 3, 0, 4, 3, 2, 3, 2, 2],
      },
    ],
  },
  {
    id: 'scenario-10',
    number: 10,
    title: 'The Talent Poaching',
    context:
      'A high-performing team member confides that they received an attractive offer from a competitor. They seem open to being convinced to stay but also genuinely excited about the opportunity.',
    question: 'How do you handle the conversation?',
    choices: [
      {
        id: 'A',
        text: 'Listen fully to understand what attracts them to the opportunity, then explore together whether those needs can be met here.',
        scores: [4, 3, 3, 4, 4, 4, 0, 3, 4, 4, 4, 4, 4],
      },
      {
        id: 'B',
        text: "Be direct that you want them to stay and immediately discuss what it would take: compensation, role, growth opportunities.",
        scores: [3, 2, 4, 2, 3, 3, 0, 4, 3, 2, 3, 3, 3],
      },
      {
        id: 'C',
        text: "Support their decision-making process without trying to influence, recognizing this is about their career, not your team.",
        scores: [3, 4, 2, 4, 2, 3, 1, 2, 3, 4, 3, 2, 3],
      },
      {
        id: 'D',
        text: 'Begin contingency planning immediately while having the retention conversation. Prepare for both outcomes.',
        scores: [4, 4, 3, 2, 3, 4, 0, 4, 3, 2, 3, 3, 3],
      },
    ],
  },
  {
    id: 'scenario-11',
    number: 11,
    title: 'The Failed Initiative',
    context:
      'A project you championed and invested significant political capital in has clearly failed. The results are visible to leadership, and some are questioning whether it was the right call.',
    question: 'How do you respond?',
    choices: [
      {
        id: 'A',
        text: 'Own the failure completely in front of leadership, share the lessons learned, and propose adjustments for moving forward.',
        scores: [4, 4, 3, 2, 3, 4, 0, 4, 4, 4, 4, 4, 4],
      },
      {
        id: 'B',
        text: 'Provide context about external factors that contributed to the outcome while accepting your role in the decision.',
        scores: [3, 3, 3, 2, 3, 3, 2, 3, 3, 2, 3, 3, 3],
      },
      {
        id: 'C',
        text: 'Focus quickly on the path forward rather than dwelling on what went wrong. Action orientation is what leadership wants.',
        scores: [2, 2, 4, 1, 2, 2, 2, 3, 2, 1, 2, 2, 2],
      },
      {
        id: 'D',
        text: 'Request time to conduct a thorough post-mortem before discussing next steps.',
        scores: [3, 4, 2, 2, 2, 3, 1, 2, 3, 3, 3, 3, 3],
      },
    ],
  },
  {
    id: 'scenario-12',
    number: 12,
    title: 'The Boundary Test',
    context:
      'An executive known for being demanding asks you to attend a meeting outside your normal scope because they "trust your judgment." Attending would mean missing a commitment to your own team.',
    question: 'What do you do?',
    choices: [
      {
        id: 'A',
        text: 'Decline respectfully, explaining your prior commitment while offering alternative ways to provide input.',
        scores: [4, 4, 2, 2, 3, 4, 0, 4, 3, 3, 4, 4, 3],
      },
      {
        id: 'B',
        text: 'Accept the invitation. Executive exposure and trust-building opportunities are valuable for your career.',
        scores: [2, 2, 3, 1, 3, 2, 2, 2, 3, 1, 2, 1, 2],
      },
      {
        id: 'C',
        text: "Try to make both work by joining the executive meeting briefly and then connecting with your team afterward.",
        scores: [3, 2, 3, 2, 3, 3, 1, 3, 3, 2, 2, 2, 2],
      },
      {
        id: 'D',
        text: 'Ask your team if they can accommodate the change, being transparent about why you would shift.',
        scores: [3, 3, 2, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3],
      },
    ],
  },
  {
    id: 'scenario-13',
    number: 13,
    title: 'The Innovation vs. Execution Tension',
    context:
      'Your team has an opportunity to experiment with a new approach that could yield significant improvements but carries execution risk. Leadership is pushing for predictable delivery.',
    question: 'How do you balance this tension?',
    choices: [
      {
        id: 'A',
        text: 'Propose a bounded experiment (small scale, clear success criteria, defined timeline) that manages risk while allowing innovation.',
        scores: [4, 4, 3, 2, 3, 4, 0, 4, 3, 3, 4, 3, 3],
      },
      {
        id: 'B',
        text: "Prioritize delivery over experimentation. There will be time to innovate after you've built more trust.",
        scores: [3, 4, 2, 2, 2, 2, 2, 3, 3, 2, 3, 3, 2],
      },
      {
        id: 'C',
        text: 'Push back on leadership, making the case that innovation is essential even if it means some delivery variation.',
        scores: [2, 2, 4, 1, 3, 3, 1, 4, 2, 2, 3, 2, 2],
      },
      {
        id: 'D',
        text: 'Run the experiment quietly within your team while maintaining delivery commitments publicly.',
        scores: [2, 2, 3, 1, 2, 2, 3, 2, 1, 1, 1, 2, 1],
      },
    ],
  },
  {
    id: 'scenario-14',
    number: 14,
    title: 'The Personal Crisis',
    context:
      "You're dealing with a significant personal challenge that's affecting your focus and energy. Your team hasn't noticed yet, but you're not operating at your best.",
    question: 'How do you manage this?',
    choices: [
      {
        id: 'A',
        text: 'Share appropriately with your leader and team that you\'re dealing with something personal, without over-disclosing, and adjust commitments accordingly.',
        scores: [4, 3, 2, 3, 3, 4, 0, 3, 4, 4, 4, 4, 4],
      },
      {
        id: 'B',
        text: 'Compartmentalize and maintain performance standards. Personal and professional should remain separate.',
        scores: [2, 4, 3, 1, 2, 2, 2, 3, 2, 1, 2, 2, 2],
      },
      {
        id: 'C',
        text: 'Take a formal leave or reduced schedule to address the situation properly before it affects your work more visibly.',
        scores: [3, 3, 2, 2, 2, 3, 0, 3, 3, 3, 2, 3, 3],
      },
      {
        id: 'D',
        text: 'Quietly delegate more to capable team members while you manage through the difficult period.',
        scores: [3, 3, 2, 2, 3, 3, 1, 2, 2, 2, 2, 3, 2],
      },
    ],
  },
  {
    id: 'scenario-15',
    number: 15,
    title: 'The Team Conflict',
    context:
      'Two strong contributors on your team have developed a personal conflict that\'s affecting team dynamics. Both have come to you separately to complain about the other.',
    question: 'How do you address this?',
    choices: [
      {
        id: 'A',
        text: 'Bring them together for a facilitated conversation focused on working relationship expectations, not personality differences.',
        scores: [4, 3, 3, 3, 4, 4, 0, 4, 4, 4, 4, 4, 4],
      },
      {
        id: 'B',
        text: 'Work with each individually to help them manage their reactions and focus on professional behavior.',
        scores: [3, 3, 2, 4, 3, 3, 1, 2, 3, 3, 3, 3, 3],
      },
      {
        id: 'C',
        text: 'Set clear expectations that personal conflict cannot affect work, then monitor closely with consequences for violations.',
        scores: [2, 3, 3, 1, 2, 2, 1, 3, 2, 1, 3, 2, 2],
      },
      {
        id: 'D',
        text: 'Restructure work to minimize their interaction while the conflict naturally resolves over time.',
        scores: [2, 3, 1, 2, 2, 2, 3, 1, 2, 2, 2, 2, 2],
      },
    ],
  },
  {
    id: 'scenario-16',
    number: 16,
    title: 'The Promotion Decision',
    context:
      'You have one promotion slot and two deserving candidates. One is slightly more qualified but may leave soon anyway. The other is loyal, steady, and staying long-term but slightly less ready.',
    question: 'How do you approach this decision?',
    choices: [
      {
        id: 'A',
        text: 'Promote the more qualified candidate based on merit, regardless of flight risk. Rewarding performance is the right signal.',
        scores: [3, 3, 3, 1, 2, 3, 1, 4, 3, 2, 3, 2, 3],
      },
      {
        id: 'B',
        text: 'Have transparent conversations with both about where they stand and what the promotion timeline looks like for each.',
        scores: [4, 3, 3, 4, 4, 4, 0, 3, 4, 4, 4, 4, 4],
      },
      {
        id: 'C',
        text: 'Promote the loyal candidate who will continue to contribute, using the promotion to accelerate their development.',
        scores: [3, 3, 2, 3, 3, 3, 2, 2, 3, 3, 2, 4, 3],
      },
      {
        id: 'D',
        text: 'Advocate for a second slot or creative solution that recognizes both contributions appropriately.',
        scores: [3, 2, 4, 3, 4, 3, 0, 3, 3, 3, 3, 4, 3],
      },
    ],
  },
  {
    id: 'scenario-17',
    number: 17,
    title: 'The Silent Resistance',
    context:
      'You\'ve introduced a new process that you believe is better for the team. There\'s no open pushback, but adoption is slow and you sense passive resistance.',
    question: 'What do you do?',
    choices: [
      {
        id: 'A',
        text: 'Create safe forums to surface concerns openly, demonstrating genuine willingness to adapt based on feedback.',
        scores: [4, 3, 3, 4, 4, 4, 0, 3, 4, 4, 4, 4, 4],
      },
      {
        id: 'B',
        text: 'Increase accountability measures. If the process is right, people need to follow it regardless of preferences.',
        scores: [2, 3, 4, 1, 2, 2, 2, 3, 2, 1, 2, 2, 2],
      },
      {
        id: 'C',
        text: 'Identify early adopters and champions to help drive adoption through peer influence rather than top-down mandate.',
        scores: [4, 3, 3, 3, 4, 4, 0, 3, 4, 3, 3, 4, 4],
      },
      {
        id: 'D',
        text: 'Re-evaluate whether the process is actually necessary. Maybe the resistance is telling you something.',
        scores: [3, 3, 2, 2, 2, 3, 1, 2, 3, 3, 3, 3, 3],
      },
    ],
  },
  {
    id: 'scenario-18',
    number: 18,
    title: 'The Information Asymmetry',
    context:
      'You learn information about upcoming changes that will affect your team, but you\'ve been asked to keep it confidential temporarily. Team members are already speculating and anxious.',
    question: 'How do you navigate this?',
    choices: [
      {
        id: 'A',
        text: 'Acknowledge that there are things you cannot share yet, validate their uncertainty, and commit to transparency when possible.',
        scores: [4, 4, 2, 4, 3, 4, 0, 3, 4, 4, 4, 4, 4],
      },
      {
        id: 'B',
        text: 'Maintain strict confidentiality without acknowledging you know anything. Protecting the process is most important.',
        scores: [2, 4, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1],
      },
      {
        id: 'C',
        text: 'Share what you can within the boundaries of confidentiality, helping manage speculation without breaking trust.',
        scores: [3, 3, 2, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3],
      },
      {
        id: 'D',
        text: 'Push leadership to communicate faster or allow you to share more. The anxiety is affecting productivity.',
        scores: [3, 2, 4, 3, 3, 3, 0, 4, 3, 3, 3, 2, 3],
      },
    ],
  },
  {
    id: 'scenario-19',
    number: 19,
    title: 'The Visible Mistake',
    context:
      'You made an error in judgment that affected a client relationship. Your team knows, your leader knows, and the client is understandably frustrated. The situation is recoverable but damaged.',
    question: 'How do you move forward?',
    choices: [
      {
        id: 'A',
        text: 'Own it completely, apologize directly to the client, share what you\'ve learned, and implement changes to prevent recurrence.',
        scores: [4, 4, 3, 3, 3, 4, 0, 4, 4, 4, 4, 4, 4],
      },
      {
        id: 'B',
        text: 'Focus primarily on the fix and future prevention. Dwelling on the mistake doesn\'t help anyone.',
        scores: [2, 3, 4, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2],
      },
      {
        id: 'C',
        text: 'Ask a colleague to help repair the relationship since your credibility with the client is damaged.',
        scores: [3, 3, 2, 2, 3, 3, 2, 2, 2, 2, 3, 3, 2],
      },
      {
        id: 'D',
        text: 'Use this as a learning moment for your team. Demonstrating how to handle mistakes builds trust and models growth.',
        scores: [4, 3, 3, 3, 4, 4, 0, 3, 4, 4, 4, 4, 4],
      },
    ],
  },
  {
    id: 'scenario-20',
    number: 20,
    title: 'The Leadership Crossroads',
    context:
      'You\'re offered a significant promotion that would mean leaving a team you\'ve built and genuinely care about. The timing feels premature. The team still needs development, and you have unfinished business.',
    question: 'How do you decide?',
    choices: [
      {
        id: 'A',
        text: 'Accept the opportunity. Your growth benefits everyone eventually, and holding yourself back isn\'t the answer.',
        scores: [3, 2, 4, 2, 3, 3, 1, 4, 3, 2, 3, 2, 3],
      },
      {
        id: 'B',
        text: 'Negotiate timing or transition support that allows you to set your team up for success before fully moving.',
        scores: [4, 4, 3, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4],
      },
      {
        id: 'C',
        text: 'Decline for now and communicate clearly what conditions would make you ready. The opportunity will return.',
        scores: [3, 4, 2, 4, 2, 3, 1, 2, 3, 3, 3, 4, 3],
      },
      {
        id: 'D',
        text: 'Seek counsel from trusted mentors about how to weigh your personal growth against team obligations.',
        scores: [4, 3, 2, 3, 3, 4, 0, 2, 3, 3, 3, 3, 3],
      },
    ],
  },
];

export default SCENARIOS;
