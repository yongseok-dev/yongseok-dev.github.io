// 현재 페이지 URL에서 쿼리스트링 파싱
const queryParams = new URLSearchParams(window.location.search);

// 특정 매개변수 값 가져오기
const parameterValue = queryParams.get('parameterName');

// 모든 쿼리스트링 매개변수 및 값 가져오기
const allParameters = {};
for (const [key, value] of queryParams.entries()) {
  allParameters[key] = value;
}

// 퀴즈 데이터(JSON 형식)
let quizData = [];

// 사용자가 선택한 오답을 저장할 배열
let wrongAnswers = [];
let answerStatus = [];

const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const answerElement = document.getElementById('answer');
const resultElement = document.getElementById('result');
const submitElement = document.getElementById('submit');
const remainingQuestionsElement = document.getElementById(
  'remaining-questions'
);
const correctElement = document.getElementById('correct');
const answerModeButton = document.getElementById('answer-mode');
const answerCopyButton = document.getElementById('answer-copy');

let currentQuestionIndex = 0;
let isAnswerMode = false; // 주관식 모드 여부

// 배열순서 랜덤화 함수
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function convertToBase32(decimalNumber) {
  const base32Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
  let result = '';

  while (decimalNumber > 0) {
    const remainder = decimalNumber % 32;
    result = base32Chars[remainder] + result;
    decimalNumber = Math.floor(decimalNumber / 32);
  }

  return result;
}

function convertFromBase32(base32String) {
  const base32Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
  let result = 0;

  for (let i = 0; i < base32String.length; i++) {
    const digit = base32Chars.indexOf(base32String[i]);
    result = result * 32 + digit;
  }

  return result;
}

// 퀴즈 결과를 32진수로 표현하는 쿼리스트링을 생성하는 함수
function generateQueryString(answerStatus) {
  // answerStatus 배열을 이진수로 변환
  const binaryString = answerStatus
    .map((status) => (status ? '1' : '0'))
    .join('');

  // 이진수를 10진수로 변환
  const decimalNumber = parseInt(binaryString, 2);

  // 10진수를 32진수로 변환
  const base32String = convertToBase32(decimalNumber);

  return base32String;
}

// 쿼리스트링으로부터 정답 유무 배열을 생성하는 함수
function createAnswerStatusFromQueryString(queryString) {
  // 32진수를 10진수로 변환
  const decimalNumber = convertFromBase32(queryString);

  // 10진수를 이진수로 변환하여 문자열로 저장
  let binaryString = decimalNumber.toString(2);

  // 이진수 문자열을 배열로 변환하고, 필요한 길이가 되도록 앞쪽에 0을 추가
  const answerStatusArray = binaryString
    .padStart(answerStatus.length, '0')
    .split('')
    .map((e) => (Number(e) == 1 ? true : false));
  return answerStatusArray;
}

