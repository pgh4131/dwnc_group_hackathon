import { createClient, isSupabaseConfigured } from '../utils/supabase/client.js';

export async function getCurrentSession() {
  if (!isSupabaseConfigured) {
    return { session: null, error: 'Supabase 환경 변수가 설정되지 않았습니다.' };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  return {
    session: data.session,
    error: error?.message || null,
  };
}

export async function getAccountType(session) {
  if (!session?.user) {
    return null;
  }

  const metadataAccountType = session.user.user_metadata?.account_type;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) {
    return metadataAccountType || null;
  }

  return data?.account_type || metadataAccountType || null;
}

export function subscribeToAuthChanges(callback) {
  if (!isSupabaseConfigured) {
    return () => {};
  }

  const supabase = createClient();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => data.subscription.unsubscribe();
}

export async function signInWithEmail({ email, password }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export async function signUpWithEmail({ email, password, accountType }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        account_type: accountType,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
