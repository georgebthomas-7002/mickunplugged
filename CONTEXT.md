# Development Context - E.Q.U.I.P. 360

This file preserves important context from development sessions. Claude should read this file at the start of new sessions or after conversation compaction.

---

## Last Updated: 2025-12-29 (Session End - 7% before auto-compact)

## Current Branch
`claude/assessment-tool-boilerplate-01JSLyUStKoFewhvitwKyNDX`

---

## Authentication System

### Method: OTP Codes (not magic links)
- Magic links were abandoned because email security scanners pre-click them
- Users receive 8-digit OTP codes via email
- Template in Supabase uses `{{ .Token }}`
- Auth flow: Enter email → Receive code → Enter code → Authenticated

### Key Files:
- `src/context/AuthContext.tsx` - Main auth state, sendOtpCode, verifyOtpCode
- `src/pages/LoginPage.tsx` - Login with OTP
- `src/pages/SignupPage.tsx` - Signup with OTP + profile creation

---

## Database Schema & RLS Policies

### Tables Created:
1. **profiles** - User profiles (auto-created by Supabase trigger)
   - Added `account_type` column: 'admin' (direct signup) or 'member' (invited)

2. **organizations** - Teams created by admins
   - owner_id references the creating user

3. **organization_members** - Links users to organizations
   - member_type: 'team' or 'candidate'
   - joined_at: Timestamp (important - must be set on insert)

4. **invitations** - Pending/accepted invitations
   - token: Unique invite token
   - status: 'pending', 'accepted', 'expired'

5. **assessments** - Completed assessments
   - organization_id: Links to organization (can be null for non-org assessments)
   - scores: 13-element array [SA, SR, M, E, SS, B, EX, D, T, PS, CQ, TS, ER]

### Required RLS Policies (run in Supabase SQL Editor):

```sql
-- PROFILES
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);

-- ORGANIZATIONS
CREATE POLICY "Anyone can read organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Users can create organizations" ON organizations FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can delete organizations" ON organizations FOR DELETE USING (auth.uid() = owner_id);

-- ORGANIZATION_MEMBERS
CREATE POLICY "Users can read organization members" ON organization_members FOR SELECT USING (true);
CREATE POLICY "Users can join organizations" ON organization_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can remove members" ON organization_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM organizations WHERE organizations.id = organization_members.organization_id AND organizations.owner_id = auth.uid())
);

-- INVITATIONS
CREATE POLICY "Anyone can read pending invitations" ON invitations FOR SELECT USING (status = 'pending');
CREATE POLICY "Users can update invitations" ON invitations FOR UPDATE USING (true) WITH CHECK (true);

-- ASSESSMENTS
CREATE POLICY "Users can insert their own assessments" ON assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read assessments" ON assessments FOR SELECT USING (true);
```

---

## Email System (Invitations)

### Provider: Resend
- API endpoint: `/api/send-invite.ts`
- From address: `noreply@equip360.io` (after domain verification)
- Currently using test sender: `onboarding@resend.dev`
- Environment variable: `RESEND_API_KEY` (set in Vercel)

### Invite Flow:
1. Admin creates invite → Token generated, saved to invitations table
2. Email sent via Resend (or copy link manually)
3. Invitee clicks link → `/invite/{token}`
4. Invitee signs up/logs in
5. Invitee accepts → Added to organization_members, invitation status = 'accepted'

---

## Key Issues Fixed

### 1. Team Creation Stuck
- **Problem**: Modal hung on "Creating..."
- **Fix**: Added `setLoading(false)` after successful insert in CreateOrganizationModal.tsx

### 2. Magic Link Not Working
- **Problem**: Email scanners pre-click links, consuming them
- **Fix**: Switched to OTP code entry system

### 3. Dashboard Loading Forever
- **Problem**: Missing database tables, RLS blocking queries
- **Fix**: Created all tables with proper RLS policies

### 4. Members Not Showing in Team View
- **Problem**: Missing `joined_at` field on insert, RLS blocking profile reads
- **Fix**: Added `joined_at: new Date().toISOString()` to member insert, added RLS for profiles

### 5. Assessments Not Linked to Organization
- **Problem**: localStorage org context lost during assessment flow
- **Fix**: Added fallback to check organization_members table for user's org

---

## Features Implemented

### Dashboard (`/dashboard`)
- Shows organizations user owns AND is a member of
- Different badges: Owner (gold), Member (blue), Candidate (green)
- User email/name displayed in header
- Create team, invite members, delete team

### Team Dashboard (`/team/{orgId}`)
- View members and their assessment status
- Pending invitations with Copy Link and Revoke buttons
- Team Insights tab (shows aggregated scores when assessments exist)
- Delete Team with confirmation modal

### Account Types (for future paid features)
- `profile.account_type = 'admin'` - Direct signups (can create teams)
- `profile.account_type = 'member'` - Invited users

---

## Pending/Known Issues

1. **Resend domain verification** - Client needs to verify equip360.io with Resend for production emails
2. **Existing members** - Members added before `joined_at` fix may need manual database update
3. **Existing assessments** - Assessments taken before org tracking fix have null organization_id
4. **Test user hubspot@georgebthomas.com** - Was invited, accepted, took assessment - may need to verify data is now showing correctly after latest fixes

## Session Summary (2025-12-29)

### What We Did This Session:
1. Cloned repo and set up project
2. Fixed team creation modal getting stuck (missing setLoading)
3. Switched from magic links to OTP codes for auth
4. Fixed 8-digit OTP code (was limited to 6)
5. Created all database tables and RLS policies
6. Added delete team functionality with confirmation
7. Added revoke invite functionality
8. Added copy invite link to pending invites list
9. Optimized dashboard loading (parallel queries)
10. Fixed dashboard to show BOTH owned teams AND teams user is member of
11. Added user email/name display in dashboard header
12. Added account_type tracking (admin vs member) for future paid features
13. Fixed organization_members insert (added joined_at)
14. Fixed assessment save to include organization_id (with fallback to membership lookup)

### SQL Commands User Needs to Run (if not already):
```sql
-- Account type column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'member';
UPDATE profiles SET account_type = 'admin' WHERE id IN (SELECT DISTINCT owner_id FROM organizations);

-- All RLS policies (see full list in Database Schema section above)
```

### Testing Notes:
- Test admin account exists in the system
- Test member: hubspot@georgebthomas.com was invited and accepted
- The member took an assessment - should now show in team insights after fixes deployed

---

## Environment Variables (Vercel)

Required:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `RESEND_API_KEY` - Resend API key for emails

Optional:
- `VITE_APP_URL` - Production URL (defaults to window.location.origin)

---

## File Structure Notes

```
src/
├── components/
│   ├── CreateOrganizationModal.tsx - Create team modal
│   └── InviteMemberModal.tsx - Invite flow with link copy
├── context/
│   ├── AuthContext.tsx - Auth state, OTP methods
│   └── AssessmentContext.tsx - Assessment state machine
├── pages/
│   ├── Dashboard.tsx - Main dashboard (owned + member orgs)
│   ├── TeamDashboard.tsx - Individual team view
│   ├── InviteAccept.tsx - Accept invitation page
│   ├── LoginPage.tsx - OTP login
│   ├── SignupPage.tsx - OTP signup with profile
│   └── ResultsPage.tsx - Assessment results + save to DB
├── services/
│   ├── invitations.ts - Create, accept, revoke invitations
│   └── assessments.ts - Save assessments, org context helpers
└── types/
    └── database.ts - Supabase table types
```

---

## Commands

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Build for production
npm run lint      # Run ESLint
```

---

*This file is auto-maintained during development sessions. Read at start of new sessions.*
