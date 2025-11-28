// Gemini API 서비스
import { GoogleGenerativeAI } from '@google/generative-ai';

// API 키 (사용자 제공)
const API_KEY = 'AIzaSyC6-YRLbrw_jmY4VVy1LpBloZA1B5x1p6U';

// Gemini AI 인스턴스 생성
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * TO PIK 문제 생성
 * @param {string} level - 급수 (1-6)
 * @param {string} type - 문제 유형 ('listening', 'reading', 'writing')
 * @param {number} count - 생성할 문제 수
 * @returns {Promise<Array>} 생성된 문제 배열
 */
export async function generateQuestions(level, type, count = 10) {
  // 샘플 데이터 import (동적)
  const { getSampleQuestions } = await import('../data/sampleQuestions.js');

  // API 쿼터 문제나 네트워크 오류 시 샘플 데이터 사용
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompts = {
      listening: `당신은 TOPIK(한국어능력시험) 듣기 문제 제작 전문가입니다.
TOPIK ${level}급 수준의 듣기 문제 ${count}개를 생성해주세요.

각 문제는 다음 JSON 형식으로 작성해주세요:
{
  "id": "L${level}_001",
  "level": ${level},
  "type": "listening",
  "audioScript": "듣기 지문 내용 (실제 읽을 텍스트)",
  "question": "질문 내용",
  "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
  "correctAnswer": 0,
  "explanation": "정답 해설"
}

${level <= 2 ? '초급 수준: 일상 생활, 간단한 대화, 기본 어휘' : ''}
${level >= 3 && level <= 4 ? '중급 수준: 사회 생활, 뉴스, 전문적인 대화' : ''}
${level >= 5 ? '고급 수준: 학술적 내용, 복잡한 담화, 추상적 개념' : ''}

응답은 반드시 유효한 JSON 배열 형식으로만 제공해주세요. 다른 설명이나 텍스트는 포함하지 마세요.`,

      reading: `당신은 TOPIK(한국어능력시험) 읽기 문제 제작 전문가입니다.
TOPIK ${level}급 수준의 읽기 문제 ${count}개를 생성해주세요.

각 문제는 다음 JSON 형식으로 작성해주세요:
{
  "id": "R${level}_001",
  "level": ${level},
  "type": "reading",
  "passage": "읽기 지문 내용",
  "question": "질문 내용",
  "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
  "correctAnswer": 0,
  "explanation": "정답 해설",
  "vocabulary": ["핵심어휘1: 뜻", "핵심어휘2: 뜻"]
}

문제 유형:
- 빈칸 채우기
- 주제/요지 파악
- 세부 내용 이해
- 문단 순서 배열

${level <= 2 ? '초급 수준: 짧은 문장, 기본 어휘, 일상적인 주제' : ''}
${level >= 3 && level <= 4 ? '중급 수준: 중간 길이 단락, 사회/문화 주제' : ''}
${level >= 5 ? '고급 수준: 긴 지문, 학술/전문 주제, 복잡한 구조' : ''}

응답은 반드시 유효한 JSON 배열 형식으로만 제공해주세요. 다른 설명이나 텍스트는 포함하지 마세요.`,

      writing: `당신은 TOPIK(한국어능력시험) 쓰기 문제 제작 전문가입니다.
TOPIK ${level}급 수준의 쓰기 문제 ${count}개를 생성해주세요.

각 문제는 다음 JSON 형식으로 작성해주세요:
{
  "id": "W${level}_001",
  "level": ${level},
  "type": "writing",
  "prompt": "쓰기 주제/상황",
  "wordCount": 300,
  "guidelines": ["작성 가이드라인1", "작성 가이드라인2"],
  "sampleAnswer": "모범 답안",
  "rubric": {
    "grammar": "문법 평가 기준",
    "vocabulary": "어휘 평가 기준",
    "content": "내용 평가 기준",
    "structure": "구조 평가 기준"
  }
}

${level <= 2 ? '초급 수준: 짧은 문장 작성, 일상적인 주제' : ''}
${level >= 3 && level <= 4 ? '중급 수준: 200-300자, 설명문/의견 작성' : ''}
${level >= 5 ? '고급 수준: 600-700자, 논설문/비평문' : ''}

응답은 반드시 유효한 JSON 배열 형식으로만 제공해주세요. 다른 설명이나 텍스트는 포함하지 마세요.`
    };

    const result = await model.generateContent(prompts[type]);
    const response = await result.response;
    const text = response.text();

    // JSON 추출 (코드 블록 제거)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // 전체 텍스트가 JSON인 경우
    return JSON.parse(text);
  } catch (error) {
    console.warn('Gemini API 호출 실패, 샘플 데이터 사용:', error.message);

    // API 실패 시 샘플 데이터 반환
    return getSampleQuestions(level, type, count);
  }
}

/**
 * 쓰기 답안 채점 및 피드백 생성
 * @param {string} answer - 사용자 답안
 * @param {string} prompt - 문제 주제
 * @param {number} level - 급수
 * @returns {Promise<Object>} 채점 결과 및 피드백
 */
