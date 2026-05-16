const STORAGE_KEY = 'campusBridge.campaignPosts';

const createId = (title, createdAt) => {
  const normalizedTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42);

  const suffix = new Date(createdAt).getTime().toString(36);

  return `${normalizedTitle || 'campaign-post'}-${suffix}`;
};

const readPosts = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : [];
  } catch (error) {
    console.error('Failed to read campaign posts from localStorage.', error);
    return [];
  }
};

const writePosts = (posts) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const campaignPostStorageKey = STORAGE_KEY;

export const getCampaignPosts = () => readPosts();

export const getCampaignPostById = (postId) =>
  readPosts().find((post) => post.id === postId) ?? null;

export const createCampaignPost = (values) => {
  const timestamp = new Date().toISOString();

  const post = {
    id: createId(values.title, timestamp),
    status: 'open',
    company: {
      companyName: values.companyName.trim(),
      serviceName: values.serviceName.trim(),
      tagline: values.tagline.trim(),
      description: values.companyDescription.trim(),
      websiteUrl: values.websiteUrl.trim(),
      category: values.category.trim(),
    },
    project: {
      title: values.title.trim(),
      purpose: values.purpose.trim(),
      target: values.target.trim(),
      activityTypes: values.activityTypes,
      workMode: values.workMode,
      period: values.period.trim(),
      deadline: values.deadline,
    },
    rewardAndCondition: {
      recruitCount: values.recruitCount.trim(),
      regions: values.regions.trim(),
      rewardSummary: values.rewardSummary.trim(),
      activityBudget: values.activityBudget.trim(),
      performanceBonus: values.performanceBonus.trim(),
      certificate: values.certificate,
      networking: values.networking,
      internshipLinked: values.internshipLinked,
    },
    mission: {
      mainMission: values.mainMission.trim(),
      deliverables: values.deliverables,
      deliverableDescription: values.deliverableDescription.trim(),
      preferredQualifications: values.preferredQualifications.trim(),
      notes: values.notes.trim(),
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const posts = readPosts();
  writePosts([post, ...posts]);

  return post;
};
