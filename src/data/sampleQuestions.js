// 샘플 TOPIK 문제 데이터 (100문제/급수 확장판)

// 데이터 생성 헬퍼 함수
const getRandomItem = (arr, seed) => arr[seed % arr.length];
const generateId = (type, level, index) => `${type[0].toUpperCase()}${level}_${String(index + 1).padStart(3, '0')}`;

// ==========================================
// 데이터 풀 (Data Pools)
// ==========================================

const commonTopics = {
    beginner: ['가족', '취미', '날씨', '쇼핑', '음식', '교통', '학교', '집', '약속', '주말'],
    intermediate: ['건강', '직장', '여행', '공공장소', '문화', '성격', '고민', '초대', '부탁', '거절'],
    advanced: ['경제', '정치', '사회', '환경', '기술', '역사', '철학', '예술', '심리', '교육']
};

const beginnerSentences = [
    { t: "저는 [N]을/를 좋아합니다.", q: "이 사람은 무엇을 좋아합니까?", a: "[N]" },
    { t: "오늘은 [N]이/가 옵니다.", q: "오늘 날씨는 어떻습니까?", a: "[N]" },
    { t: "지금 [P]에 갑니다.", q: "이 사람은 어디에 갑니까?", a: "[P]" },
    { t: "[T]에 친구를 만납니다.", q: "언제 친구를 만납니까?", a: "[T]" },
    { t: "제 취미는 [V]기입니다.", q: "이 사람의 취미는 무엇입니까?", a: "[V]기" },
    { t: "이것은 [N]입니다.", q: "이것은 무엇입니까?", a: "[N]" },
    { t: "[N]이/가 맛있습니다.", q: "무엇이 맛있습니까?", a: "[N]" },
    { t: "저는 [J]입니다.", q: "이 사람의 직업은 무엇입니까?", a: "[J]" },
    { t: "[P]에서 운동을 합니다.", q: "어디에서 운동을 합니까?", a: "[P]" },
    { t: "내일 [N]을/를 살 것입니다.", q: "내일 무엇을 할 것입니까?", a: "[N] 사기" }
];

const vocab = {
    N: ['사과', '축구', '영화', '음악', '커피', '비', '눈', '바지', '가방', '모자', '책', '연필', '한국어', '드라마', '김치', '불고기', '여름', '겨울', '선물', '편지'],
    P: ['학교', '집', '도서관', '식당', '카페', '공원', '시장', '백화점', '영화관', '병원', '약국', '은행', '우체국', '공항', '기숙사'],
    T: ['주말', '내일', '오늘', '아침', '점심', '저녁', '오후', '밤', '일요일', '휴가'],
    V: ['독서하', '요리하', '수영하', '노래하', '여행하', '등산하', '산책하', '공부하', '청소하', '운전하'],
    J: ['학생', '선생님', '의사', '요리사', '가수', '배우', '회사원', '경찰', '기자', '운전기사']
};

// ==========================================
// 생성 로직
// ==========================================

