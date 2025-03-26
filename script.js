// Mock modules to replace missing dependencies
const speak = async (text) => {
    console.log('Speaking:', text);
};

const recognizeSpeech = async (audioSrc) => {
    console.log('Recognizing speech from:', audioSrc);
    return 'Recognized speech text';
};

class SpeakingPractice {
    constructor() {
        this.sentences = [
            { 
                english: 'Hello, how are you today?', 
                korean: '오늘 어떻게 지내세요?' 
            },
            { 
                english: 'I am learning English speaking.', 
                korean: '저는 영어 말하기를 배우고 있습니다.' 
            }
        ];
        this.currentSentenceIndex = 0;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.userStats = {
            totalPractices: 0,
            averageSimilarity: 0,
            sentenceStats: {}
        };

        this.initializeElements();
        this.setupEventListeners();
        this.setupAudioVisualization();
        this.loadCurrentSentence();
    }

    initializeElements() {
        this.fileUpload = document.getElementById('file-upload');
        this.manualInput = document.getElementById('manual-input');
        this.englishSentence = document.getElementById('current-english-sentence');
        this.koreanMeaning = document.getElementById('current-korean-meaning');
        this.nativeAudio = document.getElementById('native-audio');
        this.userAudio = document.getElementById('user-audio');
        this.startRecordingBtn = document.getElementById('start-recording');
        this.stopRecordingBtn = document.getElementById('stop-recording');
        this.compareAudioBtn = document.getElementById('compare-audio');
        this.nextSentenceBtn = document.getElementById('next-sentence');
        this.similarityPercentage = document.getElementById('similarity-percentage');
        
        this.pronunciationFeedbackElement = document.createElement('div');
        this.pronunciationFeedbackElement.id = 'pronunciation-feedback';
        this.pronunciationFeedbackElement.classList.add('pronunciation-feedback');
        document.querySelector('.practice-section').appendChild(this.pronunciationFeedbackElement);
    }

    setupEventListeners() {
        this.fileUpload.addEventListener('change', this.handleFileUpload.bind(this));
        this.manualInput.addEventListener('input', this.handleManualInput.bind(this));
        this.startRecordingBtn.addEventListener('click', this.startRecording.bind(this));
        this.stopRecordingBtn.addEventListener('click', this.stopRecording.bind(this));
        this.compareAudioBtn.addEventListener('click', this.compareAudio.bind(this));
        this.nextSentenceBtn.addEventListener('click', this.loadNextSentence.bind(this));
    }

    setupAudioVisualization() {
        // Mock WaveSurfer initialization if WaveSurfer is not available
        if (typeof WaveSurfer !== 'undefined') {
            this.nativeWaveSurfer = WaveSurfer.create({
                container: '#native-waveform',
                waveColor: 'blue',
                progressColor: 'purple'
            });

            this.userWaveSurfer = WaveSurfer.create({
                container: '#user-waveform',
                waveColor: 'green',
                progressColor: 'orange'
            });
        }
    }

    loadCurrentSentence() {
        const currentSentence = this.sentences[this.currentSentenceIndex];
        this.englishSentence.textContent = currentSentence.english;
        this.koreanMeaning.textContent = currentSentence.korean;
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                this.parseUploadedContent(content);
            };
            reader.readAsText(file);
        }
    }

    parseUploadedContent(content) {
        try {
            const lines = content.split('\n');
            const newSentences = lines.map(line => {
                const [english, korean] = line.split('|').map(s => s.trim());
                return { english, korean };
            }).filter(s => s.english && s.korean);

            if (newSentences.length > 0) {
                this.sentences = newSentences;
                this.currentSentenceIndex = 0;
                this.loadCurrentSentence();
            }
        } catch (error) {
            console.error('파일 파싱 오류:', error);
            alert('파일 형식이 올바르지 않습니다.');
        }
    }

    handleManualInput() {
        const input = this.manualInput.value;
        const [english, korean] = input.split('|').map(s => s.trim());
        
        if (english && korean) {
            this.sentences = [{ english, korean }];
            this.currentSentenceIndex = 0;
            this.loadCurrentSentence();
        }
    }

    startRecording() {
        // Basic audio recording implementation
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    this.mediaRecorder = new MediaRecorder(stream);
                    this.audioChunks = [];

                    this.mediaRecorder.addEventListener('dataavailable', event => {
                        this.audioChunks.push(event.data);
                    });

                    this.mediaRecorder.addEventListener('stop', () => {
                        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        this.userAudio.src = audioUrl;
                    });

                    this.mediaRecorder.start();
                    this.startRecordingBtn.disabled = true;
                    this.stopRecordingBtn.disabled = false;
                })
                .catch(error => {
                    console.error('녹음 권한 오류:', error);
                    alert('마이크 접근 권한을 확인해주세요.');
                });
        } else {
            alert('이 브라우저는 녹음을 지원하지 않습니다.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.startRecordingBtn.disabled = false;
            this.stopRecordingBtn.disabled = true;
        }
    }

    async compareAudio() {
        try {
            const userText = await recognizeSpeech(this.userAudio.src);
            const currentSentence = this.sentences[this.currentSentenceIndex];
            
            const { calculateSimilarity, detailedPronunciationFeedback } = await import('./similarity-analyzer-module.js');
            
            const similarity = await calculateSimilarity(
                currentSentence.english, 
                userText
            );

            const pronunciationFeedback = await detailedPronunciationFeedback(
                currentSentence.english, 
                userText
            );

            this.displaySimilarityResult(similarity);
            this.displayPronunciationFeedback(pronunciationFeedback);
        } catch (error) {
            console.error('음성 비교 오류:', error);
            alert('음성 비교 중 오류가 발생했습니다.');
        }
    }

    displaySimilarityResult(similarity) {
        this.similarityPercentage.textContent = `${similarity.toFixed(2)}%`;
        this.similarityPercentage.className = this.getSimilarityColorClass(similarity);
    }

    getSimilarityColorClass(similarity) {
        if (similarity <= 50) return 'similarity-percentage-0-50';
        if (similarity <= 60) return 'similarity-percentage-51-60';
        if (similarity <= 70) return 'similarity-percentage-61-70';
        if (similarity <= 80) return 'similarity-percentage-71-80';
        if (similarity <= 90) return 'similarity-percentage-81-90';
        return 'similarity-percentage-91-100';
    }

    displayPronunciationFeedback(feedback) {
        this.pronunciationFeedbackElement.innerHTML = `
            <h4>발음 피드백</h4>
            <ul>
                ${feedback.map(item => `
                    <li>
                        <strong>${item.word}</strong>: 
                        ${item.feedback}
                        ${item.suggestion ? `<br>제안: ${item.suggestion}` : ''}
                    </li>
                `).join('')}
            </ul>
        `;
    }

    loadNextSentence() {
        this.currentSentenceIndex = (this.currentSentenceIndex + 1) % this.sentences.length;
        this.loadCurrentSentence();
        
        // 피드백 초기화
        this.similarityPercentage.textContent = '';
        this.pronunciationFeedbackElement.innerHTML = '';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SpeakingPractice();
});

export default SpeakingPractice;
