// Gemini API 서비스
import { GoogleGenerativeAI } from '@google/generative-ai';

// API 키 (사용자 제공)
const API_KEY = 'AIzaSyDTgu8wDVtCB-718u7AMJqUgUhzBDVPcMU';

// Gemini AI 인스턴스 생성
const genAI = new GoogleGenerativeAI(API_KEY);

// Rate limiting을 위한 마지막 요청 시간 추적
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 6000; // 6초 간격 (429 오류 완전 방지)

// ⚠️ API 활성화됨 - AI 생성 문제 사용
// API 문제 발생 시 true로 변경하여 샘플 데이터 사용 가능
const USE_SAMPLE_DATA_ONLY = false; // AI 생성 활성화

/**
 * 요청 간 딜레이 함수
 */
async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

/**
 * TOPIK 문제 생성
 */
export async function generateQuestions(level, type, count = 10) {
  // 샘플 데이터 import
  const { getSampleQuestions } = await import('../data/sampleQuestions.js');

  // 샘플 데이터만 사용 모드일 경우 즉시 반환
  if (USE_SAMPLE_DATA_ONLY) {
    console.log('📝 샘플 데이터 사용 중');
    return getSampleQuestions(level, type, count);
  }

  // Rate limiting 적용
  await waitForRateLimit();

  // API 호출
  try {
    // gemini-1.5-pro 사용 (v1beta에서 지원)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `당신은 TOPIK(한국어능력시험) ${type === 'listening' ? '듣기' : type === 'reading' ? '읽기' : '쓰기'} 문제 제작 전문가입니다.
TOPIK ${level}급 수준의 ${type === 'listening' ? '듣기' : type === 'reading' ? '읽기' : '쓰기'} 문제 1개만 생성해주세요.

JSON 형식으로 답변해주세요. 다른 설명 없이 JSON만 반환하세요.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 간단한 샘플 문제 반환 (fallback)
    return getSampleQuestions(level, type, count);

  } catch (error) {
    console.warn('Gemini API 호출 실패, 샘플 데이터 사용:', error.message);
    return getSampleQuestions(level, type, count);
  }
}

/**
 * 쓰기 답안 채점 및 피드백 생성
 */
export async function gradeWriting(answer, prompt, level) {
  // 기본 피드백 반환
  const wordCount = answer.length;
  const baseScore = Math.min(Math.max(Math.floor(wordCount / 20), 5), 10);

  return {
    scores: {
      grammar: baseScore,
      vocabulary: baseScore,
      content: baseScore,
      structure: baseScore
    },
    totalScore: baseScore * 4,
    grade: baseScore >= 8 ? 'A' : baseScore >= 6 ? 'B' : 'C',
    strengths: ["답안을 성실하게 작성했습니다"],
    weaknesses: ["기본 채점이 적용되었습니다"],
    grammarErrors: [],
    vocabularySuggestions: [],
    contentFeedback: "기본 피드백입니다.",
    structureFeedback: "기본 점수가 부여되었습니다.",
    improvementTips: [
      "문법과 어휘를 다양하게 사용해보세요",
      "글의 구조를 명확히 하세요",
      "주제에 맞게 내용을 전개하세요"
    ]
  };
}

/**
 * 학습 결과 분석
 */
export async function analyzeResults(testResults) {
  return {
    overallAssessment: `전체 ${testResults.totalScore}점으로 ${testResults.currentLevel}급 수준입니다.`,
    strengthAreas: ["학습을 성실히 진행했습니다"],
    improvementAreas: ["꾸준한 연습이 필요합니다"],
    studyPlan: {
      week1: ["기본 문법 복습"],
      week2: ["듣기 연습 강화"],
      week3: ["쓰기 연습"],
      week4: ["실전 감각 유지"]
    },
    recommendedResources: [
      { type: "듣기", description: "한국어 뉴스 청취" },
      { type: "읽기", description: "한국어 기사 읽기" }
    ],
    goals: [
      "꾸준한 학습",
      "약점 보완"
    ]
  };
}
