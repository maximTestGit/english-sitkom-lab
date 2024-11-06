export function createHtmlString(data) {
    //title, task, text, option0, option1, option2, option3, correctInd, correctMsg, incorrectMsg, checkBtn
    const htmlString = `
  <!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8">
    <title>${data.title}</title>
    <style>
      .exercise-container {
        border: 1px solid black;
        padding: 20px;
        width: 600px;
        margin: 0 auto;
      }
      .correct {
        color: green;
      }
      .incorrect {
        color: red;
      }
    </style>
  </head>
  <body>
    <div class="exercise-container">
      <p><br>${data.task}</br></p>
      <form id="translationForm">
        <input type="radio" id="0" name="translation" value="1">
        <label for="0">${data.options[0]}</label><br>
        <input type="radio" id="1" name="translation" value="2">
        <label for="1">${data.options[1]}</label><br>
        <input type="radio" id="2" name="translation" value="3">
        <label for="2">${data.options[2]}</label><br>
        <input type="radio" id="3" name="translation" value="4">
        <label for="3">${data.options[3]}</label><br><br>
        <button type="button" onclick="checkAnswer()">${data.checkBtn}</button>
      </form>
      <p id="result"></p>
    </div>
    <script>
      function checkAnswer() {
        const correctAnswer = parseInt(${data.correctInd})+1;
        const form = document.getElementById('translationForm');        
        const result = document.getElementById('result');
        const selectedOption = form.elements['translation'].value;
        console.log('AI-Exercise: Selected: '+selectedOption);
        console.log('AI-Exercise: Correct: '+correctAnswer);
        if (selectedOption == correctAnswer) {
          result.textContent = '${data.correctMsg}';
          result.className = 'correct';
        } else {
          result.textContent = '${data.incorrectMsg}';
          result.className = 'incorrect';
        }
      }
    </script>
  </body>
  </html>
    `;

    return htmlString;
}