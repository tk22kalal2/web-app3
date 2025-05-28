export class HomePage {
  constructor() {
    // Use a shared cache key that's the same for all users
    this.SHARED_CACHE_KEY = "neetpg-daily-content";
    this.GROQ_API_KEY = "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";
    this.GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    this.currentQuote = null;
    this.currentMCQ = null;
    this.selectedAnswer = null;
    this.currentDateKey = this.getTodayDateKey();

    // Check daily for date changes
    setInterval(() => {
      const newKey = this.getTodayDateKey();
      if (newKey !== this.currentDateKey) {
        window.location.reload();
      }
    }, 60000);
  }

  getTodayDateKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
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
          max_tokens: 1024,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const jsonString = data?.choices?.[0]?.message?.content || "";
      
      try {
        return JSON.parse(jsonString);
      } catch {
        // Extract JSON from code block if needed
        const match = jsonString.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;
      }
    } catch (error) {
      console.error('Groq API Error:', error);
      return null;
    }
  }

  async getSharedDailyContent() {
    // Check if we have valid content for today
    const sharedCache = JSON.parse(localStorage.getItem(this.SHARED_CACHE_KEY) || {};
    
    if (sharedCache.dateKey === this.currentDateKey) {
      return sharedCache;
    }

    // Generate new content only if not already created today
    if (!sharedCache.isGeneratedToday) {
      console.log("Generating new daily content...");
      const [quote, mcq] = await Promise.all([
        this.generateQuote(),
        this.generateMCQ()
      ]);

      // Update shared cache with new content
      const newCache = {
        dateKey: this.currentDateKey,
        isGeneratedToday: true,
        quote,
        mcq
      };
      
      localStorage.setItem(this.SHARED_CACHE_KEY, JSON.stringify(newCache));
      return newCache;
    }

    // If already generated but date changed, wait for next refresh
    return null;
  }

  async generateQuote() {
    const prompt = `Generate a unique, inspiring medical quote for NEET-PG aspirants. 
Respond ONLY with valid JSON: { "quote": "quote text", "author": "author name" }
Do not include any additional text or explanations.`;

    const quote = await this.fetchFromGroq(prompt);
    return quote || {
      quote: "The art of medicine consists of amusing the patient while nature cures the disease.",
      author: "Voltaire"
    };
  }

  async generateMCQ() {
    const prompt = `Generate a unique NEET-PG level MCQ question on a random medical topic.
Respond ONLY with valid JSON containing:
{
  "question": "Question text?",
  "options": ["Option1", "Option2", "Option3", "Option4"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation"
}
- correctAnswer must be index (0-3)
- Include 4 options exactly
- Do not include any additional text`;

    const mcq = await this.fetchFromGroq(prompt);
    return mcq || {
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

    // Get shared content (same for all users)
    const sharedContent = await this.getSharedDailyContent();
    if (sharedContent) {
      this.currentQuote = sharedContent.quote;
      this.currentMCQ = sharedContent.mcq;
    } else {
      // Fallback to local cache if shared content not ready
      const localQuoteKey = `dailyQuote-${this.currentDateKey}`;
      const localMCQKey = `dailyMCQ-${this.currentDateKey}`;
      
      this.currentQuote = JSON.parse(localStorage.getItem(localQuoteKey) || '{}');
      this.currentMCQ = JSON.parse(localStorage.getItem(localMCQKey) || '{}');
    }

    // If still no content, use placeholders
    if (!this.currentQuote?.quote) {
      this.currentQuote = {
        quote: "Loading today's inspiration...",
        author: "System"
      };
    }
    
    if (!this.currentMCQ?.question) {
      this.currentMCQ = {
        question: "Loading today's question...",
        options: ["Loading...", "Loading...", "Loading...", "Loading..."],
        correctAnswer: 0,
        explanation: "Please refresh the page to load the question."
      };
    }

    const quoteSection = document.createElement('div');
    quoteSection.className = 'quote-section';
    quoteSection.innerHTML = `
      <h2>Quote of the Day</h2>
      <div class="quote-content">
        <i class="fas fa-quote-left"></i>
        <p class="quote-text">${this.currentQuote.quote}</p>
        <p class="quote-author">- ${this.currentQuote.author}</p>
      </div>
    `;

    const mcqSection = document.createElement('div');
    mcqSection.className = 'mcq-section';
    mcqSection.innerHTML = `
      <h2>MCQ of the Day</h2>
      <p class="mcq-question">${this.currentMCQ.question}</p>
      <div class="mcq-options">
        ${this.currentMCQ.options.map((option, index) => `
          <button class="mcq-option" data-index="${index}">${option}</button>
        `).join('')}
      </div>
      <div class="mcq-explanation" style="display: none;">
        <h3>Explanation:</h3>
        <p class="explanation-text">${this.currentMCQ.explanation}</p>
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
