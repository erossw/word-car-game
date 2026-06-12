class QuizController {
  constructor() {
    this.overlay = document.getElementById("quiz-overlay");
    this.grade = document.getElementById("quiz-grade");
    this.emoji = document.getElementById("quiz-emoji");
    this.hint = document.getElementById("quiz-hint");
    this.timerBar = document.getElementById("quiz-timer-bar");
    this.choices = document.getElementById("quiz-choices");
    this.feedback = document.getElementById("quiz-feedback");
    this.timerId = null;
    this.startedAt = 0;
    this.finished = false;
  }

  show(wordData, distractors, callbacks) {
    this.hide();
    this.finished = false;
    this.startedAt = performance.now();
    this.callbacks = callbacks;
    this.wordData = wordData;
    this.grade.textContent = `GRADE ${wordData.grade}`;
    this.emoji.textContent = wordData.emoji;
    this.hint.textContent = wordData.hint;
    this.feedback.textContent = "";
    this.timerBar.style.width = "100%";
    this.timerBar.style.background = "#22c55e";
    this.choices.replaceChildren();

    const options = this.shuffle([wordData.word, ...distractors]);
    options.forEach(option => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => this.answer(option, button));
      this.choices.appendChild(button);
    });

    this.overlay.classList.add("is-visible");
    this.overlay.querySelector("button")?.focus();
    this.timerId = window.setInterval(() => this.tick(), 50);
  }

  tick() {
    if (this.finished) return;
    const elapsed = performance.now() - this.startedAt;
    const remaining = Math.max(0, 1 - elapsed / 15000);
    this.timerBar.style.width = `${remaining * 100}%`;
    if (remaining < 0.3) this.timerBar.style.background = "#ef4444";
    else if (remaining < 0.6) this.timerBar.style.background = "#facc15";
    if (remaining <= 0) this.finish(false, null, 15000, true);
  }

  answer(option, button) {
    if (this.finished) return;
    const elapsed = performance.now() - this.startedAt;
    this.finish(option === this.wordData.word, button, elapsed, false);
  }

  finish(isCorrect, selectedButton, elapsed, timedOut) {
    this.finished = true;
    window.clearInterval(this.timerId);
    this.choices.querySelectorAll("button").forEach(button => {
      button.disabled = true;
      if (button.textContent === this.wordData.word) button.classList.add("correct");
    });
    if (!isCorrect && selectedButton) selectedButton.classList.add("wrong");
    this.feedback.textContent = isCorrect
      ? "정답입니다!"
      : timedOut
        ? `시간 초과! 정답은 ${this.wordData.word}`
        : `아쉬워요. 정답은 ${this.wordData.word}`;

    window.setTimeout(() => {
      this.hide();
      if (isCorrect) this.callbacks.onCorrect(elapsed);
      else this.callbacks.onWrong({ timedOut });
    }, 1100);
  }

  hide() {
    window.clearInterval(this.timerId);
    this.timerId = null;
    this.overlay.classList.remove("is-visible");
  }

  shuffle(values) {
    const result = values.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

window.quizController = new QuizController();
