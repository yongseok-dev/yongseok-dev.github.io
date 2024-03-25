
// 퀴즈 데이터(JSON 형식)
let quizData = [];

// 사용자가 선택한 오답을 저장할 배열
let wrongAnswers = [];

const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const resultElement = document.getElementById('result');
const submitElement = document.getElementById('submit');

let currentQuestionIndex = 0;

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

  optionsElement.innerHTML = '';
  resultElement.textContent = '';
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

  // 다음 질문으로 넘어감
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    setTimeout(initQuiz, 1200); // 2초 후에 다음 질문을 보여줌
  } else {
    setTimeout(() => {
      questionElement.textContent = '';
      optionsElement.innerHTML = '';
      submitElement.remove();
      resultElement.textContent = 'Quiz completed!';
      showWrongAnswers(); // 모든 퀴즈를 푼 후 오답 보여주기
    }, 1200); // 모든 퀴즈를 푼 후 2초 후에 결과를 표시함
  }
}

// 퀴즈 초기화
fetch('quizData.json') // 외부 JSON 파일 로드
  .then(response => response.json()) // JSON 파싱
  .then(data => {
    quizData = data; // 전역 변수에 할당
    shuffleArray(quizData);// 문제 순서 랜덤화
    initQuiz(); // 퀴즈 초기화 함수 호출
  })
  .catch(error => console.error('Error loading quiz data:', error));  