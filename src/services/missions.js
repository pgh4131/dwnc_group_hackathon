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

export async function fetchStudentMissions(clubId) {
  if (!isSupabaseConfigured) return { missions: [], error: 'Supabase 미설정' };
  const supabase = createClient();

  const { data: matches } = await supabase
    .from('club_company_match')
    .select('match_id, companies(name, industry)')
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

  const mapped = (missionRows || []).map((m) => {
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

  return { missions: mapped, error: null };
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
