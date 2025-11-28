import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestions, gradeWriting } from '../services/geminiService';
import Button from '../components/common/Button';
import './MockTest.css';

function MockTest() {
    const navigate = useNavigate();
    const [userLevel, setUserLevel] = useState(3);
    const [stage, setStage] = useState('intro'); // intro, loading, listening, reading, writing, complete
    const [questions, setQuestions] = useState({ listening: [], reading: [], writing: [] });
    const [currentSection, setCurrentSection] = useState('listening');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({ listening: [], reading: [], writing: [] });
    const [writingAnswers, setWritingAnswers] = useState(['', '', '', '']);
    const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60분
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedLevel = localStorage.getItem('userLevel');
        if (savedLevel) {
            setUserLevel(parseInt(savedLevel));
        }
    }, []);

    useEffect(() => {
        if (stage !== 'intro' && stage !== 'loading' && stage !== 'complete') {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        handleComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [stage]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startTest = async () => {
        setStage('loading');
        setLoading(true);

        try {
            // TOPIK II 기준: 듣기 50문항, 읽기 50문항, 쓰기 4문항
            const [listeningQuestions, readingQuestions, writingQuestions] = await Promise.all([
                generateQuestions(userLevel, 'listening', 50),
                generateQuestions(userLevel, 'reading', 50),
                generateQuestions(userLevel, 'writing', 4),
            ]);

            setQuestions({
                listening: listeningQuestions,
                reading: readingQuestions,
                writing: writingQuestions
            });

            setStage('listening');
            setTimeRemaining(60 * 60); // 듣기 60분
        } catch (error) {
            console.error('모의고사 생성 오류:', error);
            alert('모의고사를 생성하는 중 오류가 발생했습니다.');
            setStage('intro');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (answerIndex) => {
        const newAnswers = { ...answers };
        newAnswers[currentSection][currentIndex] = answerIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        const sectionQuestions = questions[currentSection];
        if (currentIndex < sectionQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            moveToNextSection();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const moveToNextSection = () => {
        setCurrentIndex(0);
        if (currentSection === 'listening') {
            setCurrentSection('reading');
            setTimeRemaining(70 * 60); // 읽기 70분
        } else if (currentSection === 'reading') {
            setCurrentSection('writing');
            setTimeRemaining(50 * 60); // 쓰기 50분
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        // 결과 저장
        const results = {
            level: userLevel,
            listening: {
                total: questions.listening.length,
                score: calculateScore('listening'),
                accuracy: (calculateScore('listening') / questions.listening.length) * 100
            },
            reading: {
                total: questions.reading.length,
                score: calculateScore('reading'),
                accuracy: (calculateScore('reading') / questions.reading.length) * 100
            },
            writing: {
                total: 4,
                score: 0, // AI 채점 예정
                answers: writingAnswers
            }
        };

        localStorage.setItem('mockTestResults', JSON.stringify(results));
        navigate('/result');
    };

    const calculateScore = (section) => {
        let score = 0;
        answers[section].forEach((answer, index) => {
            if (answer === questions[section][index]?.correctAnswer) {
                score++;
            }
        });
        return score;
    };

    const currentQuestion = questions[currentSection]?.[currentIndex];
    const progress = currentSection === 'writing'
        ? 100
        : ((currentIndex + 1) / questions[currentSection].length) * 100;

    if (stage === 'intro') {
        return (
            <div className="mocktest">
                <div className="container">
                    <div className="intro-section fade-in">
                        <div className="card intro-card">
                            <h1>✍️ 실전모의고사</h1>
                            <p className="intro-desc">
                                실제 TOPIK 시험과 동일한 환경에서 실력을 점검하세요
                            </p>

                            <div className="test-structure">
                                <h4>시험 구성 (TOPIK II)</h4>
                                <div className="structure-grid">
                                    <div className="structure-item">
                                        <div className="structure-icon">🎧</div>
                                        <h5>듣기</h5>
                                        <p>50문항 / 60분</p>
                                    </div>
                                    <div className="structure-item">
                                        <div className="structure-icon">📖</div>
                                        <h5>읽기</h5>
                                        <p>50문항 / 70분</p>
                                    </div>
                                    <div className="structure-item">
                                        <div className="structure-icon">✍️</div>
                                        <h5>쓰기</h5>
                                        <p>4문항 / 50분</p>
                                    </div>
                                </div>
                            </div>

                            <div className="level-selector-section">
                                <label>시험 급수:</label>
                                <select
                                    value={userLevel}
                                    onChange={(e) => setUserLevel(parseInt(e.target.value))}
                                >
                                    {[3, 4, 5, 6].map(level => (
                                        <option key={level} value={level}>{level}급</option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={startTest}
                                icon="🚀"
                            >
                                모의고사 시작
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
                </div>
            </div>
        );
    }

    if (stage === 'loading') {
        return (
            <div className="mocktest">
                <div className="container">
                    <div className="loading-card card">
                        <div className="loading-spinner"></div>
                        <h3>AI가 {userLevel}급 모의고사를 생성하고 있습니다...</h3>
                        <p>104개의 문제를 준비 중입니다</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mocktest">
            <div className="container">
                {/* 헤더 */}
                <div className="test-header">
                    <div className="header-info flex-between">
                        <div className="section-badge badge badge-primary">
                            {currentSection === 'listening' && '🎧 듣기'}
                            {currentSection === 'reading' && '📖 읽기'}
                            {currentSection === 'writing' && '✍️ 쓰기'}
                        </div>
                        <div className="timer-display">
                            ⏱️ {formatTime(timeRemaining)}
                        </div>
                    </div>

                    {currentSection !== 'writing' && (
                        <div className="progress-info">
                            <span>문제 {currentIndex + 1} / {questions[currentSection].length}</span>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 듣기/읽기 문제 */}
                {(currentSection === 'listening' || currentSection === 'reading') && currentQuestion && (
                    <div className="question-card card">
                        {currentSection === 'listening' && (
                            <div className="audio-section">
                                <div className="audio-icon">🎵</div>
                                <p>{currentQuestion.audioScript}</p>
                            </div>
                        )}

                        {currentSection === 'reading' && currentQuestion.passage && (
                            <div className="passage-section">
                                <p>{currentQuestion.passage}</p>
                            </div>
                        )}

                        <h3 className="question-text">{currentQuestion.question}</h3>

                        <div className="options">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`option-button ${answers[currentSection][currentIndex] === index ? 'selected' : ''}`}
                                    onClick={() => handleAnswer(index)}
                                >
                                    <span className="option-number">{index + 1}</span>
                                    <span className="option-text">{option}</span>
                                </button>
                            ))}
                        </div>

                        <div className="navigation-buttons">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                            >
                                이전 문제
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleNext}
                            >
                                {currentIndex === questions[currentSection].length - 1 ? '다음 영역' : '다음 문제'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* 쓰기 문제 */}
                {currentSection === 'writing' && (
                    <div className="writing-section">
                        {questions.writing.map((question, index) => (
                            <div key={index} className="writing-question card">
                                <h3>문제 {index + 1}</h3>
                                <p className="writing-prompt">{question.prompt}</p>
                                <div className="word-count-info">
                                    권장 글자 수: {question.wordCount}자
                                </div>

                                {question.guidelines && (
                                    <div className="guidelines">
                                        <h5>작성 가이드:</h5>
                                        <ul>
                                            {question.guidelines.map((guide, i) => (
                                                <li key={i}>{guide}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <textarea
                                    className="writing-textarea"
                                    placeholder="답안을 작성하세요..."
                                    value={writingAnswers[index]}
                                    onChange={(e) => {
                                        const newAnswers = [...writingAnswers];
                                        newAnswers[index] = e.target.value;
                                        setWritingAnswers(newAnswers);
                                    }}
                                    rows={question.wordCount > 500 ? 15 : 10}
                                />

                                <div className="char-count">
                                    {writingAnswers[index].length}자
                                </div>
                            </div>
                        ))}

                        <Button
                            variant="success"
                            size="lg"
                            fullWidth
                            onClick={handleComplete}
                            icon="✅"
                        >
                            제출하고 결과 보기
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MockTest;
