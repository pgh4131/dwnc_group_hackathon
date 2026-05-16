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

export const getStudentApplications = async () => {
  if (!isSupabaseConfigured) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from('student_applications')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
};

export const createStudentApplication = async (values) => {
  const timestamp = new Date().toISOString();
  const id = createId(values.officialName, timestamp);

  const application = {
    id,
    post_id: values.postId || null,
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

  if (!isSupabaseConfigured) return application;

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    application.owner_id = session.user.id;
  }

  const { data, error } = await supabase
    .from('student_applications')
    .insert(application)
    .select()
    .single();

  if (error) {
    console.error('Failed to create student application:', error.message);
    return application;
  }

  return data;
};
