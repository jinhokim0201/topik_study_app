import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gradeWriting, analyzeResults } from '../services/geminiService';
import Button from '../components/common/Button';
import './Result.css';

function Result() {
    const navigate = useNavigate();
    const [results, setResults] = useState(null);
    const [writingFeedback, setWritingFeedback] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, listening, reading, writing

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        const savedResults = localStorage.getItem('mockTestResults');
        if (!savedResults) {
            alert('시험 결과가 없습니다.');
            navigate('/');
            return;
        }

        const parsedResults = JSON.parse(savedResults);
        setResults(parsedResults);

        try {
            // 쓰기 답안 AI 채점
            const feedbacks = [];
            if (parsedResults.writing?.answers) {
                for (let i = 0; i < parsedResults.writing.answers.length; i++) {
                    if (parsedResults.writing.answers[i]) {
                        const feedback = await gradeWriting(
                            parsedResults.writing.answers[i],
                            `TOPIK ${parsedResults.level}급 쓰기 문제 ${i + 1}`,
                            parsedResults.level
                        );
                        feedbacks.push(feedback);
                    }
                }
            }
            setWritingFeedback(feedbacks);

            // 평균 쓰기 점수 계산
            if (feedbacks.length > 0) {
                const avgWritingScore = feedbacks.reduce((sum, f) => sum + f.totalScore, 0) / feedbacks.length;
                parsedResults.writing.score = avgWritingScore;
            }

            // 전체 분석
            const totalScore =
                parsedResults.listening.score +
                parsedResults.reading.score +
                (parsedResults.writing.score || 0);

            const weakAreas = [];
            if (parsedResults.listening.accuracy < 60) weakAreas.push('듣기');
            if (parsedResults.reading.accuracy < 60) weakAreas.push('읽기');

            const analysisData = await analyzeResults({
                listening: parsedResults.listening,
                reading: parsedResults.reading,
                writing: parsedResults.writing,
                totalScore,
                currentLevel: parsedResults.level,
                targetLevel: Math.min(parsedResults.level + 1, 6),
                weakAreas
            });

            setAnalysis(analysisData);
        } catch (error) {
            console.error('결과 분석 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="result">
                <div className="container">
                    <div className="loading-card card">
                        <div className="loading-spinner"></div>
                        <h3>AI가 시험 결과를 분석하고 있습니다...</h3>
                        <p>상세한 피드백을 생성 중입니다</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!results) {
        return null;
    }

    const totalScore =
        results.listening.score +
        results.reading.score +
        (results.writing.score || 0);

    const totalPossible =
        results.listening.total +
        results.reading.total +
        40; // 쓰기 최대 40점

    const overallAccuracy = (totalScore / totalPossible) * 100;

    return (
        <div className="result">
            <div className="container">
                {/* 헤더 */}
                <div className="result-header">
                    <div className="trophy-icon">🏆</div>
                    <h1>학습 결과서</h1>
                    <p className="test-level badge badge-primary">{results.level}급 모의고사</p>
                </div>

                {/* 종합 점수 */}
                <div className="score-overview card">
                    <h2>종합 성적</h2>

                    <div className="total-score-display">
                        <div className="score-circle">
                            <div className="score-number">{totalScore.toFixed(0)}</div>
                            <div className="score-label">/ {totalPossible}점</div>
                        </div>
                        <div className="accuracy-badge">
                            정답률: {overallAccuracy.toFixed(1)}%
                        </div>
                    </div>

                    <div className="section-scores">
                        <div className="section-score-item">
                            <div className="section-icon">🎧</div>
                            <div className="section-info">
                                <h4>듣기</h4>
                                <div className="score-bar">
                                    <div
                                        className="score-fill"
                                        style={{ width: `${results.listening.accuracy}%` }}
                                    ></div>
                                </div>
                                <p>{results.listening.score} / {results.listening.total} ({results.listening.accuracy.toFixed(1)}%)</p>
                            </div>
                        </div>

                        <div className="section-score-item">
                            <div className="section-icon">📖</div>
                            <div className="section-info">
                                <h4>읽기</h4>
                                <div className="score-bar">
                                    <div
                                        className="score-fill"
                                        style={{ width: `${results.reading.accuracy}%` }}
                                    ></div>
                                </div>
                                <p>{results.reading.score} / {results.reading.total} ({results.reading.accuracy.toFixed(1)}%)</p>
                            </div>
                        </div>

                        <div className="section-score-item">
                            <div className="section-icon">✍️</div>
                            <div className="section-info">
                                <h4>쓰기</h4>
                                <div className="score-bar">
                                    <div
                                        className="score-fill"
                                        style={{ width: `${(results.writing.score / 40) * 100}%` }}
                                    ></div>
                                </div>
                                <p>{results.writing.score.toFixed(1)} / 40 ({((results.writing.score / 40) * 100).toFixed(1)}%)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 종합 분석
                    </button>
                    <button
                        className={`tab ${activeTab === 'writing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('writing')}
                    >
                        ✍️ 쓰기 피드백
                    </button>
                    <button
                        className={`tab ${activeTab === 'improvement' ? 'active' : ''}`}
                        onClick={() => setActiveTab('improvement')}
                    >
                        📈 개선 계획
                    </button>
                </div>

                {/* 탭 컨텐츠 */}
                <div className="tab-content">
                    {activeTab === 'overview' && analysis && (
                        <div className="overview-section card fade-in">
                            <h3>💡 종합 평가</h3>
                            <p className="assessment-text">{analysis.overallAssessment}</p>

                            <div className="strengths-weaknesses">
                                <div className="strength-box">
                                    <h4>✅ 강점</h4>
                                    <ul>
                                        {analysis.strengthAreas.map((strength, index) => (
                                            <li key={index}>{strength}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="weakness-box">
                                    <h4>⚠️ 개선 필요</h4>
                                    <ul>
                                        {analysis.improvementAreas.map((area, index) => (
                                            <li key={index}>{area}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'writing' && writingFeedback.length > 0 && (
                        <div className="writing-feedback-section">
                            {writingFeedback.map((feedback, index) => (
                                <div key={index} className="writing-feedback-card card fade-in">
                                    <h3>문제 {index + 1} 피드백</h3>

                                    <div className="score-breakdown">
                                        <div className="score-item">
                                            <span className="score-label">문법</span>
                                            <span className="score-value">{feedback.scores.grammar}/10</span>
                                        </div>
                                        <div className="score-item">
                                            <span className="score-label">어휘</span>
                                            <span className="score-value">{feedback.scores.vocabulary}/10</span>
                                        </div>
                                        <div className="score-item">
                                            <span className="score-label">내용</span>
                                            <span className="score-value">{feedback.scores.content}/10</span>
                                        </div>
                                        <div className="score-item">
                                            <span className="score-label">구조</span>
                                            <span className="score-value">{feedback.scores.structure}/10</span>
                                        </div>
                                    </div>

                                    <div className="grade-display">
                                        <span className={`grade-badge grade-${feedback.grade}`}>
                                            {feedback.grade}
                                        </span>
                                    </div>

                                    {feedback.grammarErrors && feedback.grammarErrors.length > 0 && (
                                        <div className="errors-section">
                                            <h5>📝 문법 오류</h5>
                                            {feedback.grammarErrors.map((error, i) => (
                                                <div key={i} className="error-item">
                                                    <div className="error-original">❌ {error.original}</div>
                                                    <div className="error-corrected">✅ {error.corrected}</div>
                                                    <div className="error-explanation">{error.explanation}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="improvement-tips-section">
                                        <h5>💡 개선 포인트</h5>
                                        <ul>
                                            {feedback.improvementTips.map((tip, i) => (
                                                <li key={i}>{tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'improvement' && analysis && (
                        <div className="improvement-section card fade-in">
                            <h3>📅 4주 학습 계획</h3>

                            <div className="study-plan">
                                {Object.keys(analysis.studyPlan).map((week, index) => (
                                    <div key={week} className="week-plan">
                                        <h4>{index + 1}주차</h4>
                                        <ul>
                                            {analysis.studyPlan[week].map((task, i) => (
                                                <li key={i}>{task}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <div className="goals-section">
                                <h4>🎯 학습 목표</h4>
                                <ul className="goals-list">
                                    {analysis.goals.map((goal, index) => (
                                        <li key={index}>{goal}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* 액션 버튼 */}
                <div className="result-actions">
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => navigate('/mocktest')}
                        icon="🔄"
                    >
                        다시 도전하기
                    </Button>

                    <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        onClick={() => navigate('/')}
                        className="mt-md"
                        icon="🏠"
                    >
                        홈으로 돌아가기
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Result;
