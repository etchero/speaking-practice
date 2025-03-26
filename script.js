class SpeakingPractice {
    constructor() {
        this.sentences = [];
        this.currentSentenceIndex = 0;
        this.mediaRecorder = null;
        this.audioChunks = [];

        this.initializeElements();
        this.setupEventListeners();
        this.loadSentencesFromLocalStorage();
    }

    initializeElements() {
        this.englishSentenceInput = document.getElementById('english-sentence');
        this.koreanMeaningInput = document.getElementById('korean-meaning');
        this.sentencesList = document.getElementById('sentences');
        this.saveSentenceBtn = document.getElementById('save-sentence');
        this.clearSentenceBtn = document.getElementById('clear-sentence');
        this.startRecordingBtn = document.getElementById('start-recording');
        this.stopRecordingBtn = document.getElementById('stop-recording');
        this.analyzePronunciationBtn = document.getElementById('analyze-pronunciation');
        this.currentSentenceDisplay = document.getElementById('current-sentence');
        this.currentTranslationDisplay = document.getElementById('current-translation');
        this.similarityScoreDisplay = document.getElementById('similarity-score');
        this.pronunciationGradeDisplay = document.getElementById('pronunciation-grade');
        this.recordingStatusDisplay = document.getElementById('recording-status');
    }

    setupEventListeners() {
        this.saveSentenceBtn.addEventListener('click', () => this.saveSentence());
        this.clearSentenceBtn.addEventListener('click', () => this.clearInputs());
        this.startRecordingBtn.addEventListener('click', () => this.startRecording());
        this.stopRecordingBtn.addEventListener('click', () => this.stopRecording());
        this.analyzePronunciationBtn.addEventListener('click', () => this.analyzePronunciation());
    }

    saveSentence() {
        const englishSentence = this.englishSentenceInput.value.trim();
        const koreanMeaning = this.koreanMeaningInput.value.trim();

        if (englishSentence && koreanMeaning) {
            const newSentence = { 
                english: englishSentence, 
                korean: koreanMeaning,
                id: Date.now() 
            };

            this.sentences.push(newSentence);
            this.updateSentencesList();
            this.saveSentencesToLocalStorage();
            this.clearInputs();
        }
    }

    updateSentencesList() {
        this.sentencesList.innerHTML = '';
        this.sentences.forEach((sentence, index) => {
            const li = document.createElement('li');
            li.classList.add('flex', 'justify-between', 'items-center', 'bg-gray-100', 'p-2', 'rounded');
            
            const textSpan = document.createElement('span');
            textSpan.textContent = `${sentence.english} (${sentence.korean})`;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '삭제';
            deleteBtn.classList.add('bg-red-500', 'text-white', 'px-2', 'py-1', 'rounded', 'text-sm');
            deleteBtn.addEventListener('click', () => this.deleteSentence(sentence.id));
            
            const practiceBtn = document.createElement('button');
            practiceBtn.textContent = '연습';
            practiceBtn.classList.add('bg-blue-500', 'text-white', 'px-2', 'py-1', 'rounded', 'text-sm', 'ml-2');
            practiceBtn.addEventListener('click', () => this.startPractice(index));
            
            li.appendChild(textSpan);
            li.appendChild(practiceBtn);
            li.appendChild(deleteBtn);
            
            this.sentencesList.appendChild(li);
        });
    }

    deleteSentence(id) {
        this.sentences = this.sentences.filter(sentence => sentence.id !== id);
        this.updateSentencesList();
        this.saveSentencesToLocalStorage();
    }

    startPractice(index) {
        if (this.sentences.length > 0) {
            this.currentSentenceIndex = index;
            const currentSentence = this.sentences[this.currentSentenceIndex];
            this.currentSentenceDisplay.textContent = currentSentence.english;
            this.currentTranslationDisplay.textContent = currentSentence.korean;
            this.clearPronunciationResults();
        }
    }

    clearInputs() {
        this.englishSentenceInput.value = '';
        this.koreanMeaningInput.value = '';
    }

    saveSentencesToLocalStorage() {
        localStorage.setItem('speakingPracticeSentences', JSON.stringify(this.sentences));
    }

    loadSentencesFromLocalStorage() {
        const savedSentences = localStorage.getItem('speakingPracticeSentences');
        if (savedSentences) {
            this.sentences = JSON.parse(savedSentences);
            this.updateSentencesList();
        }
    }

    startRecording() {
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
                });

                this.mediaRecorder.start();
                this.startRecordingBtn.disabled = true;
                this.stopRecordingBtn.disabled = false;
                this.recordingStatusDisplay.textContent = '녹음 시작';
            })
            .catch(error => {
                console.error('녹음 권한 오류:', error);
                alert('마이크 접근 권한을 확인해주세요.');
            });
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.startRecordingBtn.disabled = false;
            this.stopRecordingBtn.disabled = true;
            this.recordingStatusDisplay.textContent = '녹음 중단';
        }
    }

    analyzePronunciation() {
        if (this.sentences.length === 0) {
            alert('먼저 문장을 추가해주세요.');
            return;
        }

        const currentSentence = this.sentences[this.currentSentenceIndex].english;
        // 실제 음성 인식 및 유사도 분석은 백엔드 API나 더 복잡한 로직 필요
        const similarityScore = Math.random() * 100; // 임시 유사도 점수

        this.displayPronunciationResults(similarityScore);
    }

    displayPronunciationResults(similarityScore) {
        this.similarityScoreDisplay.textContent = `유사도: ${similarityScore.toFixed(2)}%`;

        let grade, gradeClass;
        if (similarityScore >= 90) {
            grade = 'A (원어민 수준)';
            gradeClass = 'similarity-grade-A';
        } else if (similarityScore >= 80) {
            grade = 'B (매우 좋음)';
            gradeClass = 'similarity-grade-B';
        } else if (similarityScore >= 70) {
            grade = 'C (보통)';
            gradeClass = 'similarity-grade-C';
        } else if (similarityScore >= 60) {
            grade = 'D (개선 필요)';
            gradeClass = 'similarity-grade-D';
        } else {
            grade = 'E (많은 연습 필요)';
            gradeClass = 'similarity-grade-E';
        }

        this.pronunciationGradeDisplay.textContent = `발음 등급: ${grade}`;
        this.pronunciationGradeDisplay.className = gradeClass;
    }

    clearPronunciationResults() {
        this.similarityScoreDisplay.textContent = '';
        this.pronunciationGradeDisplay.textContent = '';
        this.pronunciationGradeDisplay.className = '';
        this.recordingStatusDisplay.textContent = '';
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new SpeakingPractice();
});
