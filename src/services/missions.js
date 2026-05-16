import { createClient, isSupabaseConfigured } from '../utils/supabase/client.js';
import { getMyStudentApplications } from './studentApplicationStorage.js';

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

    const approvalItems = deliverables.length > 0 ? deliverables.map(d => ({
      id: d.deliverable_id,
      label: d.title,
      status: d.approval_status === 'approved' ? 'approved'
        : d.submission_date ? 'pending'
        : 'not_submitted',
      submissionContent: d.description || '',
    })) : [
      {
        id: 'virtual-deliverable',
        label: '미션 수행 결과',
        status: 'not_submitted',
        submissionContent: ''
      }
    ];

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
      targetMetric: m.target_metric || null,
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

const mapAcceptedApplicationToMission = (application) => {
  const post = application.campaign_post || application.campaign_posts || null;
  const project = application.project || {};
  const projectInfo = post?.project_info || {};
  const companyInfo = post?.company_info || {};
  const rewardInfo = post?.reward_and_condition || {};

  return {
    id: `app-${application.id}`,
    applicationId: application.id,
    postId: application.post_id,
    match_id: `application-${application.id}`,
    companyName:
      project.startupName ||
      companyInfo.serviceName ||
      companyInfo.companyName ||
      '스타트업',
    companyIndustry: companyInfo.category || '',
    title: project.title || projectInfo.title || '캠퍼스 마케팅 프로젝트',
    period: project.period || projectInfo.period || '기간 협의',
    targetKpi: projectInfo.target || '캠페인 성과 제출',
    reward: project.reward || rewardInfo.rewardSummary || '보상 협의',
    status: 'in_progress',
    kpiProgress: 0,
    approvalItems: [],
    approvalProgress: 0,
    overallProgress: 0,
    acceptedAt: application.updated_at || application.created_at,
  };
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

  const mappedMissions = mapMissionRows(missionRows, matches || []);
  const matchesWithMissions = new Set(missionRows?.map(m => m.match_id));
  const matchesWithoutMissions = (matches || []).filter(m => !matchesWithMissions.has(m.match_id));

  const placeholderMissions = matchesWithoutMissions.map(m => ({
    id: `placeholder-${m.match_id}`,
    mission_id: null,
    match_id: m.match_id,
    club_id: m.club_id,
    companyName: m?.companies?.name || '기업',
    companyIndustry: m?.companies?.industry || '',
    title: '프로젝트 준비 중',
    period: '일정 미정',
    targetKpi: '',
    targetMetric: null,
    reward: '',
    status: 'in_progress',
    kpiProgress: 0,
    approvalItems: [],
    approvalProgress: 0,
    overallProgress: 0,
  }));

  return { missions: [...mappedMissions, ...placeholderMissions], error: null };
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

  const { applications, error: applicationError } = await getMyStudentApplications({ session });
  if (applicationError) return { missions: [], error: applicationError };

  const acceptedApplications = applications.filter((application) => application.status === 'accepted');

  // Extract match_ids AND accepted_club_ids that belong to this user
  const userMatchIds = [...new Set(acceptedApplications.map(app => app.match_id).filter(Boolean))];
  const userClubIds = [...new Set(acceptedApplications.map(app => app.accepted_club_id).filter(Boolean))];

  const fallbackMissions = acceptedApplications
    .filter((application) => !application.match_id)
    .map(mapAcceptedApplicationToMission);

  if (userMatchIds.length === 0 && fallbackMissions.length === 0) {
    return { missions: [], error: null };
  }

  // Double-filter: match_id must belong to this user's club
  let matchQuery = supabase
    .from('club_company_match')
    .select('match_id, club_id, companies(name, industry)')
    .in('match_id', userMatchIds.length > 0 ? userMatchIds : [-1]);

  if (userClubIds.length > 0) {
    matchQuery = matchQuery.in('club_id', userClubIds);
  }

  const { data: matches, error: matchError } = await matchQuery;
  if (matchError) return { missions: [], error: matchError.message };

  const validMatchIds = (matches || []).map(m => m.match_id);

  const { data: missionRows, error } = await supabase
    .from('missions')
    .select(`
      *,
      mission_progress(progress_percent, status),
      mission_deliverables(*)
    `)
    .in('match_id', validMatchIds.length > 0 ? validMatchIds : [-1])
    .order('created_at', { ascending: false });

  if (error) return { missions: [], error: error.message };

  const projectTitles = new Map();
  acceptedApplications.forEach(app => {
    if (app.match_id && app.project?.title) {
      projectTitles.set(app.match_id, app.project.title);
    }
  });

  const mappedMissions = mapMissionRows(missionRows, matches || []).map(m => ({
    ...m,
    projectTitle: projectTitles.get(m.match_id) || null,
  }));
  const matchesWithMissions = new Set(missionRows?.map(m => m.match_id));
  const matchesWithoutMissions = (matches || []).filter(m => !matchesWithMissions.has(m.match_id));

  const placeholderMissions = matchesWithoutMissions.map(m => ({
    id: `placeholder-${m.match_id}`,
    mission_id: null,
    match_id: m.match_id,
    club_id: m.club_id,
    companyName: m?.companies?.name || '기업',
    companyIndustry: m?.companies?.industry || '',
    title: '프로젝트 준비 중',
    projectTitle: projectTitles.get(m.match_id) || null,
    period: '일정 미정',
    targetKpi: '',
    targetMetric: null,
    reward: '',
    status: 'in_progress',
    kpiProgress: 0,
    approvalItems: [],
    approvalProgress: 0,
    overallProgress: 0,
  }));

  return { missions: [...mappedMissions, ...placeholderMissions, ...fallbackMissions], error: null };
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

  const { error: deliverableError } = await supabase
    .from('mission_deliverables')
    .insert({
      mission_id: mission.mission_id,
      title: '미션 수행 결과',
      approval_status: 'pending',
    });
  
  if (deliverableError) return { mission: null, error: deliverableError.message };

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

export async function submitMissionDeliverable({ deliverableId, missionId, clubId, content, targetMetric }) {
  if (!isSupabaseConfigured) return { error: 'Supabase 미설정' };
  const supabase = createClient();
  const today = new Date().toISOString();

  let status = 'pending';
  let isTargetMet = false;

  if (targetMetric != null && targetMetric !== '') {
    const numericContent = Number(content);
    if (!isNaN(numericContent) && numericContent >= Number(targetMetric)) {
      status = 'approved';
      isTargetMet = true;
    }
  }

  // First check if a deliverable already exists for this mission
  const { data: existingDeliverables, error: fetchError } = await supabase
    .from('mission_deliverables')
    .select('deliverable_id')
    .eq('mission_id', missionId)
    .order('deliverable_id', { ascending: true });

  if (fetchError) return { error: fetchError.message };

  let updateError;
  let returnedId = deliverableId;

  if (existingDeliverables && existingDeliverables.length > 0) {
    // Update the first one
    const mainDeliverableId = existingDeliverables[0].deliverable_id;
    returnedId = mainDeliverableId;
    const { error } = await supabase
      .from('mission_deliverables')
      .update({
        description: String(content),
        submission_date: today,
        approval_status: status,
        submitted_by_club_id: clubId,
      })
      .eq('deliverable_id', mainDeliverableId);
    updateError = error;

    // Delete any duplicates if they exist
    if (existingDeliverables.length > 1) {
      const duplicateIds = existingDeliverables.slice(1).map(d => d.deliverable_id);
      await supabase.from('mission_deliverables').delete().in('deliverable_id', duplicateIds);
    }
  } else {
    // Insert new one
    const { data: inserted, error } = await supabase
      .from('mission_deliverables')
      .insert({
        mission_id: missionId,
        title: '미션 수행 결과',
        description: String(content),
        submission_date: today,
        approval_status: status,
        submitted_by_club_id: clubId,
      })
      .select()
      .single();
    updateError = error;
    if (inserted) {
      returnedId = inserted.deliverable_id;
    }
  }

  if (updateError) return { error: updateError.message };

  if (isTargetMet) {
    // Also update mission_progress to 100%
    await supabase
      .from('mission_progress')
      .update({ progress_percent: 100, status: 'completed' })
      .eq('mission_id', missionId)
      .eq('club_id', clubId);
  }

  return { error: null, autoApproved: isTargetMet };
}

export async function approveMissionDeliverable(deliverableId, companyId, missionId, clubId) {
  if (!isSupabaseConfigured) return { error: 'Supabase 미설정' };
  const supabase = createClient();
  const today = new Date().toISOString();

  const { error } = await supabase
    .from('mission_deliverables')
    .update({
      approval_status: 'approved',
      approved_by_company_id: companyId,
      approval_date: today,
    })
    .eq('deliverable_id', deliverableId);

  if (error) return { error: error.message };

  await supabase
    .from('mission_progress')
    .update({ progress_percent: 100, status: 'completed' })
    .eq('mission_id', missionId)
    .eq('club_id', clubId);

  return { error: null };
}
