import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from './SectionHeading.jsx';

const INITIAL_FILTERS = {
  category: '전체',
  duration: '전체',
  reward: '전체',
  status: '전체',
};

const CATEGORY_OPTIONS = ['전체', '마케팅', 'IT/개발', '디자인', '기획', '영업', '교육'];
const DURATION_OPTIONS = ['전체', '1주', '2주', '3주', '4주 (1개월)', '2개월', '3개월', '4개월', '5개월', '6개월', '1년 이상'];
const REWARD_OPTIONS = ['전체', '활동비 있음', '기프티콘', '수료증', '포트폴리오 제공'];
const STATUS_OPTIONS = ['전체', '모집 중', '마감'];

const normalizeText = (value) => String(value ?? '').replace(/\s+/g, '').toLowerCase();

const matchesTextOption = (option, values) => {
  if (option === '전체') return true;
  const target = normalizeText(option);
  return values.some((value) => normalizeText(value).includes(target));
};

const matchesDurationOption = (option, values) => {
  if (option === '전체') return true;
  if (option === '4주 (1개월)') return ['4주', '1개월'].some((duration) => matchesTextOption(duration, values));
  if (option === '1년 이상') return ['1년', '2년', '3년'].some((duration) => matchesTextOption(duration, values));
  return matchesTextOption(option, values);
};

const normalizeStatus = (status) => {
  const normalized = normalizeText(status);
  if (['마감', '마감됨', '완료', '완료됨', 'closed', 'close'].includes(normalized)) return '마감';
  return '모집 중';
};

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="project-filter-field">
      <span>{label}</span>
      <select className="project-filter-select" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FeaturedProjectsSection({ projects, copy, isLoading, error }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const updateFilter = (key, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const textValues = [project.startupName, project.title, project.period, project.reward, project.status, ...project.tags];
      const periodValues = [project.period];
      const rewardValues = [project.reward, ...project.tags];

      return (
        matchesTextOption(filters.category, textValues) &&
        matchesDurationOption(filters.duration, periodValues) &&
        matchesTextOption(filters.reward, rewardValues) &&
        (filters.status === '전체' || normalizeStatus(project.status) === filters.status)
      );
    });
  }, [filters, projects]);

  return (
    <section className="featured-section section-spacing">
      <div className="section-wrap">
        <SectionHeading
          eyebrow={copy.sectionEyebrow}
          title={copy.sectionTitle}
          description={copy.sectionDescription}
        />

        {(isLoading || error) && (
          <div className="project-data-status" role="status">
            {isLoading ? copy.loadingMessage : copy.errorMessage}
            {!isLoading && error ? <span>{error}</span> : null}
          </div>
        )}

        <div className="project-toolbar project-toolbar--filters">
          <div className="project-filter-bar" aria-label="공고 필터">
            <FilterSelect
              label="분야"
              value={filters.category}
              options={CATEGORY_OPTIONS}
              onChange={(value) => updateFilter('category', value)}
            />
            <FilterSelect
              label="기간"
              value={filters.duration}
              options={DURATION_OPTIONS}
              onChange={(value) => updateFilter('duration', value)}
            />
            <FilterSelect
              label="보상"
              value={filters.reward}
              options={REWARD_OPTIONS}
              onChange={(value) => updateFilter('reward', value)}
            />
            <div className="project-filter-field project-filter-field--status">
              <span>모집 상태</span>
              <div className="project-status-tabs" role="tablist" aria-label="모집 상태">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`project-status-tab ${filters.status === status ? 'project-status-tab--active' : ''}`}
                    onClick={() => updateFilter('status', status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="project-filter-reset" onClick={resetFilters}>
              초기화
            </button>
          </div>
          <span className="project-count" aria-live="polite">
            {filteredProjects.length} / {projects.length}개 공고
          </span>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="project-grid">
            {filteredProjects.map((project) => (
              <Link className="project-card" to={`/projects/${project.id}`} key={project.id}>
                <div className="project-card-top">
                  <span className="startup-name">{project.startupName}</span>
                  <span className={`status-pill status-${project.status}`}>{project.status}</span>
                </div>
                <h3>{project.title}</h3>
                <div className="tag-row">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <dl className="project-meta">
                  <div>
                    <dt>활동 기간</dt>
                    <dd>{project.period}</dd>
                  </div>
                  <div>
                    <dt>보상</dt>
                    <dd>{project.reward}</dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
        ) : (
          <div className="project-empty" role="status">
            {projects.length === 0 ? copy.noProjectsMessage : copy.emptyMessage}
          </div>
        )}

        <div className="project-more">
          <Link className="button button-secondary button-large" to={copy.moreHref}>
            {copy.moreLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
