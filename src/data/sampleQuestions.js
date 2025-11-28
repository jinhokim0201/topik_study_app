// 샘플 TOPIK 문제 데이터
export const sampleQuestions = {
    listening: {
        1: [
            {
                id: "L1_001",
                level: 1,
                type: "listening",
                audioScript: "안녕하세요. 저는 김민수입니다.",
                question: "남자는 누구입니까?",
                options: ["김민수", "이영희", "박철수", "최수진"],
                correctAnswer: 0,
                explanation: "남자가 '저는 김민수입니다'라고 말했으므로 정답은 1번입니다."
            },
            {
                id: "L1_002",
                level: 1,
                type: "listening",
                audioScript: "오늘 날씨가 정말 좋아요. 하늘이 맑고 따뜻합니다.",
                question: "오늘 날씨는 어떻습니까?",
                options: ["춥습니다", "비가 옵니다", "좋습니다", "흐립니다"],
                correctAnswer: 2,
                explanation: "날씨가 '정말 좋다'고 했으므로 정답은 3번입니다."
            }
        ],
        2: [
            {
                id: "L2_001",
                level: 2,
                type: "listening",
                audioScript: "여자: 주말에 뭐 하실 거예요?\n남자: 친구들하고 영화를 보러 갈 거예요.",
                question: "남자는 주말에 무엇을 할 것입니까?",
                options: ["쇼핑을 합니다", "영화를 봅니다", "운동을 합니다", "요리를 합니다"],
                correctAnswer: 1,
                explanation: "남자가 '영화를 보러 갈 거예요'라고 했으므로 정답은 2번입니다."
            }
        ],
        3: [
            {
                id: "L3_001",
                level: 3,
                type: "listening",
                audioScript: "요즘 한국어 공부가 재미있어서 매일 2시간씩 공부하고 있습니다. 특히 듣기 연습을 많이 하는데, 뉴스를 들으면서 모르는 단어를 찾아보고 있습니다.",
                question: "이 사람은 무엇을 하고 있습니까?",
                options: ["한국어를 가르칩니다", "한국어를 공부합니다", "뉴스를 만듭니다", "사전을 만듭니다"],
                correctAnswer: 1,
                explanation: "매일 한국어 공부를 하고 있다고 했으므로 정답은 2번입니다."
            }
        ]
    },
    reading: {
        1: [
            {
                id: "R1_001",
                level: 1,
                type: "reading",
                passage: "저는 학생입니다. 매일 학교에 갑니다.",
                question: "이 사람은 무엇입니까?",
                options: ["선생님", "학생", "의사", "요리사"],
                correctAnswer: 1,
                explanation: "'저는 학생입니다'라고 했으므로 정답은 2번입니다.",
                vocabulary: ["학생: 학교에서 공부하는 사람", "매일: 하루도 빠짐없이"]
            },
            {
                id: "R1_002",
                level: 1,
                type: "reading",
                passage: "오늘은 일요일입니다. 날씨가 좋아서 공원에 갔습니다.",
                question: "오늘은 무슨 요일입니까?",
                options: ["월요일", "금요일", "토요일", "일요일"],
                correctAnswer: 3,
                explanation: "'오늘은 일요일입니다'라고 명시되어 있으므로 정답은 4번입니다.",
                vocabulary: ["일요일: 한 주의 첫째 날", "공원: 사람들이 쉬거나 산책하는 곳"]
            }
        ],
        2: [
            {
                id: "R2_001",
                level: 2,
                type: "reading",
                passage: "저는 커피를 좋아합니다. 그래서 매일 아침 커피숍에 가서 커피를 마십니다. 커피를 마시면 기분이 좋아집니다.",
                question: "이 사람은 언제 커피를 마십니까?",
                options: ["저녁에", "점심에", "아침에", "밤에"],
                correctAnswer: 2,
                explanation: "'매일 아침 커피숍에 가서'라고 했으므로 정답은 3번입니다.",
                vocabulary: ["커피숍: 커피를 파는 가게", "기분: 마음의 상태"]
            }
        ],
        3: [
            {
                id: "R3_001",
                level: 3,
                type: "reading",
                passage: "한국의 전통 음식 중 하나인 김치는 배추를 소금에 절여서 만듭니다. 김치는 비타민이 풍부하고 건강에 좋습니다. 많은 외국인들이 김치의 독특한 맛을 좋아합니다.",
                question: "이 글의 중심 내용은 무엇입니까?",
                options: ["배추의 종류", "김치의 특징", "한국의 역사", "비타민의 효능"],
                correctAnswer: 1,
                explanation: "김치의 만드는 방법과 특징을 설명하고 있으므로 정답은 2번입니다.",
                vocabulary: ["전통: 옛날부터 전해 내려오는 것", "절이다: 소금물에 담가 간을 배게 하다", "풍부하다: 아주 많다"]
            }
        ]
    },
    writing: {
        3: [
            {
                id: "W3_001",
                level: 3,
                type: "writing",
                prompt: "최근에 본 영화나 읽은 책에 대해 소개하고, 그것을 추천하는 이유를 쓰십시오. (200-300자)",
                wordCount: 300,
                guidelines: [
                    "자신이 본 영화나 읽은 책을 선택하세요",
                    "내용을 간단히 소개하세요",
                    "왜 추천하는지 이유를 명확히 쓰세요"
                ],
                sampleAnswer: "저는 최근에 '82년생 김지영'이라는 책을 읽었습니다. 이 책은 한국 사회에서 여성이 겪는 어려움을 보여주는 소설입니다. 주인공 김지영의 삶을 통해 많은 여성들이 공감할 수 있는 이야기를 담고 있습니다. 이 책을 읽으면서 우리 사회의 문제점에 대해 다시 생각하게 되었습니다. 특히 가족과 직장에서의 성차별 문제가 인상적이었습니다. 이 책은 한국 사회를 이해하고 싶은 분들에게 꼭 추천하고 싶습니다.",
                rubric: {
                    grammar: "문법이 정확하고 자연스러운가?",
                    vocabulary: "적절한 어휘를 사용했는가?",
                    content: "주제에 맞게 내용을 작성했는가?",
                    structure: "글의 구조가 논리적인가?"
                }
            }
        ]
    }
};

// 급수별로 여러 문제를 가져오는 함수
export function getSampleQuestions(level, type, count = 10) {
    const questions = sampleQuestions[type]?.[level] || sampleQuestions[type]?.[1] || [];

    // 문제가 부족하면 반복해서 채우기
    const result = [];
    for (let i = 0; i < count; i++) {
        if (questions.length > 0) {
            result.push({
                ...questions[i % questions.length],
                id: `${type[0].toUpperCase()}${level}_${String(i + 1).padStart(3, '0')}`
            });
        }
    }

    return result;
}
