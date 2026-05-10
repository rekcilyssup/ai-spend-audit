import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn('Supabase not configured - set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return null;
  }

  supabase = createClient(url, anonKey);
  return supabase;
}

export interface LeadRecord {
  id?: number;
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  audit_id: string;
  created_at?: string;
}

export async function saveLead(data: Omit<LeadRecord, 'id' | 'created_at'>): Promise<boolean> {
  const client = getSupabase();
  if (!client) {
    // Fallback to localStorage if Supabase not configured
    if (typeof window !== 'undefined') {
      const leads = JSON.parse(localStorage.getItem('credex-leads') || '[]');
      leads.push({ ...data, created_at: new Date().toISOString() });
      localStorage.setItem('credex-leads', JSON.stringify(leads));
    }
    return true;
  }

  const { error } = await client
    .from('leads')
    .insert([{
      email: data.email,
      company_name: data.company_name || null,
      role: data.role || null,
      team_size: data.team_size || null,
      audit_id: data.audit_id,
    }]);

  if (error) {
    console.error('Failed to save lead:', error);
    return false;
  }

  return true;
}
