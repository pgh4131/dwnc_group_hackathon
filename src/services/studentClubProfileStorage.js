const STORAGE_KEY = 'campusBridge.studentClubProfile';
let memoryClubProfile = null;

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

export const getStudentClubProfile = () => {
  const storage = getBrowserStorage();

  if (!storage) {
    return memoryClubProfile;
  }

  try {
    const storedValue = storage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch (error) {
    console.error('Failed to read student club profile from localStorage.', error);
    return null;
  }
};

export const saveStudentClubProfile = (profile) => {
  const nextProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  memoryClubProfile = nextProfile;

  const storage = getBrowserStorage();

  if (!storage) {
    return nextProfile;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
  } catch (error) {
    console.error('Failed to write student club profile to localStorage.', error);
  }

  return nextProfile;
};

export const hasStudentClubProfile = () => {
  const profile = getStudentClubProfile();

  return Boolean(
    profile?.clubName?.trim() &&
      profile?.university?.trim() &&
      profile?.owner?.trim() &&
      profile?.description?.trim(),
  );
};
