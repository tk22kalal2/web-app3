export class LectureList {
  constructor() {
    this.currentLectures = [];
    this.currentPlatform = null;
    this.currentSubject = null;
  }

  async loadLectures(platform, subject) {
    this.currentPlatform = platform;
    this.currentSubject = subject;
    
    try {
      // Get the base URL for GitHub Pages
      const baseUrl = window.location.hostname === 'tk22kalal2.github.io' 
        ? '/web-app3/src/platforms'
        : '/src/platforms';
      
      const response = await fetch(`${baseUrl}/${platform}/subjects/${subject.toLowerCase()}.json`);
      const data = await response.json();
      this.currentLectures = data.lectures;
      return data.lectures;
    } catch (error) {
      console.error(`Error loading lectures:`, error);
      return [];
    }
  }

  getCompletionKey(platform, subject, lectureTitle) {
    return `lecture_completed_${platform}_${subject}_${lectureTitle}`;
  }

  isLectureCompleted(platform, subject, lectureTitle) {
    const key = this.getCompletionKey(platform, subject, lectureTitle);
    return localStorage.getItem(key) === 'true';
  }

  toggleLectureCompletion(platform, subject, lectureTitle) {
    const key = this.getCompletionKey(platform, subject, lectureTitle);
    const isCompleted = this.isLectureCompleted(platform, subject, lectureTitle);
    
    if (isCompleted) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, 'true');
    }
    
    // Update the UI
    this.updateCompletionUI(lectureTitle);
  }

  updateCompletionUI(lectureTitle) {
    const lectureCards = document.querySelectorAll('.lecture-card');
    lectureCards.forEach(card => {
      const title = card.querySelector('h3').textContent;
      if (title === lectureTitle) {
        const checkbox = card.querySelector('.completion-checkbox');
        const isCompleted = this.isLectureCompleted(this.currentPlatform, this.currentSubject, lectureTitle);        
        
        checkbox.classList.toggle('completed', isCompleted);
        checkbox.innerHTML = isCompleted ? '<i class="fas fa-circle-check"></i>' : '<i class="far fa-circle"></i>';
        
        // Update card appearance
        card.classList.toggle('completed-lecture', isCompleted);
      }
    });
  }

  openStreamingPopup(streamingUrl, title) {
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'video-popup';
    
    // Create popup content
    const content = document.createElement('div');
    content.className = 'video-popup-content';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-popup';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.onclick = () => {
      document.body.removeChild(popup);
      document.body.style.overflow = 'auto';
    };
    
    // Create title
    const videoTitle = document.createElement('h2');
    videoTitle.textContent = title;
    videoTitle.className = 'video-title';
    
    // Create iframe container
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'iframe-container';
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = streamingUrl;
    iframe.allowFullscreen = true;
    
    // Assemble popup
    iframeContainer.appendChild(iframe);
    content.appendChild(closeButton);
    content.appendChild(videoTitle);
    content.appendChild(iframeContainer);
    popup.appendChild(content);
    
    // Add popup to body
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';
  }

  openDownloadPage(streamingUrl) {
    const downloadUrl = streamingUrl.replace('/watch/', '/dl/');
    window.open(downloadUrl, '_blank');
  }

  render() {
    const container = document.createElement('div');
    container.className = 'lecture-list';

    if (!this.currentLectures || this.currentLectures.length === 0) {
      const message = document.createElement('p');
      message.textContent = 'No lectures available';
      container.appendChild(message);
      return container;
    }

    this.currentLectures.forEach(lecture => {
      const lectureCard = document.createElement('div');
      lectureCard.className = 'lecture-card';
      
      const isCompleted = this.isLectureCompleted(this.currentPlatform, this.currentSubject, lecture.title);
      if (isCompleted) {
        lectureCard.classList.add('completed-lecture');
      }
      
      // Title section with checkbox right next to it
      const titleSection = document.createElement('div');
      titleSection.style.cssText = 'display: flex !important; align-items: center !important; gap: 8px !important; margin-bottom: 12px !important;';
      
      const title = document.createElement('h3');
      title.textContent = lecture.title;
      title.style.cssText = 'margin: 0 !important; flex: 1 !important;';
      
      const completionCheckbox = document.createElement('button');
      completionCheckbox.className = 'completion-checkbox';
      completionCheckbox.innerHTML = isCompleted ? '<i class="fas fa-circle-check"></i>' : '<i class="far fa-circle"></i>';

      if (isCompleted) {
        completionCheckbox.classList.add('completed');
      }
      completionCheckbox.onclick = () => this.toggleLectureCompletion(this.currentPlatform, this.currentSubject, lecture.title);
      
      titleSection.appendChild(title);
      titleSection.appendChild(completionCheckbox);
      
      // Button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
      
      const streamButton = document.createElement('button');
      streamButton.className = 'stream-button';
      streamButton.innerHTML = '<i class="fas fa-play"></i> ';
      streamButton.onclick = () => this.openStreamingPopup(lecture.streamingUrl, lecture.title);
      
      const downloadButton = document.createElement('button');
      downloadButton.className = 'download-button';
      downloadButton.innerHTML = '<i class="fas fa-download"></i> ';
      downloadButton.onclick = () => this.openDownloadPage(lecture.streamingUrl);
      
      buttonContainer.appendChild(streamButton);
      buttonContainer.appendChild(downloadButton);
      
      lectureCard.appendChild(titleSection);
      lectureCard.appendChild(buttonContainer);
      container.appendChild(lectureCard);
    });

    return container;
  }
}
