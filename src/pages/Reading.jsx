import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestions } from '../services/geminiService';
import Button from '../components/common/Button';
import './Reading.css';

function Reading() {
    const navigate = useNavigate();
    const [userLevel, setUserLevel] = useState(3);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        const savedLevel = localStorage.getItem('userLevel');
        if (savedLevel) {
            setUserLevel(parseInt(savedLevel));
        }
        loadQuestions(savedLevel ? parseInt(savedLevel) : 3);
    }, []);

    useEffect(() => {
        let interval;
        if (timerActive && !showAnswer) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, showAnswer]);

    const loadQuestions = async (level) => {
        setLoading(true);
        try {
            // 첫 문제만 로드
            const newQuestions = await generateQuestions(level, 'reading', 1);
            setQuestions(newQuestions);
            setTimerActive(true);
        } catch (error) {
            console.error('문제 로딩 오류:', error);
            alert('문제를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const loadNextQuestion = async (level) => {
        try {
            const newQuestion = await generateQuestions(level, 'reading', 1);
            setQuestions(prev => [...prev, ...newQuestion]);
        } catch (error) {
            console.error('다음 문제 로딩 오류:', error);
            // 오류 발생 시 샘플 데이터가 자동으로 사용됨 (geminiService의 fallback)
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (answerIndex) => {
        setSelectedAnswer(answerIndex);
        setShowAnswer(true);
        setTimerActive(false);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            // 다음 문제로 이동
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            setShowAnswer(false);
            setTimeElapsed(0);
            setTimerActive(true);
        } else {
            // 마지막 문제인 경우
            if (currentIndex < 9) {
                // 아직 10문제 미만이면 다음 문제 생성
                setCurrentIndex(currentIndex + 1);
                setSelectedAnswer(null);
                setShowAnswer(false);
                setTimeElapsed(0);
                setTimerActive(true);
                setLoading(true);

                // 다음 문제 로드
                loadNextQuestion(userLevel).finally(() => setLoading(false));
            } else {
                // 10문제 완료
                alert('모든 문제를 완료했습니다!');
                navigate('/');
            }
        }

        // 백그라운드에서 다음 문제 미리 로드 (현재 인덱스 + 2번째 문제)
        if (currentIndex + 2 < 10 && questions.length === currentIndex + 2) {
            loadNextQuestion(userLevel);
        }
    };

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

    if (loading) {
        return (
            <div className="reading">
                <div className="container">
                    <div className="loading-card card">
                        <div className="loading-spinner"></div>
                        <h3>읽기 문제를 준비하고 있습니다...</h3>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return null;
    }

    return (
        <div className="reading">
            <div className="container">
                {/* 헤더 */}
                <div className="reading-header">
                    <div className="header-top flex-between">
                        <h1>📖 읽기 학습</h1>
                        <div className="level-selector">
                            <span>급수:</span>
                            <select
                                value={userLevel}
                                onChange={(e) => {
                                    const newLevel = parseInt(e.target.value);
                                    setUserLevel(newLevel);
                                    setCurrentIndex(0);
                                    setTimeElapsed(0);
                                    loadQuestions(newLevel);
                                }}
                            >
                                {[1, 2, 3, 4, 5, 6].map(level => (
                                    <option key={level} value={level}>{level}급</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="progress-info">
                        <span>{currentIndex + 1} / {questions.length}</span>
                        <div className="timer">⏱️ {formatTime(timeElapsed)}</div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 읽기 지문 */}
                <div className="passage-section card">
                    <h3 className="passage-title">📄 지문</h3>
                    <div className="passage-content">
                        <p>{currentQuestion.passage}</p>
                    </div>

                    {currentQuestion.vocabulary && currentQuestion.vocabulary.length > 0 && (
                        <div className="vocabulary-section">
                            <h4>📚 핵심 어휘</h4>
                            <div className="vocabulary-list">
                                {currentQuestion.vocabulary.map((vocab, index) => (
                                    <span key={index} className="vocab-item">{vocab}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 문제 */}
                <div className="question-section card">
                    <h3 className="question-text">{currentQuestion.question}</h3>

                    <div className="options">
                        {currentQuestion.options.map((option, index) => {
                            let optionClass = 'option-button';
                            if (showAnswer) {
                                if (index === currentQuestion.correctAnswer) {
                                    optionClass += ' correct';
                                } else if (index === selectedAnswer) {
                                    optionClass += ' incorrect';
                                }
                            } else if (index === selectedAnswer) {
                                optionClass += ' selected';
                            }

                            return (
                                <button
                                    key={index}
                                    className={optionClass}
                                    onClick={() => !showAnswer && handleAnswer(index)}
                                    disabled={showAnswer}
                                >
                                    <span className="option-number">{index + 1}</span>
                                    <span className="option-text">{option}</span>
                                    {showAnswer && index === currentQuestion.correctAnswer && (
                                        <span className="check-icon">✓</span>
                                    )}
                                    {showAnswer && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                                        <span className="cross-icon">✗</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {showAnswer && (
                        <div className={`answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                            <div className="feedback-icon">
                                {isCorrect ? '🎉' : '📝'}
                            </div>
                            <h4>{isCorrect ? '정답입니다!' : '아쉬워요!'}</h4>
                            <p className="explanation">{currentQuestion.explanation}</p>
                            <p className="time-info">소요 시간: {formatTime(timeElapsed)}</p>
                        </div>
                    )}

                    <div className="question-actions">
                        {!showAnswer ? (
                            <Button variant="outline" fullWidth onClick={() => navigate('/')}>
                                돌아가기
                            </Button>
                        ) : (
                            <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
                                {currentIndex < questions.length - 1 ? '다음 문제' : '완료'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reading;
