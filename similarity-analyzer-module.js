// 간단한 유사도 계산 모듈
export function calculateSimilarity(originalSentence, userSentence) {
    // 기본 정규화
    const normalize = (text) => text.toLowerCase().replace(/[^\w\s]/gi, '');
    
    const normalizedOriginal = normalize(originalSentence);
    const normalizedUser = normalize(userSentence);
    
    // 단어 수준 유사도
    const originalWords = normalizedOriginal.split(/\s+/);
    const userWords = normalizedUser.split(/\s+/);
    
    const matchedWords = originalWords.filter(word => 
        userWords.includes(word)
    ).length;
    
    const similarity = (matchedWords / originalWords.length) * 100;
    return Math.min(Math.max(similarity, 0), 100);
}

export function getPronunciationFeedback(originalSentence, userSentence) {
    const originalWords = originalSentence.toLowerCase().split(/\s+/);
    const userWords = userSentence.toLowerCase().split(/\s+/);

    const feedback = [];

    originalWords.forEach((word, index) => {
        if (index >= userWords.length) return;

        const userWord = userWords[index];
        
        // 단순 단어 비교
        if (word !== userWord) {
            feedback.push({
                word: word,
                feedback: '발음이 정확하지 않습니다.',
                suggestion: `원래 단어: ${word}`
            });
        }
    });

    return feedback;
}
