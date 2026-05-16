import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { homepageCopy } from '../data/homepage.js';
import { studentProjectsList } from '../data/studentDashboardData.js';

const studentHeaderCopy = {
  ...homepageCopy,
  navigation: [],
  authenticatedNavigation: [],
  headerActions: [{ label: "기업 대시보드로", href: "/dashboard/company", variant: "secondary" }],
};

export default function StudentDashboardHub() {
  const [clubInfo, setClubInfo] = useState(null);
  const [isEditingClub, setIsEditingClub] = useState(false);

  const [clubForm, setClubForm] = useState({
    clubName: '',
    university: '',
    owner: '',
  });

  const handleClubSubmit = (e) => {
    e.preventDefault();
    setClubInfo(clubForm);
    setIsEditingClub(false);
  };

  const startEditing = () => {
    setClubForm(clubInfo);
    setIsEditingClub(true);
  };

  return (
    <div className="app-shell">
      <Header copy={studentHeaderCopy} isAuthenticated={false} />
      <main className="section-wrap section-spacing">
        <div className="hub-grid">
          
          <section className="hub-panel club-info-panel">
            <div className="hub-panel-header">
              <h2>동아리 정보</h2>
              {clubInfo && !isEditingClub && (
                <button type="button" className="button button-secondary" onClick={startEditing}>정보 수정</button>
              )}
            </div>

            {!clubInfo || isEditingClub ? (
              <form className="club-info-form" onSubmit={handleClubSubmit}>
                <div className="form-group">
                  <label>동아리/학회명</label>
                  <input required value={clubForm.clubName} onChange={e => setClubForm({...clubForm, clubName: e.target.value})} placeholder="예: 연세대 마케팅학회 PRISM" />
                </div>
                <div className="form-group">
                  <label>소속 대학</label>
                  <input required value={clubForm.university} onChange={e => setClubForm({...clubForm, university: e.target.value})} placeholder="예: 연세대" />
                </div>
                <div className="form-group">
                  <label>대표자 이름</label>
                  <input required value={clubForm.owner} onChange={e => setClubForm({...clubForm, owner: e.target.value})} placeholder="예: 김민서" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="button button-primary">
                    {clubInfo ? '수정 완료' : '정보 등록하기'}
                  </button>
                  {clubInfo && isEditingClub && (
                    <button type="button" className="button button-secondary" onClick={() => setIsEditingClub(false)}>취소</button>
                  )}
                </div>
              </form>
            ) : (
              <div className="club-info-view">
                <div className="info-item">
                  <span>동아리/학회명</span>
                  <strong>{clubInfo.clubName}</strong>
                </div>
                <div className="info-item">
                  <span>소속 대학</span>
                  <strong>{clubInfo.university}</strong>
                </div>
                <div className="info-item">
                  <span>대표자 이름</span>
                  <strong>{clubInfo.owner}</strong>
                </div>
              </div>
            )}
          </section>

          <section className="hub-panel projects-panel">
            <div className="hub-panel-header">
              <h2>진행 중인 프로젝트</h2>
            </div>
            
            <div className="hub-project-list">
              {studentProjectsList.map(project => (
                <Link key={project.id} to={`/dashboard/student/project/${project.id}`} className="hub-project-card">
                  <div className="hub-project-top">
                    <span className="hub-project-company">{project.companyName}</span>
                    <span className={`status-pill status-${project.status === '진행중' ? '신규' : '마감임박'}`}>{project.status}</span>
                  </div>
                  <h3>{project.campaignName}</h3>
                  <div className="hub-project-bottom">
                    <span>마감일: {project.dueDate}</span>
                    <span className="hub-project-arrow">상세 보기 →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
