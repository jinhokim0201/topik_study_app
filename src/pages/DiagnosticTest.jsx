import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestions } from '../services/geminiService';
import Button from '../components/common/Button';
import './DiagnosticTest.css';

function DiagnosticTest() {
    const navigate = useNavigate();
    const [stage, setStage] = useState('intro'); // intro, loading, test, result
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [diagnosedLevel, setDiagnosedLevel] = useState(null);

    const startTest = async () => {
        setStage('loading');
        setLoading(true);

        try {
            // 첫 번째 문제만 먼저 로드 (2급 듣기 문제)
            const firstQuestion = await generateQuestions(2, 'listening', 1);
            setQuestions(firstQuestion);
            setStage('test');
            setLoading(false);

            // 백그라운드에서 나머지 문제들을 순차적으로 생성
            loadRemainingQuestions();
        } catch (error) {
            console.error('문제 생성 오류:', error);
            alert('문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
            setStage('intro');
            setLoading(false);
        }
    };

    const loadRemainingQuestions = async () => {
        try {
            // 나머지 2급 듣기 문제 (4개)
            for (let i = 0; i < 4; i++) {
                const question = await generateQuestions(2, 'listening', 1);
                setQuestions(prev => [...prev, ...question]);
            }

            // 4급 듣기 문제 (5개)
            for (let i = 0; i < 5; i++) {
                const question = await generateQuestions(4, 'listening', 1);
                setQuestions(prev => [...prev, ...question]);
            }

            // 6급 듣기 문제 (5개)
            for (let i = 0; i < 5; i++) {
                const question = await generateQuestions(6, 'listening', 1);
                setQuestions(prev => [...prev, ...question]);
            }

            // 2급 읽기 문제 (5개)
            for (let i = 0; i < 5; i++) {
                const question = await generateQuestions(2, 'reading', 1);
                setQuestions(prev => [...prev, ...question]);
            }

            // 4급 읽기 문제 (5개)
            for (let i = 0; i < 5; i++) {
                const question = await generateQuestions(4, 'reading', 1);
                setQuestions(prev => [...prev, ...question]);
            }

            // 6급 읽기 문제 (5개)
            for (let i = 0; i < 5; i++) {
                const question = await generateQuestions(6, 'reading', 1);
                setQuestions(prev => [...prev, ...question]);
            }
        } catch (error) {
            console.error('추가 문제 생성 오류:', error);
            // 오류가 발생해도 이미 로드된 문제로 계속 진행 가능
        }
    };

    const handleAnswer = (answerIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = answerIndex;
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // 모든 문제를 풀었는지 확인
            if (questions.length < 30) {
                // 아직 30문제가 생성되지 않았다면 잠시 대기
                alert('문제를 생성 중입니다. 잠시만 기다려주세요.');
            } else {
                calculateLevel(newAnswers);
            }
        }
    };

    const calculateLevel = (finalAnswers) => {
        let correctCount = 0;
        questions.forEach((q, index) => {
            if (finalAnswers[index] === q.correctAnswer) {
                correctCount++;
            }
        });

        const accuracy = (correctCount / questions.length) * 100;

        let level;
        if (accuracy >= 90) level = 6;
        else if (accuracy >= 75) level = 5;
        else if (accuracy >= 60) level = 4;
        else if (accuracy >= 45) level = 3;
        else if (accuracy >= 30) level = 2;
        else level = 1;

        setDiagnosedLevel(level);
        localStorage.setItem('userLevel', level.toString());
        setStage('result');
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="diagnostic-test">
            <div className="container">
                {/* 인트로 화면 */}
                {stage === 'intro' && (
                    <div className="intro-section fade-in">
                        <div className="card intro-card">
                            <h1>📝 급수 진단테스트</h1>
                            <p className="intro-desc">
                                30문항의 테스트를 통해 당신의 한국어 실력을 정확하게 진단합니다.
                            </p>

                            <div className="test-info">
                                <div className="info-item">
                                    <span className="info-icon">📊</span>
                                    <div className="info-content">
                                        <h4>문항 수</h4>
                                        <p>듣기 15문항 + 읽기 15문항</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span className="info-icon">⏱️</span>
                                    <div className="info-content">
                                        <h4>예상 소요 시간</h4>
                                        <p>약 20분</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span className="info-icon">🎯</span>
                                    <div className="info-content">
                                        <h4>진단 결과</h4>
                                        <p>1급~6급 중 예상 급수 제시</p>
                                    </div>
                                </div>
                            </div>

                            <div className="test-guide">
                                <h4>테스트 가이드</h4>
                                <ul>
                                    <li>✓ 조용한 환경에서 집중해서 풀어주세요</li>
                                    <li>✓ 사전이나 다른 도구를 사용하지 마세요</li>
                                    <li>✓ 정직하게 답변해야 정확한 진단이 가능합니다</li>
                                </ul>
                            </div>

                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={startTest}
                                icon="🚀"
                            >
                                테스트 시작하기
                            </Button>

                            <Button
                                variant="outline"
                                size="md"
                                fullWidth
                                onClick={() => navigate('/')}
                                className="mt-md"
                            >
                                돌아가기
                            </Button>
                        </div>
                    </div>
                )}

                {/* 로딩 화면 */}
                {stage === 'loading' && (
                    <div className="loading-section fade-in">
                        <div className="card loading-card">
                            <div className="loading-spinner"></div>
                            <h3>AI가 맞춤 문제를 생성하고 있습니다...</h3>
                            <p>잠시만 기다려주세요</p>
                        </div>
                    </div>
                )}

                {/* 테스트 화면 */}
                {stage === 'test' && currentQuestion && (
                    <div className="test-section fade-in">
                        {/* 진행 바 */}
                        <div className="test-header">
                            <div className="progress-info">
                                <span className="question-number">
                                    문제 {currentQuestionIndex + 1} / {questions.length}
                                </span>
                                <span className="question-type badge badge-primary">
                                    {currentQuestion.type === 'listening' ? '🎧 듣기' : '📖 읽기'}
                                </span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        {/* 문제 카드 */}
                        <div className="question-card card">
                            {currentQuestion.type === 'listening' && (
                                <div className="audio-section">
                                    <div className="audio-script">
                                        <p>{currentQuestion.audioScript}</p>
                                    </div>
                                </div>
                            )}

                            {currentQuestion.type === 'reading' && currentQuestion.passage && (
                                <div className="reading-passage">
                                    <p>{currentQuestion.passage}</p>
                                </div>
                            )}

                            <div className="question-text">
                                <h3>{currentQuestion.question}</h3>
                            </div>

                            <div className="options">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        className="option-button"
                                        onClick={() => handleAnswer(index)}
                                    >
                                        <span className="option-number">{index + 1}</span>
                                        <span className="option-text">{option}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 결과 화면 */}
                {stage === 'result' && diagnosedLevel && (
                    <div className="result-section fade-in">
                        <div className="card result-card">
                            <div className="result-trophy">🏆</div>
                            <h1>진단 완료!</h1>
                            <p className="result-subtitle">당신의 예상 급수는</p>

                            <div className="level-display">
                                <div className="level-number">{diagnosedLevel}급</div>
                                <div className="level-description">
                                    {diagnosedLevel <= 2 && '초급 - 기본적인 한국어 능력'}
                                    {diagnosedLevel >= 3 && diagnosedLevel <= 4 && '중급 - 일상적인 한국어 활용 가능'}
                                    {diagnosedLevel >= 5 && '고급 - 전문적인 한국어 구사 가능'}
                                </div>
                            </div>

                            <div className="next-steps">
                                <h4>이제 뭐 하죠?</h4>
                                <p>{diagnosedLevel}급에 맞춘 맞춤 학습을 시작하세요!</p>
                            </div>

                            <div className="result-actions">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={() => navigate('/listening')}
                                    icon="🎧"
                                >
                                    듣기 학습 시작
                                </Button>

                                <Button
                                    variant="secondary"
                                    size="lg"
                                    fullWidth
                                    onClick={() => navigate('/reading')}
                                    icon="📖"
                                    className="mt-md"
                                >
                                    읽기 학습 시작
                                </Button>

                                <Button
                                    variant="outline"
                                    size="md"
                                    fullWidth
                                    onClick={() => navigate('/')}
                                    className="mt-md"
                                >
                                    홈으로 돌아가기
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DiagnosticTest;
