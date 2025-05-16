import { PlatformSelector } from './src/components/PlatformSelector.js';
import { MarrowSubjectList } from './src/platforms/marrow/MarrowSubjectList.js';
import { DamsSubjectList } from './src/platforms/dams/DamsSubjectList.js';
import { PrepladderSubjectList } from './src/platforms/prepladder/PrepladderSubjectList.js';
import { LectureList } from './src/components/LectureList.js';
import { SearchPage } from './src/search/SearchPage.js';

class App {
  constructor() {
    this.platformSelector = new PlatformSelector();
    this.marrowSubjectList = new MarrowSubjectList();
    this.damsSubjectList = new DamsSubjectList();
    this.prepladderSubjectList = new PrepladderSubjectList();
    this.lectureList = new LectureList();
    this.searchPage = new SearchPage();
    this.selectedPlatform = null;
    this.selectedSubject = null;
    this.currentView = 'platforms'; // 'platforms', 'subjects', 'lectures', or 'search'

    this.init();
  }

  init() {
    document.addEventListener('platformSelect', (e) => {
      this.selectedPlatform = e.detail;
      this.currentView = 'subjects';
      this.updateView();
    });

    document.addEventListener('subjectSelect', (e) => {
      this.selectedSubject = e.detail.subject;
      this.currentView = 'lectures';
      this.updateView();
    });

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', () => this.handleBack());

    // Add navigation handling
    const bottomNav = document.querySelector('.bottom-nav');
    bottomNav.addEventListener('click', (e) => {
      const navItem = e.target.closest('a');
      if (!navItem) return;

      e.preventDefault();
      const navItems = bottomNav.querySelectorAll('a');
      navItems.forEach(item => item.classList.remove('active'));
      navItem.classList.add('active');

      if (navItem.querySelector('span').textContent === 'Search') {
        this.currentView = 'search';
      } else if (navItem.querySelector('span').textContent === 'Dashboard') {
        this.currentView = 'platforms';
      }
      this.updateView();
    });

    this.updateView();
  }

  handleBack() {
    if (this.currentView === 'lectures') {
      this.currentView = 'subjects';
      this.selectedSubject = null;
    } else if (this.currentView === 'subjects') {
      this.currentView = 'platforms';
      this.selectedPlatform = null;
    }
    this.updateView();
  }

  handleSearch(query) {
    query = query.toLowerCase();
    
    if (this.currentView === 'lectures') {
      const lectureCards = document.querySelectorAll('.lecture-card');
      lectureCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = title.includes(query) ? 'flex' : 'none';
      });
    } else if (this.currentView === 'subjects') {
      const subjectCards = document.querySelectorAll('.subject-card');
      subjectCards.forEach(card => {
        const subject = card.textContent.toLowerCase();
        card.style.display = subject.includes(query) ? 'block' : 'none';
      });
    } else {
      const platformButtons = document.querySelectorAll('.platform-selector button');
      platformButtons.forEach(button => {
        const platform = button.textContent.toLowerCase();
        button.style.display = platform.includes(query) ? 'flex' : 'none';
      });
    }
  }

  updateView() {
    const main = document.querySelector('main');
    main.innerHTML = '';
    
    const pageTitle = document.getElementById('pageTitle');
    const backBtn = document.getElementById('backBtn');
    
    if (this.currentView === 'search') {
      pageTitle.textContent = 'Search';
      backBtn.style.display = 'none';
      main.appendChild(this.searchPage.render());
    } else if (this.currentView === 'platforms') {
      pageTitle.textContent = 'Select Platform';
      backBtn.style.display = 'none';
      main.appendChild(this.platformSelector.render());
    } else if (this.currentView === 'subjects') {
      pageTitle.textContent = `${this.selectedPlatform.toUpperCase()} Subjects`;
      backBtn.style.display = 'block';
      
      let subjectList;
      switch(this.selectedPlatform) {
        case 'marrow':
          subjectList = this.marrowSubjectList;
          break;
        case 'dams':
          subjectList = this.damsSubjectList;
          break;
        case 'prepladder':
          subjectList = this.prepladderSubjectList;
          break;
      }
      
      main.appendChild(subjectList.render(this.selectedPlatform));
    } else if (this.currentView === 'lectures') {
      pageTitle.textContent = `${this.selectedSubject} Lectures`;
      backBtn.style.display = 'block';
      this.lectureList.loadLectures(this.selectedPlatform, this.selectedSubject)
        .then(() => main.appendChild(this.lectureList.render()));
    }
  }
}

new App();