// Owner Dashboard Page
// Shows user's organizations and allows creating new ones
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { CreateOrganizationModal } from '@/components/CreateOrganizationModal';
import './Dashboard.css';

interface Organization {
  id: string;
  name: string;
  created_at: string;
  member_count?: number;
  completed_count?: number;
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrganizations();
    }
  }, [user]);

  const fetchOrganizations = async () => {
    if (!user) return;

    try {
      // Fetch organizations owned by this user
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (orgsError) {
        console.error('Error fetching organizations:', orgsError);
        setLoading(false);
        return;
      }

      // For each org, get member and assessment counts
      const orgsWithCounts = await Promise.all(
        (orgs || []).map(async (org) => {
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

          return {
            ...org,
            member_count: memberCount || 0,
            completed_count: completedCount || 0,
          };
        })
      );

      setOrganizations(orgsWithCounts);
    } catch (error) {
      console.error('Error:', error);
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
                <Link
                  key={org.id}
                  to={`/team/${org.id}`}
                  className="organization-card"
                >
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
                  </div>
                  <div className="org-card-footer">
                    <span className="view-team">View Team →</span>
                  </div>
                </Link>
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
    </div>
  );
}
