export type ActivityType =
  | 'viral-content'
  | 'campus-community'
  | 'campus-event'
  | 'campus-experience'
  | 'survey-feedback'
  | 'long-term-ambassador';

export type WorkMode = 'online' | 'offline' | 'hybrid';

export type CampaignPostStatus = 'draft' | 'open' | 'closed';

export interface CompanyInfo {
  companyName: string;
  serviceName: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  category: string;
}

export interface ProjectBasicInfo {
  title: string;
  purpose: string;
  target: string;
  activityTypes: ActivityType[];
  workMode: WorkMode | '';
  period: string;
  deadline: string;
}

export interface RewardAndConditionInfo {
  recruitCount: string;
  regions: string;
  rewardSummary: string;
  activityBudget: string;
  performanceBonus: string;
  certificate: boolean;
  networking: boolean;
  internshipLinked: boolean;
}

export interface MissionInfo {
  mainMission: string;
  deliverables: string[];
  deliverableDescription: string;
  preferredQualifications: string;
  notes: string;
}

export interface CampaignPost {
  id: string;
  status: CampaignPostStatus;
  company: CompanyInfo;
  project: ProjectBasicInfo;
  rewardAndCondition: RewardAndConditionInfo;
  mission: MissionInfo;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignPostFormValues {
  companyName: string;
  serviceName: string;
  tagline: string;
  companyDescription: string;
  websiteUrl: string;
  category: string;
  title: string;
  purpose: string;
  target: string;
  activityTypes: ActivityType[];
  workMode: WorkMode | '';
  period: string;
  deadline: string;
  recruitCount: string;
  regions: string;
  rewardSummary: string;
  activityBudget: string;
  performanceBonus: string;
  certificate: boolean;
  networking: boolean;
  internshipLinked: boolean;
  mainMission: string;
  deliverables: string[];
  deliverableDescription: string;
  preferredQualifications: string;
  notes: string;
}
