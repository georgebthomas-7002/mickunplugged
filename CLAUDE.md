# E.Q.U.I.P. 360 Assessment Tool

> **IMPORTANT FOR CLAUDE:** Before starting work, read `CONTEXT.md` in the project root. It contains:
> - Development session history and decisions made
> - Database schema and RLS policies (critical for Supabase)
> - Authentication system details (OTP codes, not magic links)
> - Issues that were fixed and how
> - Pending issues and test accounts
>
> Always read CONTEXT.md after conversation auto-compaction or at the start of a new session.

---

## Project Overview

**E.Q.U.I.P. 360** (Emotional Quotient Under Intelligent Pressure) is a leadership assessment web application that measures emotional intelligence and leadership potential through scenario-based questions. It evaluates users across 13 metrics and assigns them a Leadership Identity based on their responses.

## Tech Stack

- **React 18** - UI library with functional components and hooks
- **TypeScript** - Full type safety throughout
- **Vite** - Build tool and dev server (port 3000)
- **React Router v6** - Client-side routing
- **jsPDF + html2canvas** - PDF report generation
- **ESLint + Prettier** - Code quality and formatting

## Quick Commands

```bash
npm run dev       # Start development server on port 3000
npm run build     # Build for production (tsc -b && vite build)
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
npm run preview   # Preview production build
```

## Project Structure

```
src/
├── components/
│   └── Layout/          # Header, Layout wrapper
├── context/
│   └── AssessmentContext.tsx  # Main state management (useReducer)
├── data/
│   └── scenarios.ts     # 20 assessment scenarios with scoring
├── hooks/
│   └── useTimer.ts      # Timer hook for timed assessments
├── pages/
│   ├── HomePage.tsx     # Landing page
│   ├── StartPage.tsx    # User registration form (HubSpot integration)
│   ├── AssessmentPage.tsx  # Scenario presentation and answer selection
│   └── ResultsPage.tsx  # Results display with PDF export
├── services/
│   └── hubspot.ts       # HubSpot Forms API integration
├── styles/
│   └── index.css        # Global styles with CSS variables
├── types/
│   └── equip360.ts      # All TypeScript type definitions
└── utils/
    ├── scoring.ts       # Score calculation and leadership determination
    ├── insights.ts      # Narrative report generation
    ├── pdfGenerator.ts  # PDF export functionality
    └── helpers.ts       # Utility functions (generateId, etc.)
```

## Path Aliases

