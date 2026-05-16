import { createClient, isSupabaseConfigured } from '../utils/supabase/client.js';

export async function createMission(missionData) {
  if (!isSupabaseConfigured) return { mission: null, error: 'Supabase 미설정' };
  const supabase = createClient();

  const { data, error } = await supabase
    .from('missions')
    .insert(missionData)
    .select()
    .single();

  return { mission: data, error: error?.message || null };
}

export async function fetchMissionsByMatch(matchId) {
  if (!isSupabaseConfigured) return { missions: [], error: 'Supabase 미설정' };
  const supabase = createClient();

  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false });

  return { missions: data || [], error: error?.message || null };
}

export async function sendNotification({ matchId, companyId, clubId, title, message }) {
  if (!isSupabaseConfigured) return { notification: null, error: 'Supabase 미설정' };
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      match_id: matchId,
      from_company_id: companyId,
      to_club_id: clubId,
      title,
      message,
    })
    .select()
    .single();

  return { notification: data, error: error?.message || null };
}

export async function addSolution({ missionId, title, description, solutionType = 'custom' }) {
  if (!isSupabaseConfigured) return { solution: null, error: 'Supabase 미설정' };
  const supabase = createClient();

  const { data, error } = await supabase
    .from('marketing_solutions')
    .insert({ mission_id: missionId, title, description, solution_type: solutionType })
    .select()
    .single();

  return { solution: data, error: error?.message || null };
}

const mapMissionRows = (missionRows, matches) => {
  return (missionRows || []).map((m) => {
    const match = matches.find(mt => mt.match_id === m.match_id);
    const progress = m.mission_progress?.[0];
    const deliverables = m.mission_deliverables || [];

    const approvalItems = deliverables.map(d => ({
      id: d.deliverable_id,
      label: d.title,
      status: d.approval_status === 'approved' ? 'approved'
        : d.submission_date ? 'pending'
        : 'not_submitted',
    }));

    const kpiProgress = progress?.progress_percent ?? 0;
    const approvedCount = approvalItems.filter(a => a.status === 'approved').length;
    const approvalProgress = approvalItems.length > 0
      ? Math.round((approvedCount / approvalItems.length) * 100)
      : 0;
    const blended = Math.round(kpiProgress * 0.55 + approvalProgress * 0.45);

    return {
      id: `m-${m.mission_id}`,
      mission_id: m.mission_id,
      match_id: m.match_id,
      club_id: match?.club_id,
      companyName: match?.companies?.name || '기업',
      companyIndustry: match?.companies?.industry || '',
      title: m.mission_name,
      period: `${m.start_date || ''} - ${m.end_date || ''}`,
      targetKpi: m.objective_kpi || '',
      reward: '',
      status: m.status === 'completed' ? 'completed'
        : progress?.status === 'completed' ? 'review'
        : 'in_progress',
      kpiProgress,
      approvalItems,
      approvalProgress,
      overallProgress: approvalProgress < 100 ? Math.min(blended, 82) : blended,
    };
  });
};

export const buildStudentProjectSummaries = (missions = []) => {
  const groups = new Map();

  missions.forEach((mission) => {
    const key = mission.match_id ?? mission.id;
    const current = groups.get(key) || [];
    current.push(mission);
    groups.set(key, current);
  });

  return [...groups.entries()].map(([key, projectMissions]) => {
    const primary = projectMissions[0];
    const totalProgress = projectMissions.reduce((sum, mission) => sum + (mission.overallProgress || 0), 0);
    const avgProgress = Math.round(totalProgress / projectMissions.length);
    const status = projectMissions.every((mission) => mission.status === 'completed')
      ? 'completed'
      : projectMissions.some((mission) => mission.status === 'review')
        ? 'review'
        : 'in_progress';

    return {
      id: `project-${key}`,
      match_id: primary.match_id,
      detailMissionId: primary.id,
      companyName: primary.companyName,
      companyIndustry: primary.companyIndustry,
      title: `${primary.companyName} 캠퍼스 마케팅 프로젝트`,
      latestMissionTitle: primary.title,
      period: primary.period,
      missionCount: projectMissions.length,
      status,
      overallProgress: avgProgress,
    };
  });
};

export async function fetchStudentMissions(clubId) {
  if (!isSupabaseConfigured) return { missions: [], error: 'Supabase 미설정' };
  const supabase = createClient();

  const { data: matches } = await supabase
    .from('club_company_match')
    .select('match_id, club_id, companies(name, industry)')
    .eq('club_id', clubId);

  if (!matches?.length) return { missions: [], error: null };

  const matchIds = matches.map(m => m.match_id);

  const { data: missionRows, error } = await supabase
    .from('missions')
    .select(`
      *,
      mission_progress!inner(progress_percent, status),
      mission_deliverables(*)
    `)
    .in('match_id', matchIds);

  if (error) return { missions: [], error: error.message };

  return { missions: mapMissionRows(missionRows, matches), error: null };
}

