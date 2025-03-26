import { speak } from './tts-module.js';
import { recognizeSpeech } from './speech-recognition-module.js';
import { calculateSimilarity, detailedPronunciationFeedback } from './similarity-analyzer-module.js';

class SpeakingPractice {
    constructor() {
        this.sentences = [];
        this.currentSentenceIndex = 0;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.nativeWaveSurfer = null;
        this.userWaveSurfer = null;
        this.userStats = {
            totalPractices: 0,
            averageSimilarity: 0,
            sentenceStats: {}
        };

        this.initializeElements();
        this.setupEventListeners();
        this.setupAudioVisualization();
        this.loadUserStats();
    }

    initializeElements() {
        // 기존 요소들
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
        
        // 새로운 피드백 요소 추가
        this.pronunciationFeedbackElement = document.createElement('div');
        this.pronunciationFeedbackElement.id = 'pronunciation-feedback';
        this.pronunciationFeedbackElement.classList.add('pronunciation-feedback');
        document.querySelector('.practice-section').appendChild(this.pronunciationFeedbackElement);
        
        // 통계 표시 요소
        this.statsDisplay = document.createElement('div');
        this.statsDisplay.id = 'user-stats';
        document.querySelector('.practice-section').appendChild(this.statsDisplay);
    }

    setupEventListeners() {
        // 기존 이벤트 리스너들
        this.fileUpload.addEventListener('change', this.handleFileUpload.bind(this));
        this.manualInput.addEventListener('input', this.handleManualInput.bind(this));
        this.startRecordingBtn.addEventListener('click', this.startRecording.bind(this));
        this.stopRecordingBtn.addEventListener('click', this.stopRecording.bind(this));
        this.compareAudioBtn.addEventListener('click', this.compareAudio.bind(this));
        this.nextSentenceBtn.addEventListener('click', this.loadNextSentence.bind(this));
    }

    setupAudioVisualization() {
        // WaveSurfer 초기화 로직 (기존과 동일)
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

    // 기존 메서드들 유지 (handleFileUpload, readTextFile 등)

    async compareAudio() {
        try {
            // 사용자 음성 텍스트로 변환
            const userText = await recognizeSpeech(this.userAudio.src);
            
            // 원어민 문장과 사용자 음성 텍스트 유사도 계산
            const currentSentence = this.sentences[this.currentSentenceIndex];
            const similarity = await calculateSimilarity(
                currentSentence.english, 
                userText
            );

            // 상세 발음 피드백 가져오기
            const pronunciationFeedback = await detailedPronunciationFeedback(
                currentSentence.english, 
                userText
            );

            // 통계 업데이트
            this.updatePracticeStats(similarity);
            
            // 유사도 및 발음 피드백 표시
            this.displaySimilarityResult(similarity);
            this.displayPronunciationFeedback(pronunciationFeedback);
        } catch (error) {
            console.error('음성 비교 오류:', error);
            alert('음성 비교 중 오류가 발생했습니다.');
        }
    }

    displaySimilarityResult(similarity) {
        // 유사도 색상 클래스 동적 추가
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
        // 상세 발음 피드백 표시
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

    // 기존의 loadNextSentence, updatePracticeStats 등의 메서드 유지
    loadNextSentence() {
        this.currentSentenceIndex = (this.currentSentenceIndex + 1) % this.sentences.length;
        this.loadCurrentSentence();
        
        // 피드백 초기화
        this.similarityPercentage.textContent = '';
        this.pronunciationFeedbackElement.innerHTML = '';
    }

    // 다른 기존 메서드들 (startRecording, stopRecording 등) 유지
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SpeakingPractice();
});

export default SpeakingPractice;
