// Owner Dashboard Page
// Shows user's organizations and allows creating new ones
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { CreateOrganizationModal } from '@/components/CreateOrganizationModal';
import InviteMemberModal from '@/components/InviteMemberModal';
import type { Organization } from '@/types/database';
import './Dashboard.css';

interface OrganizationWithCounts extends Organization {
  member_count?: number;
  completed_count?: number;
  pending_invites?: number;
  is_owner?: boolean;
  member_type?: 'team' | 'candidate';
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inviteOrg, setInviteOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrganizations();
    }
  }, [user]);

  const fetchOrganizations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('Fetching organizations for user:', user.id);

    try {
      // Fetch organizations owned by this user AND organizations they're a member of
      const [ownedOrgsResult, memberOrgsResult] = await Promise.all([
        // Organizations user owns
        supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false }),
        // Organizations user is a member of (not owner)
        supabase
          .from('organization_members')
          .select('organization_id, member_type, organization:organizations(*)')
          .eq('user_id', user.id),
      ]);

      const ownedOrgs = ownedOrgsResult.data || [];
      const memberOrgs = memberOrgsResult.data || [];

      console.log('Owned orgs:', ownedOrgs.length, 'Member orgs:', memberOrgs.length);

      // Combine owned and member orgs, marking ownership
      const ownedOrgIds = new Set(ownedOrgs.map(o => o.id));

      // Add owned orgs with is_owner flag
      const allOrgs: OrganizationWithCounts[] = ownedOrgs.map(org => ({
        ...org,
        is_owner: true,
      }));

      // Add member orgs (excluding ones user owns)
      memberOrgs.forEach((membership) => {
        const org = membership.organization as unknown as Organization;
        if (!ownedOrgIds.has(membership.organization_id) && org) {
          allOrgs.push({
            ...org,
            is_owner: false,
            member_type: membership.member_type as 'team' | 'candidate',
          });
        }
      });

      // If no orgs, just set empty array and stop loading
      if (allOrgs.length === 0) {
        console.log('No organizations found');
        setOrganizations([]);
        setLoading(false);
        return;
      }

      const orgs = allOrgs;

      // Fetch all counts in parallel for better performance
      const orgIds = orgs.map(org => org.id);

      // Run all count queries in parallel
      const [memberCounts, assessmentCounts, inviteCounts] = await Promise.all([
        // Get member counts for all orgs at once
        supabase
          .from('organization_members')
          .select('organization_id', { count: 'exact' })
          .in('organization_id', orgIds),
        // Get assessment counts for all orgs at once
        supabase
          .from('assessments')
          .select('organization_id', { count: 'exact' })
          .in('organization_id', orgIds),
        // Get pending invite counts for all orgs at once
        supabase
          .from('invitations')
          .select('organization_id', { count: 'exact' })
          .in('organization_id', orgIds)
          .eq('status', 'pending'),
      ]);

      // Create count maps for O(1) lookup
      const memberCountMap = new Map<string, number>();
      const assessmentCountMap = new Map<string, number>();
      const inviteCountMap = new Map<string, number>();

      // Count members per org from raw data
      (memberCounts.data || []).forEach((row: { organization_id: string }) => {
        const orgId = row.organization_id;
        memberCountMap.set(orgId, (memberCountMap.get(orgId) || 0) + 1);
      });

      // Count assessments per org from raw data
      (assessmentCounts.data || []).forEach((row: { organization_id: string }) => {
        const orgId = row.organization_id;
        assessmentCountMap.set(orgId, (assessmentCountMap.get(orgId) || 0) + 1);
      });

      // Count invites per org from raw data
      (inviteCounts.data || []).forEach((row: { organization_id: string }) => {
        const orgId = row.organization_id;
        inviteCountMap.set(orgId, (inviteCountMap.get(orgId) || 0) + 1);
      });

      // Merge counts with organizations
      const orgsWithCounts = orgs.map((org) => ({
        ...org,
        member_count: memberCountMap.get(org.id) || 0,
        completed_count: assessmentCountMap.get(org.id) || 0,
        pending_invites: inviteCountMap.get(org.id) || 0,
      }));

      console.log('Organizations with counts:', orgsWithCounts.length);
      setOrganizations(orgsWithCounts);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationCreated = () => {
    fetchOrganizations();
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Dashboard</h1>
            <p className="welcome-text">
              Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
            </p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              {profile?.first_name && profile?.last_name && (
                <span className="user-name">{profile.first_name} {profile.last_name}</span>
              )}
            </div>
            <button onClick={signOut} className="btn btn-outline btn-small">
              Sign Out
            </button>
          </div>
        </header>

        {/* Empty State */}
        {organizations.length === 0 ? (
          <div className="empty-state">
            {profile?.account_type === 'admin' ? (
              <>
                <div className="empty-state-icon">👥</div>
                <h2>Create Your First Team</h2>
                <p>
                  Get started by creating a team. You'll be able to invite members,
                  track assessments, and view aggregated leadership insights.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  Create Your First Team
                </button>
              </>
            ) : (
              <>
                <div className="empty-state-icon">📝</div>
                <h2>Welcome to E.Q.U.I.P. 360</h2>
                <p>
                  You're set up as a team member. Take the leadership assessment
                  to discover your Leadership Identity and contribute to your team's insights.
                </p>
                <Link to="/start" className="btn btn-primary">
                  Take Your Assessment
                </Link>
                <div className="upgrade-prompt">
                  <p>Want to create your own team?</p>
                  <Link to="/upgrade" className="link-button">
                    Upgrade to Admin Account
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Actions Bar */}
            <div className="dashboard-actions">
              {profile?.account_type === 'admin' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  + New Team
                </button>
              )}
              {profile?.account_type === 'member' && (
                <Link to="/start" className="btn btn-primary">
                  Take Assessment
                </Link>
              )}
            </div>

            {/* Organizations Grid */}
            <div className="organizations-grid">
              {organizations.map((org) => (
                <div key={org.id} className="organization-card">
                  <Link to={`/team/${org.id}`} className="org-card-link">
                    <div className="org-card-header">
                      <h3>{org.name}</h3>
                      <span className={`org-badge ${org.is_owner ? 'owner' : org.member_type}`}>
                        {org.is_owner ? 'Owner' : org.member_type === 'candidate' ? 'Candidate' : 'Member'}
                      </span>
                    </div>
                    <div className="org-card-stats">
                      <div className="stat">
                        <span className="stat-value">{org.member_count}</span>
                        <span className="stat-label">Members</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{org.completed_count}</span>
                        <span className="stat-label">Completed</span>
                      </div>
                      {(org.pending_invites ?? 0) > 0 && (
                        <div className="stat pending">
                          <span className="stat-value">{org.pending_invites}</span>
                          <span className="stat-label">Pending</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="org-card-footer">
                    {org.is_owner ? (
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={(e) => {
                          e.preventDefault();
                          setInviteOrg(org);
                        }}
                      >
                        Invite Member
                      </button>
                    ) : org.member_type === 'candidate' ? (
                      <Link to="/start" className="btn btn-primary btn-small">
                        Take Assessment
                      </Link>
                    ) : (
                      <span className="member-role">Team Member</span>
                    )}
                    <Link to={`/team/${org.id}`} className="view-team">
                      View Team →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Quick Links */}
        <div className="dashboard-quick-links">
          <h3>Quick Actions</h3>
          <div className="quick-links-grid">
            <Link to="/start" className="quick-link">
              <span className="quick-link-icon">📝</span>
              <span>Take Assessment</span>
            </Link>
            <Link to="/" className="quick-link">
              <span className="quick-link-icon">🏠</span>
              <span>Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Create Organization Modal */}
      {showCreateModal && (
        <CreateOrganizationModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleOrganizationCreated}
        />
      )}

      {/* Invite Member Modal */}
      {inviteOrg && (
        <InviteMemberModal
          organization={inviteOrg}
          onClose={() => setInviteOrg(null)}
          onInviteSent={() => fetchOrganizations()}
        />
      )}
    </div>
  );
}
