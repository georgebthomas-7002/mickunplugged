// Team Dashboard Page
// Shows organization members, their assessment status, and aggregated metrics
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import InviteMemberModal from '@/components/InviteMemberModal';
import { revokeInvitation } from '@/services/invitations';
import type { Organization, Profile, Assessment, Invitation } from '@/types/database';
import {
  LEADERSHIP_FAMILIES,
  EQ_PILLARS,
  BED_FACTORS,
  CULTURE_DIMENSIONS,
  type LeadershipFamilyCode,
} from '@/types/equip360';
import './TeamDashboard.css';

interface MemberWithAssessment {
  id: string;
  user_id: string;
  member_type: 'team' | 'candidate';
  joined_at: string;
  profile: Profile;
  assessment?: Assessment;
}

interface AggregatedMetrics {
  totalMembers: number;
  completedAssessments: number;
  pendingInvites: number;
  familyDistribution: Record<string, number>;
  averageScores: {
    eq: { SA: number; SR: number; M: number; E: number; SS: number };
    bed: { B: number; EX: number; D: number };
    culture: { T: number; PS: number; CQ: number; TS: number; ER: number };
  };
}

export default function TeamDashboard() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<MemberWithAssessment[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invitation[]>([]);
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'insights'>('members');

  useEffect(() => {
    if (orgId && user) {
      fetchTeamData();
    }
  }, [orgId, user]);

  const fetchTeamData = async () => {
    if (!orgId || !user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (orgError || !org) {
        setError('Organization not found');
        setLoading(false);
        return;
      }

      // Check if user is owner or member
      const isOwner = org.owner_id === user.id;
      if (!isOwner) {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('id')
          .eq('organization_id', orgId)
          .eq('user_id', user.id)
          .single();

        if (!membership) {
          setError('You do not have access to this team');
          setLoading(false);
          return;
        }
      }

      setOrganization(org as Organization);

      // Fetch members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select(
          `
          id,
          user_id,
          member_type,
          joined_at,
          profile:profiles(*)
        `
        )
        .eq('organization_id', orgId);

      if (membersError) {
        console.error('Error fetching members:', membersError);
      }

      // Fetch assessments for this organization
      const { data: assessmentsData } = await supabase
        .from('assessments')
        .select('*')
        .eq('organization_id', orgId);

      // Map assessments to members
      const assessmentsByUser = new Map<string, Assessment>();
      (assessmentsData || []).forEach((a) => {
        assessmentsByUser.set(a.user_id, a as Assessment);
      });

      const membersWithAssessments: MemberWithAssessment[] = (membersData || []).map((m) => ({
        id: m.id,
        user_id: m.user_id,
        member_type: m.member_type as 'team' | 'candidate',
        joined_at: m.joined_at,
        profile: m.profile as unknown as Profile,
        assessment: assessmentsByUser.get(m.user_id),
      }));

      setMembers(membersWithAssessments);

      // Fetch pending invitations
      const { data: invitesData } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', orgId)
        .eq('status', 'pending');

      setPendingInvites((invitesData as Invitation[]) || []);

      // Calculate aggregated metrics
      const completedAssessments = membersWithAssessments.filter((m) => m.assessment);
      const aggregated = calculateAggregatedMetrics(
        membersWithAssessments,
        completedAssessments,
        (invitesData as Invitation[]) || []
      );
      setMetrics(aggregated);
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAggregatedMetrics = (
    allMembers: MemberWithAssessment[],
    withAssessments: MemberWithAssessment[],
    invites: Invitation[]
  ): AggregatedMetrics => {
    const familyDistribution: Record<string, number> = {};
    const scoreAccumulator = {
      eq: { SA: 0, SR: 0, M: 0, E: 0, SS: 0 },
      bed: { B: 0, EX: 0, D: 0 },
      culture: { T: 0, PS: 0, CQ: 0, TS: 0, ER: 0 },
    };

    withAssessments.forEach((m) => {
      if (m.assessment) {
        // Count leadership families
        const family = m.assessment.leadership_family;
        familyDistribution[family] = (familyDistribution[family] || 0) + 1;

        // Accumulate scores
        const scores = m.assessment.scores as number[];
        if (Array.isArray(scores) && scores.length === 13) {
          scoreAccumulator.eq.SA += scores[0];
          scoreAccumulator.eq.SR += scores[1];
          scoreAccumulator.eq.M += scores[2];
          scoreAccumulator.eq.E += scores[3];
          scoreAccumulator.eq.SS += scores[4];
          scoreAccumulator.bed.B += scores[5];
          scoreAccumulator.bed.EX += scores[6];
          scoreAccumulator.bed.D += scores[7];
          scoreAccumulator.culture.T += scores[8];
          scoreAccumulator.culture.PS += scores[9];
          scoreAccumulator.culture.CQ += scores[10];
          scoreAccumulator.culture.TS += scores[11];
          scoreAccumulator.culture.ER += scores[12];
        }
      }
    });

    const count = withAssessments.length || 1;
    const averageScores = {
      eq: {
        SA: Math.round(scoreAccumulator.eq.SA / count),
        SR: Math.round(scoreAccumulator.eq.SR / count),
        M: Math.round(scoreAccumulator.eq.M / count),
        E: Math.round(scoreAccumulator.eq.E / count),
        SS: Math.round(scoreAccumulator.eq.SS / count),
      },
      bed: {
        B: Math.round(scoreAccumulator.bed.B / count),
        EX: Math.round(scoreAccumulator.bed.EX / count),
        D: Math.round(scoreAccumulator.bed.D / count),
      },
      culture: {
        T: Math.round(scoreAccumulator.culture.T / count),
        PS: Math.round(scoreAccumulator.culture.PS / count),
        CQ: Math.round(scoreAccumulator.culture.CQ / count),
        TS: Math.round(scoreAccumulator.culture.TS / count),
        ER: Math.round(scoreAccumulator.culture.ER / count),
      },
    };

    return {
      totalMembers: allMembers.length,
      completedAssessments: withAssessments.length,
      pendingInvites: invites.length,
      familyDistribution,
      averageScores,
    };
  };

  const getFamilyColor = (family: string): string => {
    const familyData = LEADERSHIP_FAMILIES[family as LeadershipFamilyCode];
    return familyData?.color || '#666';
  };

  const getScoreLevel = (score: number, max: number = 80): string => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'exceptional';
    if (percentage >= 60) return 'strong';
    if (percentage >= 40) return 'developing';
    return 'emerging';
  };

  const handleDeleteTeam = async () => {
    if (!orgId || !organization) return;

    setDeleting(true);
    try {
      // Delete the organization - RLS policies will handle cascading or we delete manually
      // First delete invitations
      await supabase
        .from('invitations')
        .delete()
        .eq('organization_id', orgId);

      // Delete organization members
      await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', orgId);

      // Delete assessments for this org
      await supabase
        .from('assessments')
        .delete()
        .eq('organization_id', orgId);

      // Finally delete the organization
      const { error: deleteError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (deleteError) {
        console.error('Error deleting team:', deleteError);
        alert('Failed to delete team. Please try again.');
        setDeleting(false);
        return;
      }

      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Failed to delete team. Please try again.');
      setDeleting(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    setRevokingId(inviteId);
    try {
      const success = await revokeInvitation(inviteId);
      if (success) {
        // Remove from local state
        setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
        // Update metrics
        if (metrics) {
          setMetrics({
            ...metrics,
            pendingInvites: metrics.pendingInvites - 1,
          });
        }
      } else {
        alert('Failed to revoke invitation. Please try again.');
      }
    } catch (err) {
      console.error('Error revoking invite:', err);
      alert('Failed to revoke invitation. Please try again.');
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyInviteLink = async (token: string, inviteId: string) => {
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const inviteLink = `${appUrl}/invite/${token}`;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedInviteId(inviteId);
      setTimeout(() => setCopiedInviteId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="team-dashboard">
        <div className="team-loading">
          <div className="loading-spinner" />
          <p>Loading team data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-dashboard">
        <div className="team-error">
          <div className="error-icon">!</div>
          <h2>Access Error</h2>
          <p>{error}</p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!organization || !metrics) {
    return null;
  }

  const isOwner = organization.owner_id === user?.id;

  return (
    <div className="team-dashboard">
      <div className="team-container">
        {/* Header */}
        <header className="team-header">
          <div className="header-nav">
            <button onClick={() => navigate('/dashboard')} className="back-link">
              ← Back to Dashboard
            </button>
          </div>
          <div className="header-content">
            <div className="header-left">
              <h1>{organization.name}</h1>
              <p className="team-subtitle">Team Dashboard</p>
            </div>
            {isOwner && (
              <div className="header-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowInviteModal(true)}
                >
                  + Invite Member
                </button>
                <button
                  className="btn btn-outline btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Team
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <span className="stat-value">{metrics.totalMembers}</span>
            <span className="stat-label">Team Members</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{metrics.completedAssessments}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {metrics.totalMembers > 0
                ? Math.round((metrics.completedAssessments / metrics.totalMembers) * 100)
                : 0}
              %
            </span>
            <span className="stat-label">Completion Rate</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-value">{metrics.pendingInvites}</span>
            <span className="stat-label">Pending Invites</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Team Members
          </button>
          {isOwner && (
            <button
              className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
              disabled={metrics.completedAssessments === 0}
            >
              Team Insights
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'members' || !isOwner ? (
          <div className="members-section">
            {/* Pending Invitations */}
            {pendingInvites.length > 0 && isOwner && (
              <div className="pending-invites">
                <h3>Pending Invitations</h3>
                <div className="invite-list">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="invite-item">
                      <span className="invite-email">{invite.email}</span>
                      <span className={`invite-type ${invite.member_type}`}>
                        {invite.member_type === 'candidate' ? 'Candidate' : 'Team'}
                      </span>
                      <span className="invite-date">
                        Sent {new Date(invite.created_at).toLocaleDateString()}
                      </span>
                      <div className="invite-actions">
                        <button
                          className="btn btn-small btn-text"
                          onClick={() => handleCopyInviteLink(invite.token, invite.id)}
                        >
                          {copiedInviteId === invite.id ? 'Copied!' : 'Copy Link'}
                        </button>
                        <button
                          className="btn btn-small btn-text-danger"
                          onClick={() => handleRevokeInvite(invite.id)}
                          disabled={revokingId === invite.id}
                        >
                          {revokingId === invite.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members List */}
            {members.length === 0 ? (
              <div className="empty-members">
                <p>No team members yet. Invite people to join your team!</p>
                {isOwner && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowInviteModal(true)}
                  >
                    Invite First Member
                  </button>
                )}
              </div>
            ) : (
              <div className="members-grid">
                {members.map((member) => (
                  <div key={member.id} className="member-card">
                    <div className="member-info">
                      <div className="member-avatar">
                        {member.profile?.first_name?.[0] || member.profile?.email?.[0] || '?'}
                      </div>
                      <div className="member-details">
                        <h4>
                          {member.profile?.first_name && member.profile?.last_name
                            ? `${member.profile.first_name} ${member.profile.last_name}`
                            : member.profile?.email || 'Unknown'}
                        </h4>
                        <span className="member-email">{member.profile?.email}</span>
                        <span className={`member-type ${member.member_type}`}>
                          {member.member_type === 'candidate' ? 'Candidate' : 'Team Member'}
                        </span>
                      </div>
                    </div>

                    {member.assessment ? (
                      <div className="member-assessment">
                        <div
                          className="leadership-badge"
                          style={{ borderColor: getFamilyColor(member.assessment.leadership_family) }}
                        >
                          <span
                            className="family-name"
                            style={{ color: getFamilyColor(member.assessment.leadership_family) }}
                          >
                            {member.assessment.leadership_family}
                          </span>
                          <span className="type-name">{member.assessment.leadership_type}</span>
                        </div>
                        <span className="completed-date">
                          Completed {new Date(member.assessment.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="member-pending">
                        <span className="pending-badge">Assessment Pending</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="insights-section">
            {metrics.completedAssessments === 0 ? (
              <div className="no-insights">
                <p>Team insights will appear once members complete their assessments.</p>
              </div>
            ) : (
              <>
                {/* Leadership Family Distribution */}
                <div className="insight-card">
                  <h3>Leadership Family Distribution</h3>
                  <div className="family-distribution">
                    {Object.entries(LEADERSHIP_FAMILIES).map(([code, family]) => {
                      const count = metrics.familyDistribution[code] || 0;
                      const percentage =
                        metrics.completedAssessments > 0
                          ? Math.round((count / metrics.completedAssessments) * 100)
                          : 0;
                      return (
                        <div key={code} className="family-bar">
                          <div className="family-info">
                            <span className="family-name" style={{ color: family.color }}>
                              {family.name}
                            </span>
                            <span className="family-count">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="bar-container">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: family.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Average EQ Scores */}
                <div className="insight-card">
                  <h3>Team EQ Profile (Averages)</h3>
                  <div className="scores-grid">
                    {Object.entries(EQ_PILLARS).map(([code, pillar]) => {
                      const score =
                        metrics.averageScores.eq[code as keyof typeof metrics.averageScores.eq];
                      const level = getScoreLevel(score);
                      return (
                        <div key={code} className={`score-item ${level}`}>
                          <div className="score-header">
                            <span className="score-code">{code}</span>
                            <span className="score-name">{pillar.name}</span>
                          </div>
                          <div className="score-bar">
                            <div
                              className="score-fill"
                              style={{ width: `${(score / 80) * 100}%` }}
                            />
                          </div>
                          <span className="score-value">{score}/80</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Average B.E.D. Scores */}
                <div className="insight-card">
                  <h3>Team B.E.D. Profile (Averages)</h3>
                  <div className="scores-grid">
                    {Object.entries(BED_FACTORS).map(([code, factor]) => {
                      const score =
                        metrics.averageScores.bed[code as keyof typeof metrics.averageScores.bed];
                      const level = getScoreLevel(score);
                      return (
                        <div key={code} className={`score-item ${level}`}>
                          <div className="score-header">
                            <span className="score-code">{code}</span>
                            <span className="score-name">{factor.name}</span>
                          </div>
                          <div className="score-bar">
                            <div
                              className="score-fill"
                              style={{ width: `${(score / 80) * 100}%` }}
                            />
                          </div>
                          <span className="score-value">{score}/80</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Average Culture Scores */}
                <div className="insight-card">
                  <h3>Team Culture Index (Averages)</h3>
                  <div className="scores-grid">
                    {Object.entries(CULTURE_DIMENSIONS).map(([code, dimension]) => {
                      const score =
                        metrics.averageScores.culture[
                          code as keyof typeof metrics.averageScores.culture
                        ];
                      const level = getScoreLevel(score);
                      return (
                        <div key={code} className={`score-item ${level}`}>
                          <div className="score-header">
                            <span className="score-code">{code}</span>
                            <span className="score-name">{dimension.name}</span>
                          </div>
                          <div className="score-bar">
                            <div
                              className="score-fill"
                              style={{ width: `${(score / 80) * 100}%` }}
                            />
                          </div>
                          <span className="score-value">{score}/80</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && organization && (
        <InviteMemberModal
          organization={organization}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={() => fetchTeamData()}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Team?</h2>
            <p className="delete-warning">
              Are you sure you want to delete <strong>{organization?.name}</strong>?
            </p>
            <p className="delete-details">
              This will permanently delete:
            </p>
            <ul className="delete-list">
              <li>All team members ({metrics?.totalMembers || 0})</li>
              <li>All assessments ({metrics?.completedAssessments || 0})</li>
              <li>All pending invitations ({metrics?.pendingInvites || 0})</li>
            </ul>
            <p className="delete-irreversible">This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteTeam}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
