import { createClient, isSupabaseConfigured } from '../utils/supabase/client.js';

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

const normalizeApplication = (application, project = null) => {
  if (!application) return null;
  const linkedPost = application.campaign_posts || application.campaign_post || null;
  const linkedProject = project || (linkedPost
    ? {
        id: String(linkedPost.id),
        title: linkedPost.project_info?.title || '제목 없는 프로젝트',
        startupName:
          linkedPost.company_info?.serviceName ||
          linkedPost.company_info?.companyName ||
          '스타트업',
        period: linkedPost.project_info?.period || '기간 협의',
        reward: linkedPost.reward_and_condition?.rewardSummary || '보상 협의',
        source: 'campaign_posts',
      }
    : null);

  return {
    ...application,
    project: linkedProject
      ? {
          id: String(linkedProject.id),
          title: linkedProject.title,
          startupName: linkedProject.startupName,
          period: linkedProject.period,
          reward: linkedProject.reward,
          source: linkedProject.source,
        }
      : application.project || null,
    club: application.club || application.club_info || {},
    createdAt: application.createdAt || application.created_at,
  };
};

export const getStudentApplications = async () => {
  if (!isSupabaseConfigured) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from('student_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch student applications:', error.message);
    return [];
  }

  return (data || []).map((application) => normalizeApplication(application));
};

export const getLatestStudentApplication = async () => {
  const applications = await getStudentApplications();
  return applications[0] ?? null;
};

export const getMyStudentApplications = async (options = {}) => {
  if (!isSupabaseConfigured) return { applications: [], error: 'Supabase 미설정' };
  const supabase = createClient();
  let session = options.session || null;

  if (!session) {
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return { applications: [], error: sessionError.message };
    }
    session = currentSession;
  }

  if (!session) {
    return { applications: [], error: '로그인 필요' };
  }

  const { data, error } = await supabase
    .from('student_applications')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch my student applications:', error.message);
    return { applications: [], error: error.message };
  }

  const applications = data || [];
  const postIds = [...new Set(applications.map((application) => application.post_id).filter(Boolean))];
  let postsById = new Map();

  if (postIds.length > 0) {
    const { data: posts, error: postsError } = await supabase
      .from('campaign_posts')
      .select('*')
      .in('id', postIds);

    if (postsError) {
      console.error('Failed to fetch application posts:', postsError.message);
    } else {
      postsById = new Map((posts || []).map((post) => [post.id, post]));
    }
  }

  return {
    applications: applications.map((application) =>
      normalizeApplication({
        ...application,
        campaign_post: postsById.get(application.post_id) || null,
      }),
    ),
    error: null,
  };
};

export const getStudentApplicationByProjectId = async (projectId, project = null, options = {}) => {
  if (!projectId || !isSupabaseConfigured) return null;
  const supabase = createClient();
  let session = options.session || null;

  if (!session) {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    session = currentSession;
  }

  if (!session) return null;

  let query = supabase
    .from('student_applications')
    .select('*')
    .eq('post_id', String(projectId))
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Failed to fetch student application:', error.message);
    return null;
  }

  return normalizeApplication(data, project);
};

export const createStudentApplication = async (values, project = null, options = {}) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase 환경 변수가 설정되어 있지 않습니다.');
  }

  const timestamp = new Date().toISOString();
  const id = createId(values.officialName, timestamp);
  const supabase = createClient();
  let session = options.session || null;

  if (!session) {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    session = currentSession;
  }

  if (!session) {
    throw new Error('지원서 제출은 로그인 후 가능합니다.');
  }

  const application = {
    id,
    owner_id: session.user.id,
    post_id: project?.source === 'campaign_posts' ? String(project.id) : null,
    status: 'pending',
    club_info: {
      officialName: values.officialName?.trim() || '',
      englishName: values.englishName?.trim() || '',
      school: values.school?.trim() || '',
      campus: values.campus?.trim() || '',
      organizationType: values.organizationType || '',
      organizationTypeOther: values.organizationTypeOther?.trim() || '',
      totalMembers: Number(values.totalMembers) || 0,
      activeMembers: Number(values.activeMembers) || 0,
    },
    representative: {
      name: values.representativeName?.trim() || '',
      phone: values.representativePhone?.trim() || '',
      email: values.representativeEmail?.trim() || '',
    },
    profile: {
      introduction: values.introduction?.trim() || '',
      activityHistory: values.activityHistory?.trim() || '',
      links: {
        instagramUrl: values.instagramUrl?.trim() || '',
        youtubeUrl: values.youtubeUrl?.trim() || '',
        blogUrl: values.blogUrl?.trim() || '',
        websiteUrl: values.websiteUrl?.trim() || '',
        portfolioUrl: values.portfolioUrl?.trim() || '',
        campusBridgeCertificateUrl: values.campusBridgeCertificateUrl?.trim() || '',
      },
    },
    motivation: {
      reason: values.motivationReason?.trim() || '',
      expectedOutcomes: values.expectedOutcomes || [],
      expectedOutcomeOther: values.expectedOutcomeOther?.trim() || '',
    },
    created_at: timestamp,
    updated_at: timestamp,
  };

  const { data, error } = await supabase
    .from('student_applications')
    .insert(application)
    .select()
    .single();

  if (error) {
    console.error('Failed to create student application:', error.message);
    throw new Error(`지원서 저장에 실패했습니다: ${error.message}`);
  }

  return normalizeApplication(data, project);
};
