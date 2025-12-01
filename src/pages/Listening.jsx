import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestions } from '../services/geminiService';
import Button from '../components/common/Button';
import './Listening.css';

function Listening() {
    const navigate = useNavigate();
    const [userLevel, setUserLevel] = useState(3);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showScript, setShowScript] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1.0);

    useEffect(() => {
        const savedLevel = localStorage.getItem('userLevel');
        if (savedLevel) {
            setUserLevel(parseInt(savedLevel));
        }
        loadQuestions(savedLevel ? parseInt(savedLevel) : 3);
    }, []);

    const loadQuestions = async (level) => {
        setLoading(true);
        try {
            // 첫 문제만 로드
            const newQuestions = await generateQuestions(level, 'listening', 1);
            setQuestions(newQuestions);
        } catch (error) {
            console.error('문제 로딩 오류:', error);
            alert('문제를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const loadNextQuestion = async (level) => {
        try {
            const newQuestion = await generateQuestions(level, 'listening', 1);
            setQuestions(prev => [...prev, ...newQuestion]);
        } catch (error) {
            console.error('다음 문제 로딩 오류:', error);
            // 오류 발생 시 샘플 데이터가 자동으로 사용됨 (geminiService의 fallback)
        }
    };

    const handleAnswer = (answerIndex) => {
        setSelectedAnswer(answerIndex);
        setShowAnswer(true);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            // 다음 문제로 이동
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            setShowAnswer(false);
            setShowScript(false);
        } else {
            // 마지막 문제인 경우
            if (currentIndex < 9) {
                // 아직 10문제 미만이면 다음 문제 생성
                setCurrentIndex(currentIndex + 1);
                setSelectedAnswer(null);
                setShowAnswer(false);
                setShowScript(false);
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
            <div className="listening">
                <div className="container">
                    <div className="loading-card card">
                        <div className="loading-spinner"></div>
                        <h3>듣기 문제를 준비하고 있습니다...</h3>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return null;
    }

    return (
        <div className="listening">
            <div className="container">
                {/* 헤더 */}
                <div className="listening-header">
                    <div className="header-top flex-between">
                        <h1>🎧 듣기 학습</h1>
                        <div className="level-selector">
                            <span>급수:</span>
                            <select
                                value={userLevel}
                                onChange={(e) => {
                                    const newLevel = parseInt(e.target.value);
                                    setUserLevel(newLevel);
                                    setCurrentIndex(0);
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
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 오디오 플레이어 */}
                <div className="audio-player card">
                    <div className="audio-icon">🎵</div>
                    <p className="audio-instruction">
                        아래 텍스트를 읽고 듣는 것처럼 문제를 풀어주세요
                    </p>

                    <div className="playback-controls">
                        <button
                            className={`speed-btn ${playbackRate === 0.75 ? 'active' : ''}`}
                            onClick={() => setPlaybackRate(0.75)}
                        >
                            0.75x
                        </button>
                        <button
                            className={`speed-btn ${playbackRate === 1.0 ? 'active' : ''}`}
                            onClick={() => setPlaybackRate(1.0)}
                        >
                            1.0x
                        </button>
                        <button
                            className={`speed-btn ${playbackRate === 1.25 ? 'active' : ''}`}
                            onClick={() => setPlaybackRate(1.25)}
                        >
                            1.25x
                        </button>
                    </div>

                    {showScript && (
                        <div className="audio-script-display">
                            <h4>🎤 음성 스크립트</h4>
                            <p>{currentQuestion.audioScript}</p>
                        </div>
                    )}

                    <button
                        className="script-toggle btn-outline"
                        onClick={() => setShowScript(!showScript)}
                    >
                        {showScript ? '스크립트 숨기기' : '스크립트 보기'}
                    </button>
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

export default Listening;
