export class PlatformSelector {
  constructor() {
    this.platforms = ['marrow', 'dams', 'prepladder'];
  }

  async loadSubjects(platform) {
    try {
      const response = await fetch(`/src/platforms/${platform}/subjects.json`);
      return await response.json();
    } catch (error) {
      console.error(`Error loading subjects for ${platform}:`, error);
      return [];
    }
  }

  render() {
    const container = document.createElement('div');
    container.className = 'platform-selector';

    this.platforms.forEach(platform => {
      const button = document.createElement('button');
      button.textContent = platform.toUpperCase();
      button.onclick = () => this.handlePlatformSelect(platform);
      container.appendChild(button);
    });

    return container;
  }

  handlePlatformSelect(platform) {
    const event = new CustomEvent('platformSelect', { detail: platform });
    document.dispatchEvent(event);
  }
}
