import { createClient } from '../utils/supabase/client.js';

const STORAGE_KEY = 'campusBridge.studentClubProfile';

// ── helpers ──────────────────────────────────────────────
const getProfileStorageKey = (sessionOrUserId) => {
  const userId =
    typeof sessionOrUserId === 'string'
      ? sessionOrUserId
      : sessionOrUserId?.user?.id;
  return userId ? `${STORAGE_KEY}.${userId}` : null;
};

const getUserId = (sessionOrUserId) =>
  typeof sessionOrUserId === 'string'
    ? sessionOrUserId
    : sessionOrUserId?.user?.id || null;

const getBrowserStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage || null;
  } catch {
    return null;
  }
};

// ── localStorage cache read/write ────────────────────────
const readCache = (storageKey) => {
  const storage = getBrowserStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (storageKey, profile) => {
  const storage = getBrowserStorage();
  if (!storage) return;
  try {
    storage.setItem(storageKey, JSON.stringify(profile));
  } catch {
    /* quota exceeded — silent */
  }
};

// ── public API ───────────────────────────────────────────

export const studentClubProfileStorageKey = STORAGE_KEY;

/**
 * Load club profile.
 * 1) Try Supabase (source of truth)
 * 2) Fall back to localStorage cache
 */
export const getStudentClubProfile = (sessionOrUserId = null) => {
  const storageKey = getProfileStorageKey(sessionOrUserId);
  if (!storageKey) return null;
  // Return cached value synchronously (caller can await fetchAndCacheProfile for fresh data)
  return readCache(storageKey);
};

/**
 * Fetch from Supabase and update localStorage cache.
 * Returns the profile object or null.
 */
export const fetchAndCacheProfile = async (sessionOrUserId = null) => {
  const userId = getUserId(sessionOrUserId);
  const storageKey = getProfileStorageKey(sessionOrUserId);
  if (!userId || !storageKey) return null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('student_club_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch club profile from Supabase:', error.message);
      return readCache(storageKey);
    }

    if (!data) return readCache(storageKey); // no DB row yet → keep cache

    const profile = {
      clubName: data.club_name || '',
      university: data.university || '',
      owner: data.owner || '',
      description: data.description || '',
      updatedAt: data.updated_at,
    };
    writeCache(storageKey, profile);
    return profile;
  } catch (err) {
    console.error('fetchAndCacheProfile error:', err);
    return readCache(storageKey);
  }
};

/**
 * Save club profile to Supabase (upsert) AND localStorage.
 */
export const saveStudentClubProfile = async (profile, sessionOrUserId = null) => {
  const userId = getUserId(sessionOrUserId);
  const storageKey = getProfileStorageKey(sessionOrUserId);
  const nextProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  // Always write to localStorage immediately for fast UI feedback
  if (storageKey) {
    writeCache(storageKey, nextProfile);
  }

  // Persist to Supabase
  if (userId) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('student_club_profiles')
        .upsert(
          {
            user_id: userId,
            club_name: nextProfile.clubName || '',
            university: nextProfile.university || '',
            owner: nextProfile.owner || '',
            description: nextProfile.description || '',
            updated_at: nextProfile.updatedAt,
          },
          { onConflict: 'user_id' },
        );

      if (error) {
        console.error('Failed to save club profile to Supabase:', error.message);
      }
    } catch (err) {
      console.error('saveStudentClubProfile Supabase error:', err);
    }
  }

  return nextProfile;
};

/**
 * Check whether a valid (non-empty) profile exists.
 */
export const hasStudentClubProfile = (sessionOrUserId = null) => {
  const profile = getStudentClubProfile(sessionOrUserId);
  return Boolean(
    profile?.clubName?.trim() &&
      profile?.university?.trim() &&
      profile?.owner?.trim() &&
      profile?.description?.trim(),
  );
};