export async function gradeWriting(answer, prompt, level) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const gradingPrompt = `당신은 TOPIK(한국어능력시험) 쓰기 전문 채점관입니다.
다음 학생의 답안을 ${level}급 기준으로 채점하고 상세한 피드백을 제공해주세요.

**문제 주제:** ${prompt}

**학생 답안:**
${answer}

다음 JSON 형식으로 평가해주세요:
{
  "scores": {
    "grammar": 0-10,
    "vocabulary": 0-10,
    "content": 0-10,
    "structure": 0-10
  },
  "totalScore": 0-40,
  "grade": "A/B/C/D/F",
  "strengths": ["장점1", "장점2"],
  "weaknesses": ["약점1", "약점2"],
  "grammarErrors": [
    {"original": "틀린 표현", "corrected": "올바른 표현", "explanation": "설명"}
  ],
  "vocabularySuggestions": [
    {"word": "사용한 단어", "alternatives": ["대체 단어1", "대체 단어2"], "explanation": "설명"}
  ],
  "contentFeedback": "내용 완성도 및 주제 적합성 평가",
  "structureFeedback": "구조 및 논리적 전개 평가",
  "improvementTips": ["개선 포인트1", "개선 포인트2", "개선 포인트3"]
}

응답은 반드시 유효한 JSON 형식으로만 제공해주세요.`;

    const result = await model.generateContent(gradingPrompt);
    const response = await result.response;
    const text = response.text();

    // JSON 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return JSON.parse(text);
  } catch (error) {
    console.warn('AI 채점 실패, 기본 피드백 사용:', error.message);

    // API 실패 시 기본 피드백 반환
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
      weaknesses: ["AI 채점 서비스를 일시적으로 사용할 수 없습니다"],
      grammarErrors: [],
      vocabularySuggestions: [],
      contentFeedback: "현재 상세한 피드백을 제공할 수 없습니다. API 쿼터를 확인해주세요.",
      structureFeedback: "기본 점수가 부여되었습니다.",
      improvementTips: [
        "문법과 어휘를 다양하게 사용해보세요",
        "글의 구조를 명확히 하세요",
        "주제에 맞게 내용을 전개하세요"
      ]
    };
  }
}

/**
 * 학습 결과 분석 및 개선 제안 생성
 * @param {Object} testResults - 시험 결과 데이터
 * @returns {Promise<Object>} 분석 결과 및 개선 제안
 */
export async function analyzeResults(testResults) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const analysisPrompt = `당신은 TOPIK 학습 컨설턴트입니다.
다음 학생의 시험 결과를 분석하고 맞춤형 학습 계획을 제안해주세요.

**시험 결과:**
- 듣기: ${testResults.listening.score}/${testResults.listening.total} (정답률: ${testResults.listening.accuracy}%)
- 읽기: ${testResults.reading.score}/${testResults.reading.total} (정답률: ${testResults.reading.accuracy}%)
- 쓰기: ${testResults.writing.score}/${testResults.writing.total}
- 총점: ${testResults.totalScore}
- 현재 급수: ${testResults.currentLevel}급
- 목표 급수: ${testResults.targetLevel}급

**취약 영역:**
${testResults.weakAreas.join(', ')}

다음 JSON 형식으로 분석 결과를 제공해주세요:
{
  "overallAssessment": "종합 평가",
  "strengthAreas": ["강점 영역1", "강점 영역2"],
  "improvementAreas": ["개선 영역1", "개선 영역2"],
  "studyPlan": {
    "week1": ["1주차 학습 계획"],
    "week2": ["2주차 학습 계획"],
    "week3": ["3주차 학습 계획"],
    "week4": ["4주차 학습 계획"]
  },
  "recommendedResources": [
    {"type": "듣기", "description": "추천 자료"},
    {"type": "읽기", "description": "추천 자료"}
  ],
  "goals": ["단기 목표1", "단기 목표2", "장기 목표"]
}

응답은 반드시 유효한 JSON 형식으로만 제공해주세요.`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return JSON.parse(text);
  } catch (error) {
    console.warn('AI 분석 실패, 기본 분석 사용:', error.message);

    // API 실패 시 기본 분석 반환
    return {
      overallAssessment: `전체 ${testResults.totalScore}점으로 ${testResults.currentLevel}급 수준입니다. 꾸준한 학습으로 실력을 향상시킬 수 있습니다.`,
      strengthAreas: testResults.listening.accuracy >= testResults.reading.accuracy
        ? ["듣기 영역에서 좋은 성적을 보였습니다"]
        : ["읽기 영역에서 좋은 성적을 보였습니다"],
      improvementAreas: testResults.weakAreas.length > 0
        ? testResults.weakAreas.map(area => `${area} 영역 보완이 필요합니다`)
        : ["전반적인 실력 향상이 필요합니다"],
      studyPlan: {
        week1: ["기본 문법 복습", "필수 어휘 암기"],
        week2: ["듣기 연습 강화", "읽기 속도 향상"],
        week3: ["쓰기 연습", "모의고사 풀이"],
        week4: ["약점 영역 집중 학습", "실전 감각 유지"]
      },
      recommendedResources: [
        { type: "듣기", description: "한국어 뉴스, 드라마 청취" },
        { type: "읽기", description: "한국어 기사, 소설 읽기" }
      ],
      goals: [
        `다음 모의고사에서 ${testResults.targetLevel}급 목표 달성`,
        "매일 30분 이상 학습",
        "약점 영역 보완"
      ]
    };
  }
}