The project uses these import aliases (configured in vite.config.ts and tsconfig.json):

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@pages/*` → `src/pages/*`
- `@hooks/*` → `src/hooks/*`
- `@types/*` → `src/types/*`
- `@utils/*` → `src/utils/*`
- `@context/*` → `src/context/*`

## Assessment Framework (The "13 Metrics")

### Layer 1: EQ Pillars (5 metrics)
| Code | Name | Description |
|------|------|-------------|
| SA | Self-Awareness | Recognition of own emotions, triggers, and patterns |
| SR | Self-Regulation | Control of emotional responses and impulses |
| M | Motivation | Internal drive and persistence toward goals |
| E | Empathy | Understanding and responding to others' emotions |
| SS | Social Skill | Managing relationships and building influence |

### Layer 2: B.E.D. Factors (3 metrics)
| Code | Name | Description |
|------|------|-------------|
| B | Beliefs | Stories you tell yourself that shape your lens on pressure |
| EX | Excuses | Protection patterns or rationalizations under tension |
| D | Decisions | How boldly, clearly, and consistently you choose direction |

### Layer 3: Culture Index (5 metrics)
| Code | Name | Description |
|------|------|-------------|
| T | Trust | Ability to establish and maintain credibility |
| PS | Psychological Safety | Creating space for risk-taking without fear |
| CQ | Communication Quality | Clarity and effectiveness of messaging |
| TS | Team Stability | Consistency and reliability in team dynamics |
| ER | Emotional Ripple | Impact of your emotional state on others |

## Score Array Format

Scores are stored as a 13-element array in this order:
```typescript
type ScoreArray = [SA, SR, M, E, SS, B, EX, D, T, PS, CQ, TS, ER];
// Each value is 0-4 per scenario, max 80 per metric (4 × 20 scenarios)
```

## Leadership Families & Types

### 4 Leadership Families

| Family | Tagline | Color |
|--------|---------|-------|
| REGULATORS | Composure, Steadiness, Emotional Grounding | Blue (#0791f1) |
| CONNECTORS | Empathy, Trust, Human Intelligence | Blue (#0791f1) |
| DRIVERS | Action, Standards, Momentum | Crimson (#DC143C) |
| STRATEGISTS | Awareness, Vision, Intentionality | Gold (#C9A227) |

### 20 Leadership Types (5 per family)

**Regulators**: Grounded Commander, Anchor, Stabilizer, Responder, Guardian

**Connectors**: Empathic Strategist, Bridge Builder, Mentor, Harmonizer, Cultural Architect

**Drivers**: Catalyst, Enforcer, Optimizer, Accelerator, Standard Bearer

**Strategists**: Visionary, Architect, Analyst, Navigator, Integrator

## Key Files to Know

### `src/types/equip360.ts`
Contains ALL type definitions including:
- EQ Pillars, B.E.D. Factors, Culture Dimensions
- Leadership Families and Types with full metadata (strengths, blind spots, stress behaviors)
- Scenario, Response, Session, and Result interfaces
- Coach messages for progress encouragement

### `src/data/scenarios.ts`
Contains the 20 assessment scenarios, each with:
- Context narrative
- Question
- 4 choices (A, B, C, D), each with a 13-element score array

### `src/context/AssessmentContext.tsx`
Main state management using `useReducer`:
- User profile
- Session tracking (in-progress, completed)
- Current scenario index
- Responses collection
- localStorage persistence for session recovery

### `src/utils/scoring.ts`
- `calculateScoreBreakdown()` - Aggregates all response scores
- `determineLeadershipFamily()` - Finds dominant family based on trait patterns
- `determineLeadershipType()` - Determines specific type within family
- `getScoreLevel()` - Returns "Exceptional", "Strong", "Developing", etc.

### `src/utils/insights.ts`
Generates personalized narrative insights:
- Culture Ripple insight
- B.E.D. Profile analysis
- Pressure Pattern description
- Growth Recommendations
- "Move the Stool" one high-impact shift
- "Because Statement" motivation affirmation

### `src/services/hubspot.ts`
HubSpot Forms API integration:
- Portal ID: `48149617`
- Form GUID: `ad3d590a-2620-4b5a-8ee2-f908fe94dc7c`
- Captures: email, firstName, lastName, company, jobTitle

## Application Flow

1. **HomePage** (`/`) - Landing page with "Begin Assessment" CTA
2. **StartPage** (`/start`) - User registration form → HubSpot submission
3. **AssessmentPage** (`/assessment`) - 20 scenarios, one at a time with progress bar
4. **ResultsPage** (`/results/:id`) - Shows Leadership Identity, scores, insights, PDF export

## State Persistence

Sessions are saved to localStorage under key `equip360_session`:
- User profile
- Session data (responses, current index)
- Auto-restored on page reload if session is in-progress

## CSS Variables (from `src/styles/index.css`)

Key design tokens to maintain consistency:
```css
--color-primary: #0791f1;
--color-secondary: #6c757d;
--color-success: #28a745;
--color-gold: #C9A227;
--color-crimson: #DC143C;
--font-family-heading: 'Playfair Display', serif;
--font-family-body: 'Inter', sans-serif;
```

## PDF Export

The ResultsPage includes PDF export using:
- `jspdf` for PDF generation
- `html2canvas` for rendering HTML to canvas
- Clean white background styling in `ResultsPagePDF.css`

## Common Development Tasks

### Adding a new scenario
Edit `src/data/scenarios.ts` and add to the `SCENARIOS` array. Each choice needs a complete 13-element score array.

### Modifying leadership type logic
Edit `src/utils/scoring.ts` in `determineLeadershipType()` function.

### Changing insight text
Edit `src/utils/insights.ts` - insights are generated based on score levels and leadership types.

### Updating the registration form
Edit `src/pages/StartPage.tsx` - form fields must match HubSpot form field names.

### Styling changes
- Global styles: `src/styles/index.css`
- Page-specific: `src/pages/*.css`
- Layout: `src/components/Layout/*.css`

## Important Notes

1. **Supabase backend** - Authentication, database, and RLS policies via Supabase
2. **HubSpot integration** - Form submissions for lead capture
3. **Resend for emails** - Invitation emails via `/api/send-invite.ts`
4. **All assessment logic is client-side** - Scoring and leadership determination happen in the browser
5. **20 scenarios required** - Assessment expects exactly 20 scenarios with 4 choices each
6. **Score range is 0-4 per metric per scenario** - Max possible score per metric is 80 (4 × 20)
7. **OTP authentication** - Uses 8-digit codes, NOT magic links (email scanners break magic links)

## Deployment

The project includes `@vercel/node` in devDependencies, suggesting Vercel deployment. Build output goes to `dist/` folder.