export async function fetchStudentMissionsForCurrentUser(options = {}) {
  if (!isSupabaseConfigured) return { missions: [], error: 'Supabase 미설정' };
  const supabase = createClient();
  let session = options.session || null;

  if (!session) {
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) return { missions: [], error: sessionError.message };
    session = currentSession;
  }

  if (!session) return { missions: [], error: '로그인 필요' };

  const { data: applications, error: applicationError } = await supabase
    .from('student_applications')
    .select('match_id, accepted_club_id')
    .eq('owner_id', session.user.id)
    .eq('status', 'accepted')
    .not('match_id', 'is', null);

  if (applicationError) return { missions: [], error: applicationError.message };

  const matchIds = [...new Set((applications || []).map(app => app.match_id).filter(Boolean))];
  if (matchIds.length === 0) return { missions: [], error: null };

  const { data: matches, error: matchError } = await supabase
    .from('club_company_match')
    .select('match_id, club_id, companies(name, industry)')
    .in('match_id', matchIds);

  if (matchError) return { missions: [], error: matchError.message };
  if (!matches?.length) return { missions: [], error: null };

  const { data: missionRows, error } = await supabase
    .from('missions')
    .select(`
      *,
      mission_progress(progress_percent, status),
      mission_deliverables(*)
    `)
    .in('match_id', matchIds)
    .order('created_at', { ascending: false });

  if (error) return { missions: [], error: error.message };

  return { missions: mapMissionRows(missionRows, matches || []), error: null };
}

export async function assignMissionToMatch({ matchId, clubId, title, description, deadline, delayBuffer, targetMetric }) {
  if (!isSupabaseConfigured) return { mission: null, error: 'Supabase 미설정' };
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: mission, error: missionError } = await supabase
    .from('missions')
    .insert({
      match_id: matchId,
      mission_name: title?.trim() || '새 미션',
      mission_description: description?.trim() || '',
      objective_kpi: targetMetric ? `목표 수치 ${targetMetric}` : '',
      start_date: today,
      end_date: deadline || null,
      delay_buffer: delayBuffer?.trim() || '',
      target_metric: targetMetric ? Number(targetMetric) : null,
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

export async function fetchStudentFeedback(clubId) {
  if (!isSupabaseConfigured) return { feedback: [], error: 'Supabase 미설정' };
  const supabase = createClient();

  const { data, error } = await supabase
    .from('feedback')
    .select('*, missions(mission_name), companies:from_company_id(name)')
    .eq('to_club_id', clubId)
    .order('created_at', { ascending: false });

  if (error) return { feedback: [], error: error.message };

  return {
    feedback: (data || []).map(f => ({
      id: `fb-${f.feedback_id}`,
      missionId: `m-${f.mission_id}`,
      missionTitle: f.missions?.mission_name || '',
      sender: f.companies?.name || '기업',
      channel: 'mail',
      receivedAt: new Date(f.created_at).toLocaleDateString('ko-KR'),
      isRead: true,
      body: f.content,
      comments: [],
    })),
    error: null,
  };
}

export async function fetchStudentFeedbackForCurrentUser(options = {}) {
  if (!isSupabaseConfigured) return { feedback: [], error: 'Supabase 미설정' };
  const supabase = createClient();
  let session = options.session || null;

  if (!session) {
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) return { feedback: [], error: sessionError.message };
    session = currentSession;
  }

  if (!session) return { feedback: [], error: '로그인 필요' };

  const { data: applications, error: applicationError } = await supabase
    .from('student_applications')
    .select('accepted_club_id')
    .eq('owner_id', session.user.id)
    .eq('status', 'accepted')
    .not('accepted_club_id', 'is', null);

  if (applicationError) return { feedback: [], error: applicationError.message };

  const clubIds = [...new Set((applications || []).map(app => app.accepted_club_id).filter(Boolean))];
  if (clubIds.length === 0) return { feedback: [], error: null };

  const { data, error } = await supabase
    .from('feedback')
    .select('*, missions(mission_name), companies:from_company_id(name)')
    .in('to_club_id', clubIds)
    .order('created_at', { ascending: false });

  if (error) return { feedback: [], error: error.message };

  return {
    feedback: (data || []).map(f => ({
      id: `fb-${f.feedback_id}`,
      missionId: `m-${f.mission_id}`,
      missionTitle: f.missions?.mission_name || '',
      sender: f.companies?.name || '기업',
      channel: 'mail',
      receivedAt: new Date(f.created_at).toLocaleDateString('ko-KR'),
      isRead: true,
      body: f.content,
      comments: [],
    })),
    error: null,
  };
}
