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
      // Fetch organizations owned by this user
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Organizations query result:', orgs?.length || 0, 'orgs, error:', orgsError?.message);

      if (orgsError) {
        console.error('Error fetching organizations:', orgsError);
        setLoading(false);
        return;
      }

      // If no orgs, just set empty array and stop loading
      if (!orgs || orgs.length === 0) {
        console.log('No organizations found');
        setOrganizations([]);
        setLoading(false);
        return;
      }

      // For each org, get member, assessment, and pending invite counts
      const orgsWithCounts = await Promise.all(
        orgs.map(async (org) => {
          try {
            // Get member count
            const { count: memberCount } = await supabase
              .from('organization_members')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id);

            // Get completed assessment count
            const { count: completedCount } = await supabase
              .from('assessments')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id);

            // Get pending invites count
            const { count: pendingCount } = await supabase
              .from('invitations')
              .select('*', { count: 'exact', head: true })
              .eq('organization_id', org.id)
              .eq('status', 'pending');

            return {
              ...org,
              member_count: memberCount || 0,
              completed_count: completedCount || 0,
              pending_invites: pendingCount || 0,
            };
          } catch (err) {
            console.error('Error fetching counts for org:', org.id, err);
            return {
              ...org,
              member_count: 0,
              completed_count: 0,
              pending_invites: 0,
            };
          }
        })
      );

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
            <button onClick={signOut} className="btn btn-outline btn-small">
              Sign Out
            </button>
          </div>
        </header>

        {/* Empty State */}
        {organizations.length === 0 ? (
          <div className="empty-state">
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
          </div>
        ) : (
          <>
            {/* Actions Bar */}
            <div className="dashboard-actions">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                + New Team
              </button>
            </div>

            {/* Organizations Grid */}
            <div className="organizations-grid">
              {organizations.map((org) => (
                <div key={org.id} className="organization-card">
                  <Link to={`/team/${org.id}`} className="org-card-link">
                    <div className="org-card-header">
                      <h3>{org.name}</h3>
                      <span className="org-badge">Owner</span>
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
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={(e) => {
                        e.preventDefault();
                        setInviteOrg(org);
                      }}
                    >
                      Invite Member
                    </button>
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
