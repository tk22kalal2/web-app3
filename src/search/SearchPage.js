export class SearchPage {
  constructor() {
    this.currentView = 'search';
    this.platforms = ['marrow', 'dams', 'prepladder'];
    this.subjects = ['anatomy', 'physiology'];
  }

  async getAllTeachers() {
    const teachers = [];
    
    // Import all platform subject lists
    const marrowList = await import('../platforms/marrow/MarrowSubjectList.js');
    const damsList = await import('../platforms/dams/DamsSubjectList.js');
    const prepladderList = await import('../platforms/prepladder/PrepladderSubjectList.js');
    
    const marrowTeachers = new marrowList.MarrowSubjectList().subjects;
    const damsTeachers = new damsList.DamsSubjectList().subjects;
    const prepladderTeachers = new prepladderList.PrepladderSubjectList().subjects;
    
    // Format teacher data from each platform
    marrowTeachers.forEach(subject => {
      if (subject.teacher) {
        teachers.push({
          name: subject.teacher,
          subject: subject.name,
          platform: 'Marrow'
        });
      }
    });

    damsTeachers.forEach(subject => {
      if (subject.teacher) {
        teachers.push({
          name: subject.teacher,
          subject: subject.name,
          platform: 'DAMS'
        });
      }
    });

    prepladderTeachers.forEach(subject => {
      if (subject.teacher) {
        teachers.push({
          name: subject.teacher,
          subject: subject.name,
          platform: 'Prepladder'
        });
      }
    });

    return teachers;
  }

  async getAllLectures() {
    const lectures = [];
    const baseUrl = window.location.hostname === 'tk22kalal2.github.io' 
      ? '/web-app3/src/platforms'
      : '/src/platforms';
    
    for (const platform of this.platforms) {
      for (const subject of this.subjects) {
        try {
          const response = await fetch(`${baseUrl}/${platform}/subjects/${subject}.json`);
          if (response.ok) {
            const data = await response.json();
            if (data.lectures) {
              data.lectures.forEach(lecture => {
                lectures.push({
                  ...lecture,
                  subject: data.subjectName,
                  platform: platform.charAt(0).toUpperCase() + platform.slice(1)
                });
              });
            }
          }
        } catch (error) {
          console.error(`Error loading lectures for ${platform}/${subject}:`, error);
        }
      }
    }
    
    return lectures;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'search-page';

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const searchBar = document.createElement('div');
    searchBar.className = 'enhanced-search-bar';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    searchInput.className = 'search-input';

    const searchTypeSelect = document.createElement('select');
    searchTypeSelect.className = 'search-type-select';
    searchTypeSelect.innerHTML = `
      <option value="teacher">Search by Teacher</option>
      <option value="lecture">Search by Lecture</option>
    `;

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';

    searchInput.addEventListener('input', async (e) => {
      const searchType = searchTypeSelect.value;
      const query = e.target.value.toLowerCase();
      
      if (query.length < 2) {
        resultsContainer.innerHTML = '<p class="search-prompt">Enter at least 2 characters to search</p>';
        return;
      }

      if (searchType === 'teacher') {
        const teachers = await this.getAllTeachers();
        const results = teachers.filter(teacher => 
          teacher.name.toLowerCase().includes(query) ||
          teacher.subject.toLowerCase().includes(query)
        );
        this.displayTeacherResults(results, resultsContainer);
      } else {
        const lectures = await this.getAllLectures();
        const results = lectures.filter(lecture =>
          lecture.title.toLowerCase().includes(query) ||
          lecture.subject.toLowerCase().includes(query)
        );
        this.displayLectureResults(results, resultsContainer);
      }
    });

    searchTypeSelect.addEventListener('change', () => {
      searchInput.value = '';
      resultsContainer.innerHTML = '';
    });

    searchBar.appendChild(searchInput);
    searchBar.appendChild(searchTypeSelect);
    searchContainer.appendChild(searchBar);
    container.appendChild(searchContainer);
    container.appendChild(resultsContainer);

    return container;
  }

  displayTeacherResults(results, container) {
    if (results.length === 0) {
      container.innerHTML = '<p class="no-results">No teachers found</p>';
      return;
    }

    container.innerHTML = results.map(teacher => `
      <div class="search-result-card" onclick="document.dispatchEvent(new CustomEvent('platformSelect', { detail: '${teacher.platform.toLowerCase()}' }))">
        <div class="result-header">
          <i class="fas fa-user-md"></i>
          <h3>${teacher.name}</h3>
        </div>
        <div class="result-details">
          <span><i class="fas fa-book-medical"></i> ${teacher.subject}</span>
          <span><i class="fas fa-building"></i> ${teacher.platform}</span>
        </div>
      </div>
    `).join('');
  }
  displayLectureResults(results, container) {
    if (results.length === 0) {
      container.innerHTML = '<p class="no-results">No lectures found</p>';
      return;
    }

    container.innerHTML = results.map(lecture => `
      <div class="search-result-card" onclick="document.dispatchEvent(new CustomEvent('subjectSelect', { detail: { platform: '${lecture.platform.toLowerCase()}', subject: '${lecture.subject}' } }))">
        <div class="result-header">
          <i class="fas fa-play-circle"></i>
          <h3>${lecture.title}</h3>
        </div>
        <div class="result-details">
          <span><i class="fas fa-book-medical"></i> ${lecture.subject}</span>
          <span><i class="fas fa-building"></i> ${lecture.platform}</span>
        </div>
      </div>
    `).join('');
  }
}
