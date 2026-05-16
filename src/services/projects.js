import { createClient, isSupabaseConfigured } from '../utils/supabase/client.js';

export const PROJECTS_TABLE = 'projects';

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
});

export async function fetchProjects() {
  if (!isSupabaseConfigured) {
    return {
      projects: [],
      source: 'unconfigured',
      error: 'Supabase 환경 변수가 설정되지 않았습니다.',
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.from(PROJECTS_TABLE).select('*').limit(24);

  if (error) {
    return {
      projects: [],
      source: 'supabase-error',
      error: error.message,
    };
  }

  return {
    projects: (data || []).map(normalizeProject),
    source: 'supabase',
    error: null,
  };
}

export async function fetchProjectById(projectId) {
  if (!isSupabaseConfigured) {
    return {
      project: null,
      source: 'unconfigured',
      error: 'Supabase 환경 변수가 설정되지 않았습니다.',
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (error) {
    return {
      project: null,
      source: 'supabase-error',
      error: error.message,
    };
  }

  return {
    project: data ? normalizeProject(data) : null,
    source: 'supabase',
    error: null,
  };
}
