const numbers = document.querySelectorAll('.number');
const result = document.querySelector('.result');
const pickButton = document.getElementById('pickButton');

const pickedNumbers = new Set();

pickButton.addEventListener('click', pickNumber);

function pickNumber() {
  if (pickedNumbers.size === numbers.length) {
    result.textContent = 'All numbers have been picked.';
    return;
  }

  let randomNumber;
  do {
    randomNumber = Math.floor(Math.random() * numbers.length);
  } while (pickedNumbers.has(randomNumber));

  const pickedNumberElement = numbers[randomNumber];
  pickedNumbers.add(randomNumber);
  pickedNumberElement.classList.add('picked');

  result.textContent = `Picked Number: ${pickedNumberElement.textContent}`;
}
