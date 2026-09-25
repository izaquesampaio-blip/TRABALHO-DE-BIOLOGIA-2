const form = document.getElementById("quizForm");
const resultQuiz = document.getElementById("resultQuiz");
const resetQuiz = document.getElementById("resetQuiz");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  let points = 0;

  const respostasCorretas = {
    q1: "1",
    q2: "1",
    q3: "1",
    q4: "1",
    q5: "1"
  };

  for (const [question, answer] of Object.entries(respostasCorretas)) {
    const selected = form.querySelector(`input[name="${question}"]:checked`);
    if (selected && selected.value === answer) {
      points += 1;
    }
  }

  resultQuiz.textContent = `Resultado: ${points} de 5 questões corretas.`;
});

resetQuiz.addEventListener("click", () => {
  form.reset();
  resultQuiz.textContent = "";
});
