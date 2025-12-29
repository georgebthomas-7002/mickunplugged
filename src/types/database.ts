// Supabase Database Types
// Generated from database schema - update if schema changes

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          company: string | null;
          role: string | null;
          account_type: 'admin' | 'member';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          role?: string | null;
          account_type?: 'admin' | 'member';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          role?: string | null;
          account_type?: 'admin' | 'member';
          created_at?: string;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          created_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          member_type: 'team' | 'candidate';
          token: string;
          status: 'pending' | 'accepted' | 'expired';
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email: string;
          member_type: 'team' | 'candidate';
          token?: string;
          status?: 'pending' | 'accepted' | 'expired';
          created_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          email?: string;
          member_type?: 'team' | 'candidate';
          token?: string;
          status?: 'pending' | 'accepted' | 'expired';
          created_at?: string;
          accepted_at?: string | null;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          member_type: 'team' | 'candidate';
          joined_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          member_type: 'team' | 'candidate';
          joined_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          member_type?: 'team' | 'candidate';
          joined_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string | null;
          scores: Json;
          leadership_family: string;
          leadership_type: string;
          responses: Json | null;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id?: string | null;
          scores: Json;
          leadership_family: string;
          leadership_type: string;
          responses?: Json | null;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string | null;
          scores?: Json;
          leadership_family?: string;
          leadership_type?: string;
          responses?: Json | null;
          completed_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      member_type: 'team' | 'candidate';
      invitation_status: 'pending' | 'accepted' | 'expired';
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];

export type Invitation = Database['public']['Tables']['invitations']['Row'];
export type InvitationInsert = Database['public']['Tables']['invitations']['Insert'];
export type InvitationUpdate = Database['public']['Tables']['invitations']['Update'];

export type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];
export type OrganizationMemberInsert = Database['public']['Tables']['organization_members']['Insert'];
export type OrganizationMemberUpdate = Database['public']['Tables']['organization_members']['Update'];

export type Assessment = Database['public']['Tables']['assessments']['Row'];
export type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];
export type AssessmentUpdate = Database['public']['Tables']['assessments']['Update'];

// Extended types with relations
export interface OrganizationWithCounts extends Organization {
  member_count?: number;
  completed_count?: number;
}

export interface InvitationWithOrganization extends Invitation {
  organization: Organization;
}

export interface MemberWithProfile extends OrganizationMember {
  profile: Profile;
  assessments?: Assessment[];
}