const createListeningQuestions = (level) => {
    return Array.from({ length: 100 }, (_, i) => {
        let script, question, options, answer, explanation;

        if (level <= 2) { // 초급
            const template = getRandomItem(beginnerSentences, i);
            const n = getRandomItem(vocab.N, i);
            const p = getRandomItem(vocab.P, i);
            const t = getRandomItem(vocab.T, i);
            const v = getRandomItem(vocab.V, i);
            const j = getRandomItem(vocab.J, i);

            script = template.t
                .replace('[N]', n).replace('[P]', p).replace('[T]', t).replace('[V]', v).replace('[J]', j);
            question = template.q;

            const correct = template.a.replace('[N]', n).replace('[P]', p).replace('[T]', t).replace('[V]', v).replace('[J]', j);
            // 오답 생성 (같은 카테고리에서 다른 것 선택)
            const wrongPool = template.a.includes('[N]') ? vocab.N :
                template.a.includes('[P]') ? vocab.P :
                    template.a.includes('[T]') ? vocab.T :
                        template.a.includes('[V]') ? vocab.V.map(x => x + '기') : vocab.J;

            const wrongs = wrongPool.filter(w => w !== correct).slice(i % 5, (i % 5) + 3);
            options = [correct, ...wrongs].sort(() => Math.random() - 0.5);
            answer = options.indexOf(correct);
            explanation = `지문에서 '${correct}'(이)라고 언급했습니다.`;

        } else if (level <= 4) { // 중급
            const topic = getRandomItem(commonTopics.intermediate, i);
            script = `여자: 이번 ${topic}에 대해서 어떻게 생각하세요?\n남자: 저는 긍정적으로 생각해요. 특히 ${topic}은 우리 생활에 큰 도움이 되니까요.\n여자: 그렇군요. 저도 동의해요.`;
            question = "남자의 중심 생각은 무엇입니까?";
            options = [
                `${topic}이/가 도움이 된다`,
                `${topic}을/를 반대한다`,
                `${topic}에 관심이 없다`,
                `${topic}이/가 위험하다`
            ];
            answer = 0;
            explanation = "남자는 긍정적으로 생각하고 도움이 된다고 말했습니다.";
        } else { // 고급
            const topic = getRandomItem(commonTopics.advanced, i);
            script = `최근 ${topic} 분야의 이슈가 뜨겁습니다. 전문가들은 이러한 현상이 일시적인 유행이 아니라 사회 구조적인 변화라고 진단합니다. 따라서 우리는 ${topic}에 대한 단편적인 시각에서 벗어나 보다 근본적인 접근이 필요합니다.`;
            question = "이 담화의 핵심 주제는 무엇입니까?";
            options = [
                `${topic}의 구조적 변화와 접근 필요성`,
                `${topic}의 일시적 유행`,
                `${topic} 전문가의 부족`,
                `${topic}에 대한 대중의 무관심`
            ];
            answer = 0;
            explanation = "단편적 시각에서 벗어나 근본적인 접근이 필요하다고 강조했습니다.";
        }

        return {
            id: generateId('listening', level, i),
            level,
            type: 'listening',
            audioScript: script,
            question,
            options,
            correctAnswer: answer,
            explanation
        };
    });
};

const createReadingQuestions = (level) => {
    return Array.from({ length: 100 }, (_, i) => {
        let passage, question, options, answer, explanation, vocabulary;

        if (level <= 2) { // 초급
            const n = getRandomItem(vocab.N, i);
            const p = getRandomItem(vocab.P, i);
            passage = `저는 ${n}을/를 좋아합니다. 그래서 ${p}에 자주 갑니다. ${p}에서 ${n}을/를 즐기면 기분이 좋습니다.`;
            question = "이 사람은 왜 그곳에 갑니까?";
            options = [
                `${n}을/를 좋아해서`,
                `${p}이/가 가까워서`,
                "친구를 만나려고",
                "운동을 하려고"
            ];
            answer = 0;
            explanation = `${n}을/를 좋아해서 간다고 했습니다.`;
            vocabulary = [`${n}: 좋아하는 것`, `${p}: 장소`];
        } else if (level <= 4) { // 중급
            const topic = getRandomItem(commonTopics.intermediate, i);
            passage = `사람들은 누구나 ${topic}에 대해 고민합니다. 하지만 ${topic}을/를 해결하는 방법은 사람마다 다릅니다. 어떤 사람은 적극적으로 해결하려고 하고, 어떤 사람은 시간이 해결해 줄 것이라고 믿습니다. 중요한 것은 자신에게 맞는 방법을 찾는 것입니다.`;
            question = "이 글의 내용과 같은 것은 무엇입니까?";
            options = [
                `${topic} 해결 방법은 사람마다 다르다`,
                `${topic}은 해결할 수 없다`,
                "모든 사람은 적극적이어야 한다",
                "시간이 모든 것을 해결한다"
            ];
            answer = 0;
            explanation = "해결하는 방법은 사람마다 다르다고 언급되어 있습니다.";
            vocabulary = ["고민: 마음속으로 괴로워함", "적극적: 스스로 나서서 하는"];
        } else { // 고급
            const topic = getRandomItem(commonTopics.advanced, i);
            passage = `${topic}은/는 현대 사회의 중요한 화두입니다. 과거에는 ${topic}이/가 단순히 개인의 문제로 치부되었으나, 이제는 사회 전체가 함께 고민해야 할 과제가 되었습니다. ${topic}의 올바른 방향 설정을 위해 정부와 시민 사회의 협력이 필수적입니다.`;
            question = "필자의 주장으로 가장 알맞은 것은 무엇입니까?";
            options = [
                `${topic} 해결을 위해 사회적 협력이 필요하다`,
                `${topic}은 개인의 문제이다`,
                "정부의 역할만 중요하다",
                "과거의 방식을 따라야 한다"
            ];
            answer = 0;
            explanation = "정부와 시민 사회의 협력이 필수적이라고 주장하고 있습니다.";
            vocabulary = ["화두: 이야기의 주제", "치부되다: 여겨지다", "필수적: 꼭 필요한"];
        }

        return {
            id: generateId('reading', level, i),
            level,
            type: 'reading',
            passage,
            question,
            options,
            correctAnswer: answer,
            explanation,
            vocabulary
        };
    });
};

