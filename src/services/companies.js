import { createClient, isSupabaseConfigured } from '../utils/supabase/client.js';

export async function fetchCompanyByOwner() {
  if (!isSupabaseConfigured) return { company: null, error: 'Supabase 미설정' };
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { company: null, error: '로그인 필요' };

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', session.user.id)
    .maybeSingle();

  return { company: data, error: error?.message || null };
}

export async function upsertCompany(companyData) {
  if (!isSupabaseConfigured) return { company: null, error: 'Supabase 미설정' };
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { company: null, error: '로그인 필요' };

  const payload = { ...companyData, owner_id: session.user.id };

  if (payload.company_id) {
    const { data, error } = await supabase
      .from('companies')
      .update(payload)
      .eq('company_id', payload.company_id)
      .select()
      .single();
    return { company: data, error: error?.message || null };
  }

  const { data, error } = await supabase
    .from('companies')
    .insert(payload)
    .select()
    .single();
  return { company: data, error: error?.message || null };
}

export async function fetchMatchedClubs(companyId) {
  if (!isSupabaseConfigured) return { clubs: [], error: 'Supabase 미설정' };
  const supabase = createClient();

  const { data, error } = await supabase
    .from('club_company_match')
    .select(`
      *,
      clubs (*),
      missions (
        *,
        mission_progress (*),
        mission_deliverables (*)
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) return { clubs: [], error: error.message };

  const mapped = (data || []).map((match) => {
    const club = match.clubs;
    const mission = match.missions?.[0];
    const progress = mission?.mission_progress?.[0];
    const deliverables = mission?.mission_deliverables || [];

    const initials = club?.name
      ? club.name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('')
      : '??';

    const tasks = deliverables.map((d) => ({
      id: d.deliverable_id,
      name: d.title,
      done: d.approval_status === 'approved',
      pct: d.approval_status === 'approved' ? 100 : d.submission_date ? 65 : 0,
    }));

    return {
      id: club?.club_id,
      club_id: club?.club_id,
      name: club?.name || '알 수 없음',
      initials,
      university: club?.university || '',
      mission: mission?.mission_name || '미션 없음',
      mission_id: mission?.mission_id,
      match_id: match.match_id,
      status: match.status === 'completed' ? 'completed'
        : (match.status === 'pending_review' || match.status === 'scheduled') ? 'pending_review'
        : 'in_progress',
      score: Math.round(progress?.progress_percent ?? 0),
      missions: tasks,
    };
  });

  return { clubs: mapped, error: null };
}

export async function fetchClubDashboardBundle(clubId, companyId) {
  if (!isSupabaseConfigured) return null;
  const supabase = createClient();

  const { data: match } = await supabase
    .from('club_company_match')
    .select('*')
    .eq('club_id', clubId)
    .eq('company_id', companyId)
    .maybeSingle();
  if (!match) return null;

  const { data: club } = await supabase.from('clubs').select('*').eq('club_id', clubId).single();
  const { data: missions } = await supabase.from('missions').select('*').eq('match_id', match.match_id).order('created_at', { ascending: false });
  const mission = missions && missions.length > 0 ? missions[0] : null;
  if (!club) return null;

  const missionIds = missions && missions.length > 0 ? missions.map(m => m.mission_id) : [-1];
  const missionId = mission?.mission_id || -1;

  const { data: metrics } = await supabase
    .from('mission_metrics')
    .select('*')
    .eq('mission_id', missionId)
    .order('metric_date');

  const { data: progress } = await supabase
    .from('mission_progress')
    .select('*')
    .eq('mission_id', missionId)
    .eq('club_id', clubId)
    .maybeSingle();

  const { data: rawDeliverables } = await supabase
    .from('mission_deliverables')
    .select('*')
    .in('mission_id', missionIds)
    .order('deliverable_id', { ascending: false });

  const deliverableByMission = {};
  for (const d of (rawDeliverables || [])) {
    if (!deliverableByMission[d.mission_id]) {
      deliverableByMission[d.mission_id] = d;
    }
  }

  const { data: notifs } = await supabase
    .from('notifications')
    .select('*')
    .eq('match_id', match.match_id)
    .order('created_at');

  const { data: solutions } = await supabase
    .from('marketing_solutions')
    .select('*')
    .eq('mission_id', missionId);

  const { data: timeline } = await supabase
    .from('mission_timeline_events')
    .select('*')
    .eq('mission_id', missionId)
    .order('event_date');

  const fmt = (iso) => {
    if (!iso) return '';
    const [, m, d] = iso.split('-');
    return `${Number(m)}/${Number(d)}`;
  };

  const initials = club.name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('');

  const chartRows = (metrics || []).map((m) => ({
    week: fmt(m.metric_date),
    CTR: Number(m.ctr),
    CPC: Number(m.cpc),
    노출수: m.impressions,
    클릭수: m.clicks,
    전환수: m.conversions,
    'Eng.Rate': Number(m.engagement_rate),
    전환율: Number(m.conversion_rate),
  }));

  const scoreVal = Math.round(progress?.progress_percent ?? 0);

  const taskRows = (missions || []).map((m) => {
    const d = deliverableByMission[m.mission_id] || {};
    return {
      id: m.mission_id,
      deliverableId: d.deliverable_id,
      name: m.mission_name,
      done: d.approval_status === 'approved',
      pct: d.approval_status === 'approved' ? 100 : d.submission_date ? 65 : 0,
      status: d.approval_status || 'not_submitted',
      submissionContent: d.description || '',
      missionId: m.mission_id,
    };
  });

  const noticeRows = (notifs || []).map((n) => ({
    id: n.notification_id,
    date: fmt(n.created_at?.slice(0, 10)),
    title: n.title,
    content: n.message,
  }));

  const solRows = (solutions || []).map((s) => ({
    id: s.solution_id,
    text: `${s.title} — ${s.description}`,
    solution_type: s.solution_type,
    title: s.title,
    description: s.description,
  }));

  const statusKey = match.status === 'completed' ? 'completed'
    : (match.status === 'pending_review' || match.status === 'scheduled') ? 'pending_review'
    : 'in_progress';

  return {
    club: { id: club.club_id, club_id: club.club_id, name: club.name, initials, university: club.university },
    match,
    mission: mission || {},
    metrics: metrics || [],
    weeks: (metrics || []).map(m => fmt(m.metric_date)),
    chartRows,
    score: scoreVal,
    avgScore: 65,
    viralVsPeerChart: [
      { name: '이 동아리', value: scoreVal },
      { name: '참여 평균', value: 65 },
    ],
    solutions: solRows,
    notices: noticeRows,
    missions: taskRows,
    timeline: timeline || [],
    statusKey,
    missionTitle: mission?.mission_name || '미션 대기 중',
    missionDescription: mission?.mission_description || '아직 등록된 미션이 없습니다. 새 미션을 추가해주세요.',
    objectiveKpi: mission?.objective_kpi || '',
  };
}

export async function getLeaderboard(companyId) {
  const { clubs } = await fetchMatchedClubs(companyId);
  return [...clubs]
    .sort((a, b) => b.score - a.score)
    .map((row, i) => ({ ...row, rank: i + 1, rankDelta: 0 }));
}

export async function fetchApplicationsForPost(postId) {
  if (!isSupabaseConfigured) return { applications: [], error: 'Supabase 미설정' };
  const supabase = createClient();

  const { data, error } = await supabase
    .from('student_applications')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  return { applications: data || [], error: error?.message || null };
}

const buildCompanyPayloadFromPost = (post, fallbackEmail = '') => {
  const companyInfo = post?.company_info || {};

  return {
    name: companyInfo.companyName || companyInfo.serviceName || '기업',
    industry: companyInfo.category || '',
    description: companyInfo.description || companyInfo.tagline || '',
    contact_email: fallbackEmail,
  };
};

async function ensureCompanyForAcceptance(companyId, post) {
  if (companyId) return { company: { company_id: companyId }, error: null };

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { company: null, error: '로그인 필요' };

  const existing = await fetchCompanyByOwner();
  if (existing.company) return existing;
  if (existing.error && existing.error !== '로그인 필요') {
    return existing;
  }

  const payload = {
    ...buildCompanyPayloadFromPost(post, session.user.email || ''),
    owner_id: session.user.id,
  };

  const { data, error } = await supabase
    .from('companies')
    .insert(payload)
    .select()
    .single();

  return { company: data, error: error?.message || null };
}

async function createDefaultMission({ match, post, clubId }) {
  const supabase = createClient();
  const projectInfo = post?.project_info || {};
  const missionInfo = post?.mission_info || {};

  const { data: mission, error: missionError } = await supabase
    .from('missions')
    .insert({
      match_id: match.match_id,
      mission_name: projectInfo.title || '캠퍼스 마케팅 프로젝트',
      mission_description:
        missionInfo.notes ||
        projectInfo.purpose ||
        '기업이 선택한 지원서로 시작된 캠퍼스 마케팅 프로젝트입니다.',
      objective_kpi: projectInfo.target || '캠페인 성과 제출',
      start_date: new Date().toISOString().split('T')[0],
      end_date: projectInfo.deadline || null,
      status: 'in_progress',
    })
    .select()
    .single();

  if (missionError) return { mission: null, error: missionError.message };

  const { error: progressError } = await supabase
    .from('mission_progress')
    .insert({
      mission_id: mission.mission_id,
      club_id: clubId,
      progress_percent: 0,
      status: 'in_progress',
    });

  if (progressError) return { mission: null, error: progressError.message };

  return { mission, error: null };
}

export async function acceptApplication(companyId, application, post = null) {
  if (!isSupabaseConfigured) return { match: null, error: 'Supabase 미설정' };
  const supabase = createClient();
  const { company, error: companyError } = await ensureCompanyForAcceptance(companyId, post);

  if (companyError || !company) {
    return { match: null, error: companyError || '기업 정보를 확인하지 못했습니다.' };
  }

  const clubInfo = application.club_info || {};
  const clubName = clubInfo.officialName || clubInfo.clubName || '알 수 없는 동아리';
  const university = clubInfo.school || clubInfo.university || '미입력';

  // 1. clubs 테이블에 동아리 생성
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .insert({
      name: clubName,
      university: university,
      description: clubInfo.introduction || application.profile?.introduction || '',
      contact_email: application.representative?.email || '',
    })
    .select()
    .single();

  if (clubError) return { match: null, error: clubError.message };

  // 2. club_company_match 생성
  const { data: match, error: matchError } = await supabase
    .from('club_company_match')
    .insert({
      company_id: company.company_id,
      club_id: club.club_id,
      status: 'in_progress',
      start_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (matchError) return { match: null, error: matchError.message };

  // 3. 기본 미션 생성 제거: 프로젝트 목록에 프로젝트만 뜨도록 하고 미션은 기업이 별도로 추가하게 함.

  // 4. student_applications status → accepted
  const { error: applicationError } = await supabase
    .from('student_applications')
    .update({
      status: 'accepted',
      match_id: match.match_id,
      accepted_club_id: club.club_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', application.id);

  if (applicationError) return { match: null, error: applicationError.message };

  return { match, club, company, error: null };
}
