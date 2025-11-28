import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const [userLevel, setUserLevel] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // 로컬 스토리지에서 사용자 급수 불러오기
        const savedLevel = localStorage.getItem('userLevel');
        if (savedLevel) {
            setUserLevel(parseInt(savedLevel));
        }

        // 다크 모드 설정 불러오기
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    };

    const menuItems = [
        {
            id: 'diagnostic',
            title: '급수 진단테스트',
            description: '나의 한국어 실력을 정확하게 진단하고 맞춤 급수를 알아보세요',
            icon: '📝',
            path: '/diagnostic',
            color: 'primary'
        },
        {
            id: 'listening',
            title: '듣기 학습',
            description: '실전 듣기 문제로 청해 능력을 향상시키세요',
            icon: '🎧',
            path: '/listening',
            color: 'secondary'
        },
        {
            id: 'reading',
            title: '읽기 학습',
            description: '다양한 주제의 지문으로 독해 실력을 키우세요',
            icon: '📖',
            path: '/reading',
            color: 'success'
        },
        {
            id: 'mocktest',
            title: '실전모의고사',
            description: '실제 시험과 동일한 환경에서 실력을 점검하세요',
            icon: '✍️',
            path: '/mocktest',
            color: 'warning'
        }
    ];

    const levelInfo = [
        { level: 1, name: '초급 1', score: '80-139점', description: '자기소개, 물건 사기 등 생존 필수 기능 수행' },
        { level: 2, name: '초급 2', score: '140-200점', description: '전화, 부탁 등 일상 기능 수행, 공공시설 이용' },
        { level: 3, name: '중급 1', score: '120-149점', description: '공공시설 이용과 사회적 관계 유지 기능 수행' },
        { level: 4, name: '중급 2', score: '150-189점', description: '업무 수행과 뉴스/신문 이해 기능 수행' },
        { level: 5, name: '고급 1', score: '190-229점', description: '전문 분야에서의 연구나 업무 수행 기능' },
        { level: 6, name: '고급 2', score: '230-300점', description: '전문 분야에서의 연구나 업무를 비교적 유창하게 수행' }
    ];

    return (
        <div className="home">
            {/* 헤더 */}
            <header className="home-header">
                <div className="container">
                    <div className="header-content flex-between">
                        <div className="logo">
                            <h1>🇰🇷 TOPIK Master</h1>
                            <p className="subtitle">한국어능력시험 완벽 대비</p>
                        </div>
                        <button className="btn-icon" onClick={toggleDarkMode}>
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                </div>
            </header>

            {/* 메인 섹션 */}
            <main className="home-main">
                <div className="container">
                    {/* 환영 메시지 */}
                    <section className="welcome-section fade-in">
                        <h2>TOPIK 시험 합격을 향한 여정</h2>
                        <p className="welcome-text">
                            체계적인 학습과 AI 기반 맞춤 피드백으로
                            <strong> 목표 급수 달성</strong>을 지원합니다
                        </p>
                        {userLevel && (
                            <div className="current-level">
                                <span className="badge badge-primary">현재 급수: {userLevel}급</span>
                            </div>
                        )}
                    </section>

                    {/* 메뉴 카드 */}
                    <section className="menu-section">
                        <div className="menu-grid">
                            {menuItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`menu-card card fade-in`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    onClick={() => navigate(item.path)}
                                >
                                    <div className={`menu-icon ${item.color}`}>
                                        <span>{item.icon}</span>
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                    <div className="menu-arrow">→</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 급수 안내 */}
                    <section className="level-info-section">
                        <h2>TOPIK 급수 안내</h2>
                        <div className="level-grid">
                            {levelInfo.map((info) => (
                                <div
                                    key={info.level}
                                    className={`level-card card ${userLevel === info.level ? 'active' : ''}`}
                                >
                                    <div className="level-header">
                                        <div className="level-number">{info.level}급</div>
                                        <div className="level-name">{info.name}</div>
                                    </div>
                                    <div className="level-score">{info.score}</div>
                                    <p className="level-desc">{info.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 특징 섹션 */}
                    <section className="features-section">
                        <h2>TOPIK Master 특징</h2>
                        <div className="features-grid">
                            <div className="feature-card card">
                                <div className="feature-icon">🤖</div>
                                <h4>AI 기반 문제 생성</h4>
                                <p>실제 TOPIK 스타일의 문제를 AI가 무한정 생성</p>
                            </div>
                            <div className="feature-card card">
                                <div className="feature-icon">📊</div>
                                <h4>상세한 성적 분석</h4>
                                <p>문법, 어휘, 내용 분석으로 약점 파악</p>
                            </div>
                            <div className="feature-card card">
                                <div className="feature-icon">💡</div>
                                <h4>맞춤형 학습 계획</h4>
                                <p>AI가 분석한 결과로 개인별 학습 방향 제시</p>
                            </div>
                            <div className="feature-card card">
                                <div className="feature-icon">🎯</div>
                                <h4>실전 모의고사</h4>
                                <p>실제 시험 환경에서 실력 점검</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* 푸터 */}
            <footer className="home-footer">
                <div className="container">
                    <p>© 2025 TOPIK Master. Made with ❤️ for Korean learners.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
