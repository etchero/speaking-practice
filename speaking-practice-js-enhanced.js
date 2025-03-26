import { speak } from './tts.js';
import { recognizeSpeech } from './speech-recognition.js';
import { calculateSimilarity } from './similarity-analyzer.js';

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
        // 기존 요소들 + 새로운 요소들
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
        
        // 새로운 통계 표시 요소
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
        // WaveSurfer 설정 (기존과 동일)
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        try {
            let content;
            switch(file.type) {
                case 'text/plain':
                    content = await this.readTextFile(file);
                    this.parseUploadedContent(content);
                    break;
                case 'application/pdf':
                    content = await this.parsePDF(file);
                    this.parseUploadedContent(content);
                    break;
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    content = await this.parseWord(file);
                    this.parseUploadedContent(content);
                    break;
                default:
                    alert('지원되지 않는 파일 형식입니다.');
            }
        } catch (error) {
            console.error('파일 업로드 오류:', error);
            alert('파일을 읽는 중 오류가 발생했습니다.');
        }
    }

    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async parsePDF(file) {
        // PDF.js 라이브러리 사용 예시 (실제 구현 시 라이브러리 추가 필요)
        const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js');
        const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
        const pdf = await loadingTask.promise;
        
        let content = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            content += textContent.items.map(item => item.str).join('\n');
        }
        return content;
    }

    async parseWord(file) {
        // Mammoth.js 사용 예시 (실제 구현 시 라이브러리 추가 필요)
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    }

    parseUploadedContent(content) {
        // 문장 파싱 로직 개선
        const lines = content.split('\n').filter(line => line.trim());
        this.sentences = [];
        
        for (let i = 0; i < lines.length; i += 2) {
            if (lines[i] && lines[i+1]) {
                this.sentences.push({
                    english: lines[i].trim(),
                    korean: lines[i+1].trim(),
                    practiced: 0,
                    bestSimilarity: 0
                });
            }
        }

        this.currentSentenceIndex = 0;
        this.loadCurrentSentence();
    }

    async loadCurrentSentence() {
        if (this.sentences.length === 0) return;

        const currentSentence = this.sentences[this.currentSentenceIndex];
        this.englishSentence.textContent = currentSentence.english;
        this.koreanMeaning.textContent = currentSentence.korean;

        // Text-to-Speech로 원어민 음성 생성
        try {
            const audioBlob = await speak(currentSentence.english);
            this.nativeAudio.src = URL.createObjectURL(audioBlob);
            this.nativeWaveSurfer.load(this.nativeAudio.src);
        } catch (error) {
            console.error('음성 생성 오류:', error);
        }

        // 문장 통계 업데이트
        this.updateSentenceStats(currentSentence);
    }

    updateSentenceStats(sentence) {
        // 개별 문장 및 전체 통계 업데이트
        this.statsDisplay.innerHTML = `
            <h4>문장 통계</h4>
            <p>연습 횟수: ${sentence.practiced}</p>
            <p>최고 유사도: ${sentence.bestSimilarity}%</p>
            <h4>전체 통계</h4>
            <p>총 연습 횟수: ${this.userStats.totalPractices}</p>
            <p>평균 유사도: ${this.userStats.averageSimilarity.toFixed(2)}%</p>
        `;
    }

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

            // 통계 업데이트
            this.updatePracticeStats(similarity);
            
            // 유사도 표시
            this.displaySimilarityResult(similarity);
        } catch (error) {
            console.error('음성 비교 오류:', error);
            alert('음성 비교 중 오류가 발생했습니다.');
        }
    }

    updatePracticeStats(similarity) {
        const currentSentence = this.sentences[this.currentSentenceIndex];
        
        // 개별 문장 통계 업데이트
        currentSentence.practiced++;
        currentSentence.bestSimilarity = Math.max(
            currentSentence.bestSimilarity, 
            similarity
        );

        // 전체 통계 업데이트
        this.userStats.totalPractices++;
        this.userStats.averageSimilarity = (
            (this.userStats.averageSimilarity * (this.userStats.totalPractices - 1) + similarity) / 
            this.userStats.totalPractices
        );

        // 로컬 스토리지에 통계 저장
        this.saveUserStats();
    }

    saveUserStats() {
        localStorage.setItem('speakingPracticeStats', JSON.stringify({
            userStats: this.userStats,
            sentences: this.sentences
        }));
    }

    loadUserStats() {
        const savedStats = localStorage.getItem('speakingPracticeStats');
        if (savedStats) {
            const { userStats, sentences } = JSON.parse(savedStats);
            this.userStats = userStats;
            this.sentences = sentences;
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SpeakingPractice();
});
