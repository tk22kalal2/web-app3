export class SubjectList {
  constructor() {
    this.subjects = [
      'Anatomy', 'Physiology', 'Biochemistry', 'Pathology',
      'Microbiology', 'Pharmacology', 'Forensic Medicine',
      'ENT', 'Ophthalmology', 'Community Medicine',
      'Medicine', 'Surgery', 'Obstetrics', 'Gynecology',
      'Pediatrics', 'Orthopedics', 'Radiology',
      'Anesthesia', 'Psychiatry'
    ];
  }

  async loadLectures(platform, subject) {
    try {
      const response = await fetch(`/src/platforms/${platform}/subjects/${subject.toLowerCase()}.json`);
      return await response.json();
    } catch (error) {
      console.error(`Error loading lectures for ${subject}:`, error);
      return [];
    }
  }

  render(selectedPlatform) {
    const container = document.createElement('div');
    container.className = 'subject-list';

    this.subjects.forEach(subject => {
      const subjectCard = document.createElement('div');
      subjectCard.className = 'subject-card';
      subjectCard.textContent = subject;
      subjectCard.onclick = () => this.handleSubjectSelect(selectedPlatform, subject);
      container.appendChild(subjectCard);
    });

    return container;
  }

  handleSubjectSelect(platform, subject) {
    const event = new CustomEvent('subjectSelect', {
      detail: { platform, subject }
    });
    document.dispatchEvent(event);
  }
}