// 퀴즈 초기화 함수
function initQuiz() {
  const currentQuestion = quizData[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;

  if (isAnswerMode) {
    // 주관식 모드일 때
    optionsElement.style.display = 'none'; // 선택지 숨김
    answerElement.style.display = 'block'; // 주관식 입력란 표시
    answerElement.value = ''; // 이전 답변 초기화
    submitElement.textContent = 'Submit';
  } else {
    // 선택형 모드일 때
    optionsElement.style.display = 'block'; // 선택지 표시
    answerElement.style.display = 'none'; // 주관식 입력란 숨김
    answerElement.value = ''; // 이전 답변 초기화
    submitElement.textContent = 'Submit';
    displayOptions(); // 선택지 표시
  }
  resultElement.textContent = ''; // 결과 메시지 초기화
}

function copyToClipboard(text) {
  // 텍스트를 복사하기 위해 임시로 textarea 엘리먼트를 생성합니다.
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);

  // textarea에 포커스를 줍니다.
  textarea.focus();
  textarea.select();

  // 복사 명령을 실행합니다.
  document.execCommand('copy');

  // 임시로 생성한 textarea 엘리먼트를 제거합니다.
  document.body.removeChild(textarea);
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
  wrongAnswers.forEach((answer) => {
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
  const quizIndex = quizData[currentQuestionIndex].index;
  if (isAnswerMode) {
    // 주관식 모드일 때
    const userAnswer = answerElement.value.replace(/\s+/g, ''); // 사용자의 답변 얻기 (모든 공백 제거)
    const correctAnswer = quizData[currentQuestionIndex].correctAnswer.replace(
      /\s+/g,
      ''
    ); // 정답 얻기 (모든 공백 제거)

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      resultElement.textContent = 'Correct!';
      answerStatus[quizIndex] = true;
    } else {
      resultElement.textContent = `Incorrect! The correct answer is: ${correctAnswer}`;
      wrongAnswers.push({
        // 오답 저장
        question: quizData[currentQuestionIndex].question,
        selectedAnswer: userAnswer,
        correctAnswer: correctAnswer,
      });
    }
  } else {
    // 선택형 모드일 때
    const selectedOption = document.querySelector(
      'input[name="option"]:checked'
    );
    if (!selectedOption) {
      resultElement.textContent = 'Please select an option.';
      return;
    }

    const selectedAnswer = selectedOption.value;
    const correctAnswer = quizData[currentQuestionIndex].correctAnswer;

    if (selectedAnswer === correctAnswer) {
      resultElement.textContent = 'Correct!';
      answerStatus[quizIndex] = true;
    } else {
      resultElement.textContent = `Incorrect! The correct answer is ${correctAnswer}.`;
      wrongAnswers.push({
        // 오답 저장
        question: quizData[currentQuestionIndex].question,
        selectedAnswer: selectedAnswer,
        correctAnswer: correctAnswer,
      });
    }
  }

  // 다음 문제로 넘어감
  currentQuestionIndex++;
  while (
    currentQuestionIndex < quizData.length &&
    answerStatus[quizData[currentQuestionIndex].index]
  ) {
    currentQuestionIndex++;
  }
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
  remainingQuestionsElement.textContent = `(questions: ${
    quizData.length - currentQuestionIndex
  })`;
  correctElement.textContent = `${
    currentQuestionIndex - wrongAnswers.length
  } / ${quizData.length}`;
}

// 퀴즈 초기화 및 버튼 이벤트 리스너 설정
fetch('quizData.json') // 외부 JSON 파일 로드
  .then((response) => response.json()) // JSON 파싱
  .then((data) => {
    quizData = data.map((e, i) => {
      return {
        ...e, // 기존 요소 유지
        index: i, // 새로운 속성(index) 추가
      };
    }); // 전역 변수에 할당
    answerStatus = new Array(quizData.length).fill(false);

    if (allParameters.test) {
      answerStatus = createAnswerStatusFromQueryString(allParameters.test);
    }

    shuffleArray(quizData); // 문제 순서 랜덤화
    while (
      currentQuestionIndex < quizData.length &&
      answerStatus[quizData[currentQuestionIndex].index]
    ) {
      currentQuestionIndex++;
    }
    initQuiz(); // 퀴즈 초기화
    correctElement.textContent = `${
      currentQuestionIndex - wrongAnswers.length
    } / ${quizData.length}`;
    remainingQuestionsElement.textContent = `(questions: ${
      quizData.length - currentQuestionIndex
    })`;
  })
  .catch((error) => console.error('Error loading quiz data:', error));

// 답변 모드 전환 버튼 이벤트 리스너 설정
answerModeButton.addEventListener('click', function () {
  isAnswerMode = !isAnswerMode; // 주관식 모드 전환
  initQuiz(); // 퀴즈 초기화
  remainingQuestionsElement.textContent = `(questions: ${
    quizData.length - currentQuestionIndex
  })`;
});

answerCopyButton.addEventListener('click', function () {
  const queryString = generateQueryString(answerStatus);
  const url =
    window.location.origin + window.location.pathname + '?test=' + queryString;
  copyToClipboard(url);
  alert('현황이 복사되었습니다.');
});
