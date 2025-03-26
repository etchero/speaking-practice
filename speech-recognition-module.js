// 음성 인식 모듈 (Google Speech-to-Text API 예시)
export async function recognizeSpeech(audioSrc) {
    const apiKey = 'YOUR_GOOGLE_SPEECH_TO_TEXT_API_KEY';
    
    // 오디오 파일을 base64로 인코딩
    const audioBlob = await fetch(audioSrc).then(r => r.blob());
    const audioBase64 = await blobToBase64(audioBlob);

    try {
        const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                config: {
                    encoding: 'LINEAR16',
                    sampleRateHertz: 44100,
                    languageCode: 'en-US',
                    enableAutomaticPunctuation: true
                },
                audio: {
                    content: audioBase64
                }
            })
        });

        const data = await response.json();
        
        // 인식된 텍스트 반환 (첫 번째 결과)
        return data.results[0].alternatives[0].transcript;
    } catch (error) {
        console.error('음성 인식 중 오류:', error);
        throw error;
    }
}

// base64 변환 헬퍼 함수
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            // base64 접두사 제거
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
