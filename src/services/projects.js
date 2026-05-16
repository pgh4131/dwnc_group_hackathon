import { createClient, isSupabaseConfigured } from '../utils/supabase/client.js';
import { getCampaignPostById, getCampaignPosts } from './campaignPostStorage.js';

export const PROJECTS_TABLE = 'projects';
const SUPABASE_REQUEST_TIMEOUT_MS = 4500;

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

export const normalizeProject = (project) => ({
  id: String(project.slug || project.id),
  startupName: project.startup_name || project.startupName || project.startup || '스타트업',
  title: project.title || '제목 없는 프로젝트',
  tags: normalizeTags(project.tags),
  period: project.period || project.activity_period || '기간 협의',
  reward: project.reward || project.compensation || '보상 협의',
  status: project.status || '모집중',
  createdAt: project.created_at || null,
  source: 'supabase',
  description: project.description || project.purpose || '',
  target: project.target || '',
  deadline: project.deadline || '',
  mission: project.main_mission || project.mission || '',
});

const createRequestTimeout = () => {
  if (typeof AbortController === 'undefined') {
    return {
      signal: null,
      cancel: () => {},
    };
  }

  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => {
    controller.abort();
  }, SUPABASE_REQUEST_TIMEOUT_MS);

  return {
    signal: controller.signal,
    cancel: () => globalThis.clearTimeout(timeoutId),
  };
};

const runSupabaseQuery = async (query) => {
  const timeout = createRequestTimeout();

  try {
    return await (timeout.signal ? query.abortSignal(timeout.signal) : query);
  } catch (error) {
    return { data: null, error };
  } finally {
    timeout.cancel();
  }
};

const getErrorMessage = (error) => {
  if (error?.name === 'AbortError') {
    return 'Supabase 요청 시간이 초과되었습니다.';
  }

  return error?.message || 'Supabase 요청 중 오류가 발생했습니다.';
};

const normalizeCampaignPostProject = (post) => {
  const tags = [
    post.company_info?.category,
    ...(post.project_info?.activityTypes || []),
  ];

  return {
    id: String(post.id),
    startupName: post.company_info?.serviceName || post.company_info?.companyName || '스타트업',
    title: post.project_info?.title || '제목 없는 프로젝트',
    tags: normalizeTags(tags),
    period: post.project_info?.period || '기간 협의',
    reward: post.reward_and_condition?.rewardSummary || '보상 협의',
    status: post.status === 'open' ? '모집중' : post.status || '모집중',
    createdAt: post.created_at || null,
    source: 'campaign_posts',
    description: post.project_info?.purpose || post.company_info?.description || '',
    target: post.project_info?.target || '',
    deadline: post.project_info?.deadline || '',
    mission: post.mission_info?.notes || post.mission_info?.preferredQualifications || '',
  };
};

const getCampaignPostProjects = async () => {
  const posts = await getCampaignPosts();
  return posts.map(normalizeCampaignPostProject);
};

const mergeProjects = (remoteProjects, localProjects) => {
  const localIds = new Set(localProjects.map((project) => project.id));
  return [
    ...localProjects,
    ...remoteProjects.filter((project) => !localIds.has(project.id)),
  ];
};

export async function fetchProjects() {
  const campaignPostProjects = await getCampaignPostProjects();

  if (!isSupabaseConfigured) {
    return {
      projects: campaignPostProjects,
      source: campaignPostProjects.length > 0 ? 'campaign_posts' : 'unconfigured',
      error: campaignPostProjects.length > 0 ? null : 'Supabase 환경 변수가 설정되지 않았습니다.',
    };
  }

  const supabase = createClient();
  const { data, error } = await runSupabaseQuery(
    supabase.from(PROJECTS_TABLE).select('*').limit(24),
  );

  if (error) {
    return {
      projects: campaignPostProjects,
      source: campaignPostProjects.length > 0 ? 'campaign_posts' : 'supabase-error',
      error: campaignPostProjects.length > 0 ? null : getErrorMessage(error),
    };
  }

  const remoteProjects = (data || []).map(normalizeProject);

  return {
    projects: mergeProjects(remoteProjects, campaignPostProjects),
    source: campaignPostProjects.length > 0 ? 'combined' : 'supabase',
    error: null,
  };
}

export async function fetchProjectById(projectId) {
  const localPost = await getCampaignPostById(projectId);

  if (localPost) {
    return {
      project: normalizeCampaignPostProject(localPost),
      source: 'campaign_posts',
      error: null,
    };
  }

  if (!isSupabaseConfigured) {
    return {
      project: null,
      source: 'unconfigured',
      error: 'Supabase 환경 변수가 설정되지 않았습니다.',
    };
  }

  const supabase = createClient();
  const { data, error } = await runSupabaseQuery(
    supabase
      .from(PROJECTS_TABLE)
      .select('*')
      .eq('id', projectId)
      .maybeSingle(),
  );

  if (error) {
    return {
      project: null,
      source: 'supabase-error',
      error: getErrorMessage(error),
    };
  }

  return {
    project: data ? normalizeProject(data) : null,
    source: 'supabase',
    error: null,
  };
}
