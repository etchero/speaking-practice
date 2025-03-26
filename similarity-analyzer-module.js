// Simplified similarity analyzer without external dependencies
export async function calculateSimilarity(originalSentence, userSentence) {
    // Basic normalization
    const normalize = (text) => text.toLowerCase().replace(/[^\w\s]/gi, '');
    
    const normalizedOriginal = normalize(originalSentence);
    const normalizedUser = normalize(userSentence);
    
    // Simple word-level similarity
    const originalWords = normalizedOriginal.split(/\s+/);
    const userWords = normalizedUser.split(/\s+/);
    
    const matchedWords = originalWords.filter(word => 
        userWords.includes(word)
    ).length;
    
    const similarity = (matchedWords / originalWords.length) * 100;
    return Math.min(Math.max(similarity, 0), 100);
}

export async function detailedPronunciationFeedback(originalSentence, userSentence) {
    const originalWords = originalSentence.toLowerCase().split(/\s+/);
    const userWords = userSentence.toLowerCase().split(/\s+/);

    const feedback = [];

    originalWords.forEach((word, index) => {
        if (index >= userWords.length) return;

        const userWord = userWords[index];
        
        // Simple word comparison
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

// Simple test functions for manual testing
export function testSimilarity(originalSentence, userSentence) {
    return calculateSimilarity(originalSentence, userSentence);
}

export function testPronunciationFeedback(originalSentence, userSentence) {
    return detailedPronunciationFeedback(originalSentence, userSentence);
}