const createWritingQuestions = (level) => {
    return Array.from({ length: 100 }, (_, i) => {
        let prompt;
        if (level <= 2) {
            const topic = getRandomItem(commonTopics.beginner, i);
            prompt = `당신이 좋아하는 ${topic}에 대해 쓰십시오. (100-200자)`;
        } else if (level <= 4) {
            const topic = getRandomItem(commonTopics.intermediate, i);
            prompt = `${topic}의 장점과 단점에 대해 쓰십시오. (200-400자)`;
        } else {
            const topic = getRandomItem(commonTopics.advanced, i);
            prompt = `현대 사회에서 ${topic}이/가 갖는 의미와 중요성에 대해 논하십시오. (600-700자)`;
        }

        return {
            id: generateId('writing', level, i),
            level,
            type: 'writing',
            prompt,
            wordCount: level <= 2 ? 200 : level <= 4 ? 400 : 700,
            guidelines: [
                "주제에 맞게 쓰십시오",
                "자신의 생각을 명확히 표현하십시오",
                "적절한 어휘와 문법을 사용하십시오"
            ],
            sampleAnswer: "이것은 모범 답안 예시입니다. 실제 시험에서는 자신의 생각대로 작성해야 합니다.",
            rubric: {
                grammar: "문법 정확성",
                vocabulary: "어휘 다양성",
                content: "내용 충실성",
                structure: "글의 구조"
            }
        };
    });
};

// ==========================================
// 데이터 내보내기
// ==========================================

export const sampleQuestions = {
    listening: {
        1: createListeningQuestions(1),
        2: createListeningQuestions(2),
        3: createListeningQuestions(3),
        4: createListeningQuestions(4),
        5: createListeningQuestions(5),
        6: createListeningQuestions(6)
    },
    reading: {
        1: createReadingQuestions(1),
        2: createReadingQuestions(2),
        3: createReadingQuestions(3),
        4: createReadingQuestions(4),
        5: createReadingQuestions(5),
        6: createReadingQuestions(6)
    },
    writing: {
        1: createWritingQuestions(1),
        2: createWritingQuestions(2),
        3: createWritingQuestions(3),
        4: createWritingQuestions(4),
        5: createWritingQuestions(5),
        6: createWritingQuestions(6)
    }
};

// 호환성을 위한 함수
export function getSampleQuestions(level, type, count = 10) {
    const questions = sampleQuestions[type]?.[level] || [];

    // 요청된 개수만큼 반환 (순차적 또는 랜덤)
    // 여기서는 순차적으로 반환하되, 시작점을 랜덤하게 하여 매번 다르게 보이게 함
    if (questions.length === 0) return [];

    const startIndex = Math.floor(Math.random() * (questions.length - count));
    const safeStartIndex = Math.max(0, startIndex);

    return questions.slice(safeStartIndex, safeStartIndex + count);
}
