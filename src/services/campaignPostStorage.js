import { createClient, isSupabaseConfigured } from '../utils/supabase/client.js';

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

const withTimeout = (promise, message, timeoutMs = 12000) => {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutId);
  });
};

export const getCampaignPosts = async () => {
  if (!isSupabaseConfigured) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from('campaign_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch campaign posts:', error.message);
    return [];
  }

  return data || [];
};

export const getMyCampaignPosts = async () => {
  if (!isSupabaseConfigured) return [];
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('campaign_posts')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch my campaign posts:', error.message);
    return [];
  }

  return data || [];
};

export const getCampaignPostById = async (postId) => {
  if (!isSupabaseConfigured) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('campaign_posts')
    .select('*')
    .eq('id', postId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch campaign post:', error.message);
    return null;
  }

  return data || null;
};

export const createCampaignPost = async (values, options = {}) => {
  const timestamp = new Date().toISOString();
  const id = createId(values.title, timestamp);

  const post = {
    id,
    status: 'open',
    company_info: {
      companyName: values.companyName?.trim() || '',
      serviceName: values.serviceName?.trim() || '',
      tagline: values.tagline?.trim() || '',
      description: values.companyDescription?.trim() || '',
      websiteUrl: values.websiteUrl?.trim() || '',
      category: values.category?.trim() || '',
    },
    project_info: {
      title: values.title?.trim() || '',
      purpose: values.purpose?.trim() || '',
      target: values.target?.trim() || '',
      activityTypes: values.activityTypes || [],
      workMode: values.workMode || '',
      period: values.period?.trim() || '',
      deadline: values.deadline || '',
    },
    reward_and_condition: {
      recruitCount: values.recruitCount?.trim() || '',
      regions: values.regions?.trim() || '',
      rewardSummary: values.rewardSummary?.trim() || '',
      activityBudget: values.activityBudget?.trim() || '',
      performanceBonus: values.performanceBonus?.trim() || '',
      certificate: values.certificate || false,
      networking: values.networking || false,
      internshipLinked: values.internshipLinked || false,
    },
    mission_info: {
      preferredQualifications: values.preferredQualifications?.trim() || '',
      notes: values.notes?.trim() || '',
    },
    created_at: timestamp,
    updated_at: timestamp,
  };

  if (!isSupabaseConfigured) {
    throw new Error('Supabase 환경 변수가 설정되어 있지 않습니다.');
  }

  const supabase = createClient();
  let session = options.session || null;

  if (!session) {
    const result = await withTimeout(
      supabase.auth.getSession(),
      '로그인 세션 확인 시간이 초과되었습니다. 다시 로그인해주세요.',
    );
    session = result.data.session;
  }

  if (!session) {
    throw new Error('공고 등록은 로그인 후 가능합니다.');
  }

  post.owner_id = session.user.id;

  const { data, error } = await withTimeout(
    supabase
      .from('campaign_posts')
      .insert(post)
      .select()
      .single(),
    '공고 저장 요청 시간이 초과되었습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.',
  );

  if (error) {
    console.error('Failed to create campaign post:', error.message);
    throw new Error(`공고 저장에 실패했습니다: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error('공고 저장 결과를 확인하지 못했습니다. 새로고침 후 다시 확인해주세요.');
  }

  return data;
};
