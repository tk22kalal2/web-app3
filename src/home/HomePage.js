export class HomePage {
  constructor() {
    this.GROQ_API_KEY = "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"; // Replace with your actual key
    this.GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    this.currentQuote = null;
    this.currentMCQ = null;
    this.selectedAnswer = null;
    this.currentDateKey = this.getTodayDateKey();

    // Reload page if date changes
    setInterval(() => {
      const newKey = this.getTodayDateKey();
      if (newKey !== this.currentDateKey) {
        window.location.reload();
      }
    }, 60000);
  }

  getTodayDateKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async fetchFromGroq(prompt) {
    try {
      const response = await fetch(this.GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || "";
      console.log("Raw Groq response:", text);

      // Try parsing JSON directly or extracting from code block
      try {
        return JSON.parse(text);
      } catch {
        const match = text.match(/```json\s*([\s\S]+?)\s*```/);
        if (match) {
          return JSON.parse(match[1]);
        }
      }
    } catch (error) {
      console.error('Error fetching from Groq:', error);
    }

    return null;
  }

  async getDailyQuote() {
    const key = `dailyQuote-${this.getTodayDateKey()}`;
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);

    const prompt = `Generate an inspiring medical quote for NEET-PG aspirants. 
Format: Strict JSON with fields 'quote' and 'author'. Only return JSON, nothing else.`;

    const quote = await this.fetchFromGroq(prompt);
    if (quote?.quote && quote?.author) {
      localStorage.setItem(key, JSON.stringify(quote));
      return quote;
    }

    return {
      quote: "The art of medicine consists of amusing the patient while nature cures the disease.",
      author: "Voltaire"
    };
  }

  async getDailyMCQ() {
    const key = `dailyMCQ-${this.getTodayDateKey()}`;
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);

    const prompt = `Generate a challenging NEET-PG level MCQ question.
Format: Strict JSON with fields 'question', 'options' (array of 4), 'correctAnswer' (index 0-3), 'explanation'.
Only return valid JSON, no extra commentary.`;

    const mcq = await this.fetchFromGroq(prompt);
    if (
      mcq?.question &&
      Array.isArray(mcq.options) && mcq.options.length === 4 &&
      typeof mcq.correctAnswer === "number" &&
      mcq.explanation
    ) {
      localStorage.setItem(key, JSON.stringify(mcq));
      return mcq;
    }

    return {
      question: "Which of the following is a characteristic feature of Parkinson's disease?",
      options: [
        "Pill-rolling tremor",
        "Intention tremor",
        "Flapping tremor",
        "Resting tremor"
      ],
      correctAnswer: 0,
      explanation: "Pill-rolling tremor is a characteristic feature of Parkinson's disease."
    };
  }

  handleOptionClick(optionIndex) {
    if (this.selectedAnswer !== null) return;

    this.selectedAnswer = optionIndex;
    const options = document.querySelectorAll('.mcq-option');
    const correctAnswer = this.currentMCQ.correctAnswer;

    options[optionIndex].classList.add(optionIndex === correctAnswer ? 'correct' : 'incorrect');
    if (optionIndex !== correctAnswer) {
      options[correctAnswer].classList.add('correct');
    }

    document.querySelector('.mcq-explanation').style.display = 'block';
  }

  async render() {
    const container = document.createElement('div');
    container.className = 'home-page';

    this.currentQuote = await this.getDailyQuote();
    this.currentMCQ = await this.getDailyMCQ();

    const quoteSection = document.createElement('div');
    quoteSection.className = 'quote-section';
    quoteSection.innerHTML = `
      <h2>Quote of the Day</h2>
      <div class="quote-content">
        <i class="fas fa-quote-left"></i>
        <p class="quote-text">${this.currentQuote?.quote}</p>
        <p class="quote-author">- ${this.currentQuote?.author}</p>
      </div>
    `;

    const mcqSection = document.createElement('div');
    mcqSection.className = 'mcq-section';
    mcqSection.innerHTML = `
      <h2>MCQ of the Day</h2>
      <p class="mcq-question">${this.currentMCQ?.question}</p>
      <div class="mcq-options">
        ${this.currentMCQ.options.map((option, index) => `
          <button class="mcq-option" data-index="${index}">${option}</button>
        `).join('')}
      </div>
      <div class="mcq-explanation" style="display: none;">
        <h3>Explanation:</h3>
        <p class="explanation-text">${this.currentMCQ?.explanation}</p>
      </div>
    `;

    mcqSection.querySelectorAll('.mcq-option').forEach((option, index) => {
      option.addEventListener('click', () => this.handleOptionClick(index));
    });

    container.appendChild(quoteSection);
    container.appendChild(mcqSection);
    return container;
  }
}
