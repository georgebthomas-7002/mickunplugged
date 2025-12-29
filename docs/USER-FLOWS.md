# E.Q.U.I.P. 360 User Flows

This document outlines the two primary user journeys for E.Q.U.I.P. 360:
1. **Individual Assessment** - Taking the assessment independently
2. **Team Assessment** - Creating a team and inviting members

---

## Flow 1: Individual Assessment (Self-Guided)

This is the simplest flow for someone who just wants to take the assessment for themselves.

### Steps:

#### 1. Start at Homepage
- **URL:** `/`
- User lands on the E.Q.U.I.P. 360 homepage
- Sees overview of the assessment and its benefits
- Clicks **"Begin Assessment"** button

#### 2. Registration Form
- **URL:** `/start`
- User fills out the registration form:
  - Email Address (required)
  - First Name (required)
  - Last Name (required)
  - Company (optional)
  - Job Title (optional)
- Clicks **"Start Assessment"**
- Data is submitted to HubSpot for lead capture (non-blocking)

#### 3. Complete the Assessment
- **URL:** `/assessment/equip360`
- User progresses through 20 scenario-based questions
- Each scenario presents 4 response options (A, B, C, D)
- Progress is auto-saved to browser localStorage
- User can refresh/return and resume where they left off
- Progress bar shows completion percentage

#### 4. View Results
- **URL:** `/results/:id`
- After answering all 20 scenarios, results are calculated
- User sees their complete Leadership Intelligence Report:
  - Leadership Family (Regulators, Connectors, Drivers, or Strategists)
  - Leadership Identity Type (one of 20 specific types)
  - Score breakdown across 13 metrics
  - EQ Pillars analysis
  - B.E.D. Profile insights
  - Culture Impact Index
  - Personalized recommendations
  - 30-Day Action Plan
- PDF is auto-generated and uploaded to HubSpot
- User can print results

### Key Points:
- No account required
- Results are shown immediately
- Data is captured in HubSpot for follow-up
- Session data stored in browser only

---

## Flow 2: Team Assessment (Leader/Admin Flow)

This flow is for team leaders, HR professionals, or managers who want to invite their team to take the assessment and view aggregated results.

### Phase A: Account Setup

#### 1. Create an Account
- **URL:** `/signup`
- User fills out registration form:
  - Email Address
  - First Name
  - Last Name
  - Company
  - Role/Job Title
- Clicks **"Create Account"**
- Magic link is sent to their email
- Data also submitted to HubSpot

#### 2. Verify Email
- User checks their email inbox
- Clicks the magic link
- **URL:** `/auth/callback` (handles verification)
- User is automatically redirected to Dashboard

### Phase B: Team Creation

#### 3. Access Dashboard
- **URL:** `/dashboard`
- Shows welcome message and empty state
- Prompts user to **"Create Your First Team"**

#### 4. Create a Team
- Clicks **"+ New Team"** or **"Create Your First Team"**
- Modal appears asking for team name
- Enters team/organization name (e.g., "Leadership Team Q1 2025")
- Clicks **"Create Team"**
- Team appears on dashboard with stats:
  - 0 Members
  - 0 Completed

### Phase C: Inviting Team Members

#### 5. Invite Members
- From Dashboard, clicks **"Invite Member"** button on a team card
- OR from Team Dashboard, clicks **"+ Invite Member"**
- Modal appears with invitation form:
  - Email Address (required)
  - Member Type selection:
    - **Assessment Candidate** - Will complete the assessment
    - **Team Member** - Can view team results and manage assessments

#### 6. Send Invitation
- Clicks **"Send Invitation"**
- Invitation email is sent via Resend
- Success modal shows:
  - Confirmation message
  - Invite link (can copy manually if email fails)
  - Option to **"Invite Another"** or **"Done"**

### Phase D: Monitoring Progress

#### 7. View Team Dashboard
- **URL:** `/team/:orgId`
- Click team card or **"View Team →"** from Dashboard
- See real-time stats:
  - Total team members
  - Completed assessments count
  - Completion rate percentage
  - Pending invites count

#### 8. Members Tab
- View all team members with their status:
  - Name and email
  - Member type (Candidate/Team)
  - Assessment status (Completed or Pending)
  - If completed: Leadership Family and Type displayed
- View pending invitations list

#### 9. Team Insights Tab
- Available once at least 1 member has completed
- Shows aggregated team data:
  - **Leadership Family Distribution** - Visual breakdown of team composition
  - **Team EQ Profile** - Average scores across 5 EQ pillars
  - **Team B.E.D. Profile** - Average Beliefs, Excuses, Decisions scores
  - **Team Culture Index** - Average Trust, Psych Safety, Communication, etc.

---

## Flow 3: Invited Team Member (Candidate Flow)

This is the flow for someone who received an invitation to take the assessment for a specific team.

### Steps:

#### 1. Receive Invitation
- Email arrives with subject like "You're invited to complete an E.Q.U.I.P. 360 Assessment"
- Email shows:
  - Organization name that invited them
  - Brief description of the assessment
  - **"Start Assessment"** button

#### 2. Click Invitation Link
- **URL:** `/invite/:token`
- Page shows invitation details:
  - Organization name
  - Whether they're a Candidate or Team Member
  - Assessment overview (for candidates)
- If not logged in, shows **"Create Account"** and **"Sign In"** options

#### 3. Create Account / Sign In
- New users click **"Create Account"** → `/signup`
- Existing users click **"Sign In"** → `/login`
- After authentication, automatically redirected back
- Invitation is accepted automatically

#### 4. Take Assessment (Candidates Only)
- Redirected to `/start`
- **Banner appears:** "Taking assessment for [Organization Name]"
- Complete registration form (may pre-fill some fields)
- Take the 20-scenario assessment
- Results are automatically linked to the organization
- Team leader can now see their results on Team Dashboard

#### 5. Access Dashboard (Team Members Only)
- Redirected to `/dashboard`
- Can see organizations they belong to
- Can view team dashboards for their teams

---

## Quick Reference: URLs

| URL | Purpose | Access |
|-----|---------|--------|
| `/` | Homepage | Public |
| `/start` | Assessment registration | Public |
| `/assessment/equip360` | Take assessment | Public |
| `/results/:id` | View results | Public |
| `/login` | Sign in | Public |
| `/signup` | Create account | Public |
| `/auth/callback` | Magic link handler | Public |
| `/invite/:token` | Accept invitation | Public |
| `/dashboard` | User dashboard | Authenticated |
| `/team/:orgId` | Team dashboard | Authenticated (owner/member) |

---

## Quick Reference: User Types

| Type | Can Take Assessment | Can Create Teams | Can Invite | Can View Team Insights |
|------|--------------------|--------------------|------------|------------------------|
| Anonymous User | Yes | No | No | No |
| Registered User | Yes | Yes | Yes (own teams) | Yes (own teams) |
| Invited Candidate | Yes (for org) | No | No | No |
| Invited Team Member | Yes | No | No | Yes (their team) |

---

## Environment Requirements

For the team features to work, ensure these are configured:

```env
# Supabase (Authentication & Database)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App URL (for invite links)
VITE_APP_URL=https://your-domain.com

# Resend (Email Invitations)
RESEND_API_KEY=re_your_api_key
```

---

## Database Tables Required

The following Supabase tables must exist:

1. **profiles** - User profile data
2. **organizations** - Teams/organizations
3. **organization_members** - Team membership
4. **invitations** - Pending/accepted invites
5. **assessments** - Completed assessment results

See Phase 1 documentation for full schema.
