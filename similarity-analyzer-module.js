// 문장 유사도 분석 모듈
export async function calculateSimilarity(originalText, recognizedText) {
    // 텍스트 전처리
    const cleanText = (text) => {
        return text.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    };

    const original = cleanText(originalText).split(' ');
    const recognized = cleanText(recognizedText).split(' ');

    // Levenshtein 거리 알고리즘을 기반으로 한 유사도 계산
    const levenshteinDistance = (str1, str2) => {
        const matrix = [];

        // 행렬 초기화
        for (let i = 0; i <= str1.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str2.length; j++) {
            matrix[0][j] = j;
        }

        // 레벤슈타인 거리 계산
        for (let i = 1; i <= str1.length; i++) {
            for (let j = 1; j <= str2.length; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // 대체
                        matrix[i][j - 1] + 1,     // 삽입
                        matrix[i - 1][j] + 1      // 삭제
                    );
                }
            }
        }

        return matrix[str1.length][str2.length];
    };

    // 단어 일치율 계산
    const matchedWords = original.filter(word => recognized.includes(word));
    const wordSimilarity = (matchedWords.length / original.length) * 100;

    // 레벤슈타인 거리 기반 유사도
    const maxLength = Math.max(original.length, recognized.length);
    const editDistance = levenshteinDistance(original.join(' '), recognized.join(' '));
    const editSimilarity = ((maxLength - editDistance) / maxLength) * 100;

    // 두 유사도 평균
    const similarity = (wordSimilarity + editSimilarity) / 2;

    // 0~100 사이로 제한
    return Math.min(Math.max(similarity, 0), 100);
}
