/**
 * Utility to get authenticated headers for external API calls.
 * Adds the current user's session token as a Bearer token.
 */
import { supabase } from '@/integrations/supabase/client';

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.warn('Could not retrieve auth session for API call:', error);
  }

  return headers;
}
