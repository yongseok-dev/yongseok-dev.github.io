// 퀴즈 데이터(JSON 형식)
let quizData = [];

// 사용자가 선택한 오답을 저장할 배열
let wrongAnswers = [];

const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const answerElement = document.getElementById('answer');
const resultElement = document.getElementById('result');
const submitElement = document.getElementById('submit');
const remainingQuestionsElement = document.getElementById('remaining-questions');
const answerModeButton = document.getElementById('answer-mode');

let currentQuestionIndex = 0;
let isAnswerMode = false; // 주관식 모드 여부

// 문제 순서 랜덤화 함수
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 퀴즈 초기화 함수
function initQuiz() {
  const currentQuestion = quizData[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;

  if (isAnswerMode) { // 주관식 모드일 때
    optionsElement.style.display = 'none'; // 선택지 숨김
    answerElement.style.display = 'block'; // 주관식 입력란 표시
    answerElement.value = ''; // 이전 답변 초기화
    submitElement.textContent = 'Submit';
  } else { // 선택형 모드일 때
    optionsElement.style.display = 'block'; // 선택지 표시
    answerElement.style.display = 'none'; // 주관식 입력란 숨김
    answerElement.value = ''; // 이전 답변 초기화
    submitElement.textContent = 'Submit';
    displayOptions(); // 선택지 표시
  }

  resultElement.textContent = ''; // 결과 메시지 초기화
}

// 선택지 표시 함수
function displayOptions() {
  optionsElement.innerHTML = '';
  const currentQuestion = quizData[currentQuestionIndex];
  shuffleArray(currentQuestion.options);
  currentQuestion.options.forEach((option, index) => {
    const li = document.createElement('li');
    const radioBtn = document.createElement('input');
    radioBtn.type = 'radio';
    radioBtn.name = 'option';
    radioBtn.id = `option${index}`;
    radioBtn.value = option;
    li.appendChild(radioBtn);

    const label = document.createElement('label');
    label.textContent = option;
    label.setAttribute('for', `option${index}`);
    li.appendChild(label);

    optionsElement.appendChild(li);
  });
}

// 오답 정보를 보여줌
function showWrongAnswers() {
  const wrongAnswersList = document.createElement('ul');
  wrongAnswersList.innerHTML = '<h2>Wrong Answers:</h2>';
  wrongAnswers.forEach(answer => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${answer.question}</strong><br>
                    Your Answer: ${answer.selectedAnswer}<br>
                    Correct Answer: ${answer.correctAnswer}`;
    wrongAnswersList.appendChild(li);
  });
  questionElement.appendChild(wrongAnswersList);
}

// 정답 확인 함수
function checkAnswer() {
  if (isAnswerMode) { // 주관식 모드일 때
    const userAnswer = answerElement.value.replace(/\s+/g, ''); // 사용자의 답변 얻기 (모든 공백 제거)
    const correctAnswer = quizData[currentQuestionIndex].correctAnswer.replace(/\s+/g, ''); // 정답 얻기 (모든 공백 제거)
    
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      resultElement.textContent = 'Correct!';
      console.log(1);
    } else {
      resultElement.textContent = `Incorrect! The correct answer is: ${correctAnswer}`;
      wrongAnswers.push({ // 오답 저장
        question: quizData[currentQuestionIndex].question,
        selectedAnswer: userAnswer,
        correctAnswer: correctAnswer
      });
      console.log(2);
    }
  } else { // 선택형 모드일 때
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) {
      resultElement.textContent = 'Please select an option.';
      return;
    }

    const selectedAnswer = selectedOption.value;
    const correctAnswer = quizData[currentQuestionIndex].correctAnswer;

    if (selectedAnswer === correctAnswer) {
      resultElement.textContent = 'Correct!';
    } else {
      resultElement.textContent = `Incorrect! The correct answer is ${correctAnswer}.`;
      wrongAnswers.push({ // 오답 저장
        question: quizData[currentQuestionIndex].question,
        selectedAnswer: selectedAnswer,
        correctAnswer: correctAnswer
      });
    }
  }

  // 다음 문제로 넘어감
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    setTimeout(initQuiz, 1200); // 1.2초 후에 다음 질문을 보여줌
  } else {
    setTimeout(() => {
      questionElement.textContent = '';
      optionsElement.innerHTML = '';
      submitElement.remove();
      resultElement.textContent = 'Quiz completed!';
      showWrongAnswers(); // 모든 퀴즈를 푼 후 오답 보여주기
    }, 1200); // 모든 퀴즈를 푼 후 1.2초 후에 결과를 표시함
    submitElement.disabled = true; // 퀴즈 완료 시 버튼 비활성화
    answerModeButton.disabled = true; // 퀴즈 완료 시 답변 모드 버튼 비활성화
  }
  remainingQuestionsElement.textContent = `(Remaining questions: ${quizData.length - currentQuestionIndex})`;
}

// 퀴즈 초기화 및 버튼 이벤트 리스너 설정
fetch('quizData.json') // 외부 JSON 파일 로드
  .then(response => response.json()) // JSON 파싱
  .then(data => {
    quizData = data; // 전역 변수에 할당
    shuffleArray(quizData); // 문제 순서 랜덤화
    initQuiz(); // 퀴즈 초기화
  })
  .catch(error => console.error('Error loading quiz data:', error));

// 답변 모드 전환 버튼 이벤트 리스너 설정
answerModeButton.addEventListener('click', function() {
  isAnswerMode = !isAnswerMode; // 주관식 모드 전환
  initQuiz(); // 퀴즈 초기화
  remainingQuestionsElement.textContent = `(Remaining questions: ${quizData.length - currentQuestionIndex})`;
});