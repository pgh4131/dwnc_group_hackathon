const STORAGE_KEY = 'campusBridge.studentApplications';

const createId = (officialName, createdAt) => {
  const normalizedName = officialName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42);

  const suffix = new Date(createdAt).getTime().toString(36);

  return `${normalizedName || 'student-application'}-${suffix}`;
};

const readApplications = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : [];
  } catch (error) {
    console.error('Failed to read student applications from localStorage.', error);
    return [];
  }
};

const writeApplications = (applications) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
};

export const studentApplicationStorageKey = STORAGE_KEY;

export const getStudentApplications = () => readApplications();

export const createStudentApplication = (values) => {
  const timestamp = new Date().toISOString();

  const application = {
    id: createId(values.officialName, timestamp),
    club: {
      officialName: values.officialName.trim(),
      englishName: values.englishName.trim(),
      school: values.school.trim(),
      campus: values.campus.trim(),
      organizationType: values.organizationType,
      organizationTypeOther: values.organizationTypeOther.trim(),
      totalMembers: Number(values.totalMembers),
      activeMembers: Number(values.activeMembers),
    },
    representative: {
      name: values.representativeName.trim(),
      phone: values.representativePhone.trim(),
      email: values.representativeEmail.trim(),
    },
    profile: {
      introduction: values.introduction.trim(),
      activityHistory: values.activityHistory.trim(),
      links: {
        instagramUrl: values.instagramUrl.trim(),
        youtubeUrl: values.youtubeUrl.trim(),
        blogUrl: values.blogUrl.trim(),
        websiteUrl: values.websiteUrl.trim(),
        portfolioUrl: values.portfolioUrl.trim(),
        campusBridgeCertificateUrl: values.campusBridgeCertificateUrl.trim(),
      },
    },
    motivation: {
      reason: values.motivationReason.trim(),
      expectedOutcomes: values.expectedOutcomes,
      expectedOutcomeOther: values.expectedOutcomeOther.trim(),
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const applications = readApplications();
  writeApplications([application, ...applications]);

  return application;
};
