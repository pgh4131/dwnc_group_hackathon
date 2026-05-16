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

  return {
    ...application,
    project: project
      ? {
          id: String(project.id),
          title: project.title,
          startupName: project.startupName,
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

export const getStudentApplicationByProjectId = async (projectId, project = null) => {
  if (!projectId || !isSupabaseConfigured) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('student_applications')
    .select('*')
    .eq('post_id', String(projectId))
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

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
