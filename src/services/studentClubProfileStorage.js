const STORAGE_KEY = 'campusBridge.studentClubProfile';
const memoryClubProfiles = new Map();

const getProfileStorageKey = (sessionOrUserId) => {
  const userId = typeof sessionOrUserId === 'string'
    ? sessionOrUserId
    : sessionOrUserId?.user?.id;

  return userId ? `${STORAGE_KEY}.${userId}` : null;
};

const getBrowserStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage || null;
  } catch (error) {
    console.error('Failed to access localStorage.', error);
    return null;
  }
};

export const studentClubProfileStorageKey = STORAGE_KEY;

export const getStudentClubProfile = (sessionOrUserId = null) => {
  const storageKey = getProfileStorageKey(sessionOrUserId);

  if (!storageKey) {
    return null;
  }

  const storage = getBrowserStorage();

  if (!storage) {
    return memoryClubProfiles.get(storageKey) || null;
  }

  try {
    const storedValue = storage.getItem(storageKey);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch (error) {
    console.error('Failed to read student club profile from localStorage.', error);
    return null;
  }
};

export const saveStudentClubProfile = (profile, sessionOrUserId = null) => {
  const storageKey = getProfileStorageKey(sessionOrUserId);
  const nextProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  if (!storageKey) {
    return nextProfile;
  }

  memoryClubProfiles.set(storageKey, nextProfile);

  const storage = getBrowserStorage();

  if (!storage) {
    return nextProfile;
  }

  try {
    storage.setItem(storageKey, JSON.stringify(nextProfile));
  } catch (error) {
    console.error('Failed to write student club profile to localStorage.', error);
  }

  return nextProfile;
};

export const hasStudentClubProfile = (sessionOrUserId = null) => {
  const profile = getStudentClubProfile(sessionOrUserId);

  return Boolean(
    profile?.clubName?.trim() &&
      profile?.university?.trim() &&
      profile?.owner?.trim() &&
      profile?.description?.trim(),
  );
};
