export class HomePage {
  constructor() {
    this.GROQ_API_KEY = "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";
    this.GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    this.currentQuote = null;
    this.currentMCQ = null;
    this.selectedAnswer = null;
  }

  getTodayDateKey() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // "YYYY-MM-DD"
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
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      const data = await response.json();
      return data.choices && data.choices.length > 0 ? data.choices[0].message.content : null;
    } catch (error) {
      console.error('Error fetching from Groq:', error);
      return null;
    }
  }

  async getDailyQuote() {
    const key = `dailyQuote-${this.getTodayDateKey()}`;
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);

    const prompt = "Generate an inspiring medical quote for NEET-PG aspirants. Format: JSON with 'quote' and 'author' fields. Make it motivational and relevant to medical studies.";
    const response = await this.fetchFromGroq(prompt);
    const quote = response ? JSON.parse(response) : {
      quote: "The art of medicine consists of amusing the patient while nature cures the disease.",
      author: "Voltaire"
    };

    localStorage.setItem(key, JSON.stringify(quote));
    return quote;
  }

  async getDailyMCQ() {
    const key = `dailyMCQ-${this.getTodayDateKey()}`;
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);

    const prompt = "Generate a challenging NEET-PG level MCQ question. Format: JSON with 'question', 'options' (array of 4), 'correctAnswer' (index 0-3), and 'explanation' fields. Make it high quality and educational.";
    const response = await this.fetchFromGroq(prompt);
    const mcq = response ? JSON.parse(response) : {
      question: "Which of the following is a characteristic feature of Parkinson's disease?",
      options: [
        "Pill-rolling tremor",
        "Intention tremor",
        "Flapping tremor",
        "Resting tremor"
      ],
      correctAnswer: 0,
      explanation: "Pill-rolling tremor is a characteristic feature of Parkinson's disease. It's a resting tremor that appears as if the patient is rolling a pill between thumb and index finger."
    };

    localStorage.setItem(key, JSON.stringify(mcq));
    return mcq;
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

    // Fetch daily content
    this.currentQuote = await this.getDailyQuote();
    this.currentMCQ = await this.getDailyMCQ();

    // Quote Section
    const quoteSection = document.createElement('div');
    quoteSection.className = 'quote-section';
    quoteSection.innerHTML = `
      <h2>Quote of the Day</h2>
      <div class="quote-content">
        <i class="fas fa-quote-left"></i>
        <p class="quote-text">${this.currentQuote?.quote || 'No quote available'}</p>
        <p class="quote-author">- ${this.currentQuote?.author || 'Unknown'}</p>
      </div>
    `;

    // MCQ Section
    const mcqSection = document.createElement('div');
    mcqSection.className = 'mcq-section';
    mcqSection.innerHTML = `
      <h2>MCQ of the Day</h2>
      <p class="mcq-question">${this.currentMCQ?.question || 'No question available'}</p>
      <div class="mcq-options">
        ${(this.currentMCQ?.options || []).map((option, index) => `
          <button class="mcq-option" data-index="${index}">${option}</button>
        `).join('')}
      </div>
      <div class="mcq-explanation" style="display: none;">
        <h3>Explanation:</h3>
        <p class="explanation-text">${this.currentMCQ?.explanation || 'No explanation available'}</p>
      </div>
    `;

    // Add event listeners
    mcqSection.querySelectorAll('.mcq-option').forEach((option, index) => {
      option.addEventListener('click', () => this.handleOptionClick(index));
    });

    container.appendChild(quoteSection);
    container.appendChild(mcqSection);
    return container;
  }
}
