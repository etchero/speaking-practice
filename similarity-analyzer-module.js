import * as compromise from 'compromise';
import * as natural from 'natural';

// 유사도 계산 함수
export async function calculateSimilarity(originalSentence, userSentence) {
    // 텍스트 정규화
    const normalizedOriginal = normalizeText(originalSentence);
    const normalizedUser = normalizeText(userSentence);

    // 단어 레벨 유사도 계산
    const wordSimilarity = calculateWordSimilarity(normalizedOriginal, normalizedUser);

    // 문법 구조 유사도 계산
    const grammarSimilarity = calculateGrammarSimilarity(normalizedOriginal, normalizedUser);

    // 최종 유사도 계산 (단어 유사도와 문법 유사도 가중 평균)
    const finalSimilarity = (wordSimilarity * 0.7 + grammarSimilarity * 0.3) * 100;

    return Math.min(Math.max(finalSimilarity, 0), 100);
}

// 발음 피드백 제공 함수
export async function detailedPronunciationFeedback(originalSentence, userSentence) {
    const originalWords = originalSentence.toLowerCase().split(/\s+/);
    const userWords = userSentence.toLowerCase().split(/\s+/);

    const feedback = [];

    originalWords.forEach((word, index) => {
        if (index >= userWords.length) return;

        const userWord = userWords[index];
        const wordFeedback = analyzeSingleWordPronunciation(word, userWord);

        if (wordFeedback) {
            feedback.push({
                word: word,
                feedback: wordFeedback.feedback,
                suggestion: wordFeedback.suggestion
            });
        }
    });

    return feedback;
}

// 텍스트 정규화 함수
function normalizeText(text) {
    return text.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// 단어 레벨 유사도 계산
function calculateWordSimilarity(original, user) {
    const tokenizer = new natural.WordTokenizer();
    const originalTokens = tokenizer.tokenize(original);
    const userTokens = tokenizer.tokenize(user);

    const matchedWords = originalTokens.filter(word => 
        userTokens.includes(word)
    ).length;

    return matchedWords / originalTokens.length;
}

// 문법 구조 유사도 계산
function calculateGrammarSimilarity(original, user) {
    const originalDoc = compromise(original);
    const userDoc = compromise(user);

    const originalTags = originalDoc.terms().out('tags');
    const userTags = userDoc.terms().out('tags');

    const matchedTags = originalTags.filter((tag, index) => 
        tag === userTags[index]
    ).length;

    return matchedTags / originalTags.length;
}

// 개별 단어 발음 분석
function analyzeSingleWordPronunciation(originalWord, userWord) {
    // 단어 길이 유사성 체크
    if (Math.abs(originalWord.length - userWord.length) > 2) {
        return {
            feedback: '단어 길이가 크게 다릅니다.',
            suggestion: `원래 단어: ${originalWord}`
        };
    }

    // 발음 유사성 체크 (Levenshtein 거리)
    const distance = natural.LevenshteinDistance(originalWord, userWord);
    const maxLength = Math.max(originalWord.length, userWord.length);
    const similarityRatio = 1 - (distance / maxLength);

    if (similarityRatio < 0.6) {
        return {
            feedback: '단어 발음이 매우 부정확합니다.',
            suggestion: `원래 단어: ${originalWord}`
        };
    }

    if (similarityRatio < 0.8) {
        return {
            feedback: '단어 발음에 약간의 문제가 있습니다.',
            suggestion: `원래 단어를 천천히 발음해보세요: ${originalWord}`
        };
    }

    return null; // 발음이 충분히 정확한 경우
}

// 모듈 테스트용 간단한 함수들
export function testSimilarity(originalSentence, userSentence) {
    return calculateSimilarity(originalSentence, userSentence);
}

export function testPronunciationFeedback(originalSentence, userSentence) {
    return detailedPronunciationFeedback(originalSentence, userSentence);
}
