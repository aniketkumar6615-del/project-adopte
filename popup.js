// AdaptoWeb Popup Script
class AdaptoWebPopup {
  constructor() {
    this.settings = {
      enabled: true,
      layoutSimplification: true,
      languageSimplification: false,
      interactionGuidance: true,
      simplificationLevel: 2,
      fontSize: 16,
      lineSpacing: 1.5
    };
    
    this.elements = {};
    this.isUpdating = false;
    
    this.init();
  }

  async init() {
    this.cacheElements();
    this.attachEventListeners();
    await this.loadSettings();
    this.updateUI();
    this.updateStatus();
  }

  cacheElements() {
    this.elements = {
      statusDot: document.getElementById('statusDot'),
      statusText: document.getElementById('statusText'),
      masterToggle: document.getElementById('masterToggle'),
      modulesSection: document.getElementById('modulesSection'),
      layoutToggle: document.getElementById('layoutToggle'),
      languageToggle: document.getElementById('languageToggle'),
      languageSettings: document.getElementById('languageSettings'),
      interactionToggle: document.getElementById('interactionToggle'),
      simplificationLevel: document.getElementById('simplificationLevel'),
      simplificationValue: document.getElementById('simplificationValue'),
      fontSize: document.getElementById('fontSize'),
      fontSizeValue: document.getElementById('fontSizeValue'),
      lineSpacing: document.getElementById('lineSpacing'),
      lineSpacingValue: document.getElementById('lineSpacingValue'),
      helpButton: document.getElementById('helpButton'),
      personalizationSection: document.querySelector('.personalization-section')
    };
  }

  attachEventListeners() {
    // Master toggle
    this.elements.masterToggle.addEventListener('change', (e) => {
      this.updateSetting('enabled', e.target.checked);
    });

    // Module toggles
    this.elements.layoutToggle.addEventListener('change', (e) => {
      this.updateSetting('layoutSimplification', e.target.checked);
    });

    this.elements.languageToggle.addEventListener('change', (e) => {
      this.updateSetting('languageSimplification', e.target.checked);
      this.toggleLanguageSettings(e.target.checked);
    });

    this.elements.interactionToggle.addEventListener('change', (e) => {
      this.updateSetting('interactionGuidance', e.target.checked);
    });

    // Sliders
    this.elements.simplificationLevel.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.elements.simplificationValue.textContent = value;
      this.updateSetting('simplificationLevel', value);
    });

    this.elements.fontSize.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.elements.fontSizeValue.textContent = value;
      this.updateSetting('fontSize', value);
    });

    this.elements.lineSpacing.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      this.elements.lineSpacingValue.textContent = value;
      this.updateSetting('lineSpacing', value);
    });

    // Help button
    this.elements.helpButton.addEventListener('click', () => {
      this.openHelpPage();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.close();
      }
    });
  }

  async loadSettings() {
    try {
      const response = await this.sendMessage({ type: 'getSettings' });
      if (response) {
        this.settings = { ...this.settings, ...response };
      }
    } catch (error) {
      console.error('AdaptoWeb Popup: Failed to load settings:', error);
    }
  }

  async updateSetting(key, value) {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    this.settings[key] = value;
    
    try {
      await this.sendMessage({
        type: 'updateSettings',
        settings: this.settings
      });
      
      this.updateStatus();
      this.showFeedback('Settings updated');
    } catch (error) {
      console.error('AdaptoWeb Popup: Failed to update setting:', error);
      this.showError('Failed to update settings');
    } finally {
      this.isUpdating = false;
    }
  }

  updateUI() {
    // Update toggles
    this.elements.masterToggle.checked = this.settings.enabled;
    this.elements.layoutToggle.checked = this.settings.layoutSimplification;
    this.elements.languageToggle.checked = this.settings.languageSimplification;
    this.elements.interactionToggle.checked = this.settings.interactionGuidance;

    // Update sliders
    this.elements.simplificationLevel.value = this.settings.simplificationLevel;
    this.elements.simplificationValue.textContent = this.settings.simplificationLevel;
    this.elements.fontSize.value = this.settings.fontSize;
    this.elements.fontSizeValue.textContent = this.settings.fontSize;
    this.elements.lineSpacing.value = this.settings.lineSpacing;
    this.elements.lineSpacingValue.textContent = this.settings.lineSpacing;

    // Update sections visibility
    this.toggleModulesSection(this.settings.enabled);
    this.toggleLanguageSettings(this.settings.languageSimplification);
    this.togglePersonalizationSection(this.settings.enabled);
  }

  updateStatus() {
    const isEnabled = this.settings.enabled;
    const activeModules = [
      this.settings.layoutSimplification,
      this.settings.languageSimplification,
      this.settings.interactionGuidance
    ].filter(Boolean).length;

    if (isEnabled && activeModules > 0) {
      this.elements.statusDot.className = 'status-dot';
      this.elements.statusText.textContent = `Active (${activeModules} modules)`;
    } else if (isEnabled) {
      this.elements.statusDot.className = 'status-dot disabled';
      this.elements.statusText.textContent = 'Enabled (no modules)';
    } else {
      this.elements.statusDot.className = 'status-dot disabled';
      this.elements.statusText.textContent = 'Disabled';
    }
  }

  toggleModulesSection(enabled) {
    if (enabled) {
      this.elements.modulesSection.classList.remove('disabled');
    } else {
      this.elements.modulesSection.classList.add('disabled');
    }
  }

  toggleLanguageSettings(enabled) {
    if (enabled) {
      this.elements.languageSettings.classList.add('active');
    } else {
      this.elements.languageSettings.classList.remove('active');
    }
  }

  togglePersonalizationSection(enabled) {
    if (enabled) {
      this.elements.personalizationSection.classList.remove('disabled');
    } else {
      this.elements.personalizationSection.classList.add('disabled');
    }
  }

  showFeedback(message) {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message';
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #16a34a;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 2000);
  }

  showError(message) {
    const feedback = document.createElement('div');
    feedback.className = 'error-message';
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 3000);
  }

  openHelpPage() {
    const helpContent = `
      <h2>AdaptoWeb Help</h2>
      <h3>Layout Simplification</h3>
      <p>Removes distracting elements like ads, sidebars, and pop-ups. Applies clean, readable formatting to the main content.</p>
      
      <h3>Language Simplification</h3>
      <p>Uses AI to simplify complex text while preserving meaning. Hover over simplified text to see the original.</p>
      
      <h3>Interaction Guidance</h3>
      <p>Provides step-by-step help for complex forms and multi-step processes. Look for the "Step-by-step help" button near forms.</p>
      
      <h3>Personalization</h3>
      <p>Adjust font size and line spacing to match your reading preferences.</p>
      
      <h3>Privacy</h3>
      <p>All processing happens locally in your browser. No data is sent to external servers.</p>
      
      <h3>Support</h3>
      <p>For technical support or feature requests, please visit our GitHub repository or contact support.</p>
    `;

    // Create help modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 500px;
      max-height: 80%;
      overflow-y: auto;
      position: relative;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 12px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    `;

    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    content.innerHTML = helpContent;
    content.appendChild(closeButton);
    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize popup when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AdaptoWebPopup();
  });
} else {
  new AdaptoWebPopup();
}