import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AssessmentResult, ScoreBreakdown } from '@/types/equip360';

const ORG_CONTEXT_KEY = 'pending_assessment_org';

export interface OrganizationContext {
  organizationId: string;
  organizationName: string;
}

/**
 * Get the organization context from localStorage (set by invite acceptance)
 */
export function getOrganizationContext(): OrganizationContext | null {
  try {
    const stored = localStorage.getItem(ORG_CONTEXT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse org context:', e);
  }
  return null;
}

/**
 * Set the organization context (used by invite acceptance)
 */
export function setOrganizationContext(context: OrganizationContext): void {
  try {
    localStorage.setItem(ORG_CONTEXT_KEY, JSON.stringify(context));
  } catch (e) {
    console.error('Failed to save org context:', e);
  }
}

/**
 * Clear the organization context
 */
export function clearOrganizationContext(): void {
  try {
    localStorage.removeItem(ORG_CONTEXT_KEY);
  } catch (e) {
    console.error('Failed to clear org context:', e);
  }
}

/**
 * Convert ScoreBreakdown to 13-element array for database storage
 */
function scoresToArray(scores: ScoreBreakdown): number[] {
  return [
    scores.eq.SA,
    scores.eq.SR,
    scores.eq.M,
    scores.eq.E,
    scores.eq.SS,
    scores.bed.B,
    scores.bed.EX,
    scores.bed.D,
    scores.culture.T,
    scores.culture.PS,
    scores.culture.CQ,
    scores.culture.TS,
    scores.culture.ER,
  ];
}

export interface SaveAssessmentParams {
  userId: string;
  result: AssessmentResult;
  organizationId?: string;
  responses?: unknown[];
}

export interface SaveAssessmentResult {
  success: boolean;
  assessmentId?: string;
  error?: string;
}

/**
 * Save an assessment result to Supabase
 */
export async function saveAssessment({
  userId,
  result,
  organizationId,
  responses,
}: SaveAssessmentParams): Promise<SaveAssessmentResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const scoresArray = scoresToArray(result.scores);

    const { data, error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        organization_id: organizationId || null,
        scores: scoresArray,
        leadership_family: result.leadershipFamily,
        leadership_type: result.leadershipType,
        responses: responses || null,
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to save assessment:', error);
      return { success: false, error: error.message };
    }

    // Clear org context after successful save
    if (organizationId) {
      clearOrganizationContext();
    }

    return { success: true, assessmentId: data?.id };
  } catch (err) {
    console.error('Error saving assessment:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get assessments for a user
 */
export async function getUserAssessments(userId: string) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch assessments:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if user has completed an assessment for an organization
 */
export async function hasCompletedAssessmentForOrg(
  userId: string,
  organizationId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { count, error } = await supabase
    .from('assessments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Failed to check assessment:', error);
    return false;
  }

  return (count || 0) > 0;
}
