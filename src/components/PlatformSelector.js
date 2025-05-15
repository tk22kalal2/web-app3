export class PlatformSelector {
  constructor() {
    this.platforms = [
      {
        name: 'marrow',
        icon: 'fas fa-brain',
        description: 'Comprehensive NEET-PG Preparation'
      },
      {
        name: 'dams',
        icon: 'fas fa-graduation-cap',
        description: 'Expert-led Medical Education'
      },
      {
        name: 'prepladder',
        icon: 'fas fa-laptop-medical',
        description: 'Smart NEET-PG Learning'
      }
    ];
  }

  render() {
    const container = document.createElement('div');
    container.className = 'platform-selector';

    this.platforms.forEach(platform => {
      const button = document.createElement('button');
      button.innerHTML = `
        <i class="${platform.icon}"></i>
        <span class="platform-name">${platform.name.toUpperCase()}</span>
        <span class="platform-description">${platform.description}</span>
      `;
      button.onclick = () => this.handlePlatformSelect(platform.name);
      container.appendChild(button);
    });

    return container;
  }

  handlePlatformSelect(platform) {
    const event = new CustomEvent('platformSelect', { detail: platform });    
    document.dispatchEvent(event);
  }
}
