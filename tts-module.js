// TTS 모듈 (Azure TTS API 예시)
export async function speak(text, language = 'en-US') {
    const apiKey = 'YOUR_AZURE_TTS_API_KEY';
    const region = 'YOUR_AZURE_REGION';
    const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const xmlBody = `
    <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${language}'>
        <voice name='en-US-JennyNeural'>
            ${text}
        </voice>
    </speak>`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm'
            },
            body: xmlBody
        });

        if (!response.ok) {
            throw new Error('TTS API 호출 실패');
        }

        // Blob으로 음성 데이터 반환
        return await response.blob();
    } catch (error) {
        console.error('음성 생성 중 오류:', error);
        throw error;
    }
}
