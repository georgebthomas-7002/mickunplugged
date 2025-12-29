// Create Organization Modal Component
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import './CreateOrganizationModal.css';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateOrganizationModal({ onClose, onCreated }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setLoading(true);
    setError('');

    try {
      console.log('Creating organization:', name.trim(), 'for user:', user.id);

      const { data, error: insertError } = await supabase
        .from('organizations')
        .insert({
          name: name.trim(),
          owner_id: user.id,
        })
        .select()
        .single();

      console.log('Create result:', data, 'error:', insertError?.message);

      if (insertError) {
        console.error('Error creating organization:', insertError);
        setError('Failed to create team. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Organization created successfully');
      setLoading(false);
      onCreated();
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Close on escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <h2 id="modal-title">Create New Team</h2>
        <p className="modal-subtitle">
          Create a team to invite members and track leadership assessments.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="team-name">Team Name</label>
            <input
              type="text"
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Leadership Team, Sales Department"
              required
              autoFocus
              maxLength={100}
            />
            <span className="form-hint">
              Choose a descriptive name for your team or department.
            </span>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn btn-primary"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrganizationModal;
