# 안동 영어종결센터 Speaking Practice

## 프로젝트 소개
안동 영어종결센터의 Speaking Practice 웹 애플리케이션은 영어 학습자들을 위한 혁신적인 음성 연습 도구입니다. 이 애플리케이션은 사용자가 영어 문장을 듣고, 따라 말하며, 자신의 발음을 평가할 수 있도록 설계되었습니다.

## 주요 기능
- 📁 파일 업로드 및 수동 입력 지원
  - 텍스트 파일, PDF, Word 문서 지원
- 🔊 Text-to-Speech 원어민 음성 생성
- 🎤 사용자 음성 녹음 및 분석
- 📊 음성 유사도 측정 (0-100%)
- 📈 학습 통계 추적 및 저장

## 기술 스택
- HTML5
- CSS3
- JavaScript (ES6+)
- Web APIs
  - Web Audio API
  - MediaRecorder API
- 외부 서비스 연동
  - Azure Text-to-Speech
  - Google Speech-to-Text

## 설치 및 사용 방법
1. 리포지토리 클론
```bash
git clone https://github.com/your-username/speaking-practice.git
cd speaking-practice
```

2. API 키 설정
- `tts.js`의 `YOUR_AZURE_TTS_API_KEY`를 Azure TTS API 키로 대체
- `speech-recognition.js`의 `YOUR_GOOGLE_SPEECH_TO_TEXT_API_KEY`를 Google Speech-to-Text API 키로 대체

3. 웹 서버 실행
로컬 웹 서버를 사용하여 프로젝트 실행 (예: Live Server 확장 프로그램)

## API 연동
### Text-to-Speech (Azure)
- Azure Cognitive Services Speech SDK 사용
- 지원 언어: 영어 (en-US)

### Speech-to-Text (Google)
- Google Cloud Speech-to-Text API 사용
- 오디오 인코딩: LINEAR16
- 샘플링 레이트: 44.1kHz

## 학습 통계
- 개별 문장 연습 횟수 추적
- 문장별 최고 유사도 기록
- 전체 학습 통계 로컬 스토리지에 저장

## 향후 개선 계획
- 다국어 지원
- 심층 발음 분석
- 개인화된 학습 경로 제공
- 소셜 기능 추가

## 라이선스
MIT 라이선스

## 기여 방법
1. 포크(Fork)
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치 푸시 (`git push origin feature/AmazingFeature`)
5. 풀 리퀘스트 생성

## 문의
프로젝트 관련 문의: your-email@example.com
