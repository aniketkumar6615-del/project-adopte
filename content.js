// AdaptoWeb Content Script
class AdaptoWeb {
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
    
    this.modules = new Map();
    this.isInitialized = false;
    this.observer = null;
    
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Get settings from background
      const settings = await this.getSettings();
      this.settings = settings;
      
      // Initialize modules
      this.initializeModules();
      
      // Setup message listener
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
      });
      
      // Setup mutation observer for dynamic content
      this.setupMutationObserver();
      
      // Apply initial adaptations if enabled
      if (this.settings.enabled) {
        this.applyAdaptations();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('AdaptoWeb: Initialization failed:', error);
    }
  }

  initializeModules() {
    this.modules.set('layoutSimplification', new LayoutSimplificationModule(this));
    this.modules.set('languageSimplification', new LanguageSimplificationModule(this));
    this.modules.set('interactionGuidance', new InteractionGuidanceModule(this));
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'getSettings' }, (response) => {
        resolve(response || this.settings);
      });
    });
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'settingsUpdated':
        this.updateSettings(message.settings);
        break;
    }
  }

  updateSettings(newSettings) {
    const oldSettings = { ...this.settings };
    this.settings = newSettings;
    
    if (oldSettings.enabled !== newSettings.enabled) {
      if (newSettings.enabled) {
        this.applyAdaptations();
      } else {
        this.removeAdaptations();
      }
    } else if (newSettings.enabled) {
      // Update individual modules
      this.modules.forEach((module, name) => {
        if (oldSettings[name] !== newSettings[name]) {
          if (newSettings[name]) {
            module.apply();
          } else {
            module.remove();
          }
        }
      });
    }
  }

  applyAdaptations() {
    this.modules.forEach((module, name) => {
      if (this.settings[name]) {
        module.apply();
      }
    });
  }

  removeAdaptations() {
    this.modules.forEach(module => module.remove());
  }

  setupMutationObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      if (!this.settings.enabled) return;
      
      let shouldReapply = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              shouldReapply = true;
            }
          });
        }
      });
      
      if (shouldReapply) {
        this.debounce(() => this.applyAdaptations(), 500);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
  }

  debounce(func, wait) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(func, wait);
  }
}

// Layout Simplification Module
class LayoutSimplificationModule {
  constructor(adaptoWeb) {
    this.adaptoWeb = adaptoWeb;
    this.removedElements = new Set();
    this.originalStyles = new Map();
    this.mainContentContainer = null;
  }

  apply() {
    this.identifyMainContent();
    this.removeDistractions();
    this.applyCleanLayout();
  }

  identifyMainContent() {
    const candidates = [
      'main',
      'article',
      '.main-content',
      '.content',
      '#main',
      '#content',
      '[role="main"]'
    ];

    let bestCandidate = null;
    let bestScore = 0;

    candidates.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const score = this.scoreContentElement(element);
        if (score > bestScore) {
          bestScore = score;
          bestCandidate = element;
        }
      });
    });

    // Fallback: find element with most text content
    if (!bestCandidate) {
      const allElements = document.querySelectorAll('div, section, article');
      allElements.forEach(element => {
        const score = this.scoreContentElement(element);
        if (score > bestScore) {
          bestScore = score;
          bestCandidate = element;
        }
      });
    }

    this.mainContentContainer = bestCandidate;
  }

  scoreContentElement(element) {
    if (!element || !element.textContent) return 0;
    
    let score = 0;
    const textLength = element.textContent.trim().length;
    const childElements = element.children.length;
    
    // Text density score
    score += textLength / 10;
    
    // Semantic HTML bonus
    const tagName = element.tagName.toLowerCase();
    if (['main', 'article', 'section'].includes(tagName)) {
      score += 100;
    }
    
    // Class/ID bonus
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    if (className.includes('content') || className.includes('main') ||
        id.includes('content') || id.includes('main')) {
      score += 50;
    }
    
    // Penalty for too many nested elements (likely navigation/sidebar)
    if (childElements > 20) {
      score -= 20;
    }
    
    return score;
  }

  removeDistractions() {
    const distractionSelectors = [
      'aside',
      '.sidebar',
      '.navigation',
      '.nav',
      '.advertisement',
      '.ads',
      '.social-share',
      '.social-media',
      '.popup',
      '.modal',
      '.overlay',
      '[class*="ad-"]',
      '[id*="ad-"]',
      'video[autoplay]',
      '.comments'
    ];

    distractionSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.mainContentContainer && this.mainContentContainer.contains(element)) {
          return; // Don't remove if it's inside main content
        }
        
        this.hideElement(element);
      });
    });

    // Remove auto-playing videos
    const autoplayVideos = document.querySelectorAll('video[autoplay], audio[autoplay]');
    autoplayVideos.forEach(media => {
      media.pause();
      media.removeAttribute('autoplay');
    });
  }

  hideElement(element) {
    if (element && element.style) {
      this.originalStyles.set(element, {
        display: element.style.display,
        visibility: element.style.visibility
      });
      
      element.style.display = 'none';
      element.setAttribute('data-adaptoweb-hidden', 'true');
      this.removedElements.add(element);
    }
  }

  applyCleanLayout() {
    if (!this.mainContentContainer) return;
    
    // Apply clean styling to main content
    const styles = {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      lineHeight: this.adaptoWeb.settings.lineSpacing.toString(),
      fontSize: `${this.adaptoWeb.settings.fontSize}px`,
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff',
      color: '#333333'
    };

    Object.assign(this.mainContentContainer.style, styles);
    this.mainContentContainer.setAttribute('data-adaptoweb-styled', 'true');

    // Apply paragraph spacing
    const paragraphs = this.mainContentContainer.querySelectorAll('p');
    paragraphs.forEach(p => {
      p.style.marginBottom = '1.5em';
      p.style.lineHeight = this.adaptoWeb.settings.lineSpacing.toString();
    });

    // Apply heading styles
    const headings = this.mainContentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      heading.style.marginTop = '2em';
      heading.style.marginBottom = '1em';
      heading.style.lineHeight = '1.2';
    });
  }

  remove() {
    // Restore hidden elements
    this.removedElements.forEach(element => {
      if (element && this.originalStyles.has(element)) {
        const originalStyle = this.originalStyles.get(element);
        element.style.display = originalStyle.display;
        element.style.visibility = originalStyle.visibility;
        element.removeAttribute('data-adaptoweb-hidden');
      }
    });

    // Remove clean layout styles
    if (this.mainContentContainer) {
      this.mainContentContainer.removeAttribute('data-adaptoweb-styled');
      this.mainContentContainer.removeAttribute('style');
    }

    // Clear collections
    this.removedElements.clear();
    this.originalStyles.clear();
  }
}

// Language Simplification Module (Placeholder for NLP integration)
class LanguageSimplificationModule {
  constructor(adaptoWeb) {
    this.adaptoWeb = adaptoWeb;
    this.simplifiedElements = new Map();
  }

  apply() {
    // Note: This is a simplified version. In production, you would integrate
    // Transformers.js with a quantized model like SimpleBART or T5
    this.simplifyText();
  }

  simplifyText() {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    
    textElements.forEach(element => {
      if (element.getAttribute('data-adaptoweb-simplified')) return;
      
      const originalText = element.textContent.trim();
      if (originalText.length < 50) return; // Skip short text
      
      const simplifiedText = this.basicSimplification(originalText);
      
      if (simplifiedText !== originalText) {
        element.setAttribute('data-original-text', originalText);
        element.textContent = simplifiedText;
        element.setAttribute('data-adaptoweb-simplified', 'true');
        element.style.cursor = 'help';
        
        element.addEventListener('mouseenter', this.showOriginalText.bind(this));
        element.addEventListener('mouseleave', this.hideOriginalText.bind(this));
        
        this.simplifiedElements.set(element, originalText);
      }
    });
  }

  basicSimplification(text) {
    // Basic simplification rules (placeholder for advanced NLP)
    let simplified = text
      .replace(/\b(?:furthermore|moreover|additionally|consequently)\b/gi, 'Also')
      .replace(/\b(?:utilize|utilization)\b/gi, 'use')
      .replace(/\b(?:approximately|roughly)\b/gi, 'about')
      .replace(/\b(?:demonstrate|illustrate)\b/gi, 'show')
      .replace(/\b(?:numerous|multiple)\b/gi, 'many')
      .replace(/\b(?:significant|substantial)\b/gi, 'big')
      .replace(/\b(?:implement|execute)\b/gi, 'do')
      .replace(/\b(?:purchase|acquire)\b/gi, 'buy');

    // Split long sentences
    simplified = simplified.replace(/([.!?])\s+/g, '$1\n');
    
    return simplified;
  }

  showOriginalText(event) {
    const element = event.target;
    const originalText = element.getAttribute('data-original-text');
    
    if (originalText) {
      const tooltip = document.createElement('div');
      tooltip.className = 'adaptoweb-tooltip';
      tooltip.textContent = originalText;
      tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        max-width: 300px;
        z-index: 10000;
        pointer-events: none;
      `;
      
      const rect = element.getBoundingClientRect();
      tooltip.style.left = rect.left + 'px';
      tooltip.style.top = (rect.bottom + 5) + 'px';
      
      document.body.appendChild(tooltip);
      element._tooltip = tooltip;
    }
  }

  hideOriginalText(event) {
    const element = event.target;
    if (element._tooltip) {
      document.body.removeChild(element._tooltip);
      element._tooltip = null;
    }
  }

  remove() {
    this.simplifiedElements.forEach((originalText, element) => {
      element.textContent = originalText;
      element.removeAttribute('data-adaptoweb-simplified');
      element.removeAttribute('data-original-text');
      element.style.cursor = '';
    });
    
    this.simplifiedElements.clear();
  }
}

// Interaction Guidance Module
class InteractionGuidanceModule {
  constructor(adaptoWeb) {
    this.adaptoWeb = adaptoWeb;
    this.guidedForms = new Set();
    this.overlays = [];
  }

  apply() {
    this.detectComplexForms();
    this.addFormGuidance();
  }

  detectComplexForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      if (inputs.length >= 5) { // Consider forms with 5+ inputs as complex
        this.addProgressiveDisclosure(form);
      }
    });
  }

  addFormGuidance() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      if (form.getAttribute('data-adaptoweb-guided')) return;
      
      const submitButton = form.querySelector('input[type="submit"], button[type="submit"], button:not([type])');
      if (submitButton) {
        this.highlightSubmitButton(submitButton);
      }
      
      form.setAttribute('data-adaptoweb-guided', 'true');
      this.guidedForms.add(form);
    });
  }

  addProgressiveDisclosure(form) {
    const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
    if (inputs.length < 5) return;
    
    // Group inputs into steps
    const steps = this.groupInputsIntoSteps(inputs);
    if (steps.length <= 1) return;
    
    // Create overlay
    const overlay = this.createFormOverlay(form, steps);
    this.overlays.push(overlay);
  }

  groupInputsIntoSteps(inputs) {
    const steps = [];
    let currentStep = [];
    
    inputs.forEach((input, index) => {
      currentStep.push(input);
      
      // Create new step every 3 inputs or at fieldset boundaries
      if (currentStep.length >= 3 || 
          input.closest('fieldset') !== inputs[index + 1]?.closest('fieldset')) {
        steps.push([...currentStep]);
        currentStep = [];
      }
    });
    
    if (currentStep.length > 0) {
      steps.push(currentStep);
    }
    
    return steps;
  }

  createFormOverlay(form, steps) {
    const overlay = document.createElement('div');
    overlay.className = 'adaptoweb-form-overlay';
    overlay.style.cssText = `
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
    
    const modal = document.createElement('div');
    modal.className = 'adaptoweb-form-modal';
    modal.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 80%;
      overflow-y: auto;
    `;
    
    let currentStepIndex = 0;
    
    const renderStep = () => {
      modal.innerHTML = '';
      
      // Progress indicator
      const progress = document.createElement('div');
      progress.innerHTML = `
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Step ${currentStepIndex + 1} of ${steps.length}</span>
            <button id="adaptoweb-close" style="background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
          </div>
          <div style="width: 100%; height: 4px; background: #e5e7eb; border-radius: 2px;">
            <div style="width: ${((currentStepIndex + 1) / steps.length) * 100}%; height: 100%; background: #2563eb; border-radius: 2px;"></div>
          </div>
        </div>
      `;
      modal.appendChild(progress);
      
      // Current step fields
      const stepContainer = document.createElement('div');
      stepContainer.innerHTML = `<h3 style="margin-bottom: 16px;">Complete these fields:</h3>`;
      
      steps[currentStepIndex].forEach(input => {
        const fieldContainer = document.createElement('div');
        fieldContainer.style.marginBottom = '16px';
        
        const label = form.querySelector(`label[for="${input.id}"]`) || 
                     input.closest('label') ||
                     input.previousElementSibling;
        
        if (label && label.tagName === 'LABEL') {
          const labelClone = label.cloneNode(true);
          labelClone.style.display = 'block';
          labelClone.style.marginBottom = '4px';
          fieldContainer.appendChild(labelClone);
        }
        
        const inputClone = input.cloneNode(true);
        inputClone.style.cssText = `
          width: 100%;
          padding: 8px 12px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          font-size: 16px;
        `;
        
        // Sync values
        inputClone.value = input.value;
        inputClone.addEventListener('input', () => {
          input.value = inputClone.value;
        });
        
        fieldContainer.appendChild(inputClone);
        stepContainer.appendChild(fieldContainer);
      });
      
      modal.appendChild(stepContainer);
      
      // Navigation buttons
      const navigation = document.createElement('div');
      navigation.style.cssText = `
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-top: 24px;
      `;
      
      if (currentStepIndex > 0) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.style.cssText = `
          padding: 12px 24px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `;
        prevButton.addEventListener('click', () => {
          currentStepIndex--;
          renderStep();
        });
        navigation.appendChild(prevButton);
      } else {
        navigation.appendChild(document.createElement('div'));
      }
      
      if (currentStepIndex < steps.length - 1) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.style.cssText = `
          padding: 12px 24px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `;
        nextButton.addEventListener('click', () => {
          currentStepIndex++;
          renderStep();
        });
        navigation.appendChild(nextButton);
      } else {
        const finishButton = document.createElement('button');
        finishButton.textContent = 'Finish';
        finishButton.style.cssText = `
          padding: 12px 24px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `;
        finishButton.addEventListener('click', () => {
          overlay.remove();
        });
        navigation.appendChild(finishButton);
      }
      
      modal.appendChild(navigation);
      
      // Close button handler
      modal.querySelector('#adaptoweb-close').addEventListener('click', () => {
        overlay.remove();
      });
    };
    
    renderStep();
    overlay.appendChild(modal);
    
    // Add form guidance trigger
    const triggerButton = document.createElement('button');
    triggerButton.textContent = '📋 Step-by-step help';
    triggerButton.type = 'button';
    triggerButton.style.cssText = `
      position: absolute;
      top: -40px;
      right: 0;
      padding: 8px 16px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      z-index: 1000;
    `;
    
    triggerButton.addEventListener('click', () => {
      document.body.appendChild(overlay);
    });
    
    // Position form relatively and add trigger
    form.style.position = 'relative';
    form.appendChild(triggerButton);
    
    return overlay;
  }

  highlightSubmitButton(button) {
    button.style.cssText += `
      background: #16a34a !important;
      color: white !important;
      border: 2px solid #15803d !important;
      padding: 12px 24px !important;
      font-size: 16px !important;
      font-weight: bold !important;
      border-radius: 4px !important;
      cursor: pointer !important;
    `;
    
    button.setAttribute('data-adaptoweb-highlighted', 'true');
  }

  remove() {
    // Remove overlays
    this.overlays.forEach(overlay => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });
    
    // Remove form guidance
    this.guidedForms.forEach(form => {
      form.removeAttribute('data-adaptoweb-guided');
      
      // Remove trigger buttons
      const triggers = form.querySelectorAll('[data-adaptoweb-trigger]');
      triggers.forEach(trigger => trigger.remove());
      
      // Reset submit buttons
      const highlightedButtons = form.querySelectorAll('[data-adaptoweb-highlighted]');
      highlightedButtons.forEach(button => {
        button.removeAttribute('data-adaptoweb-highlighted');
        button.removeAttribute('style');
      });
    });
    
    this.overlays = [];
    this.guidedForms.clear();
  }
}

// Initialize AdaptoWeb when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.AdaptoWeb = new AdaptoWeb();
  });
} else {
  window.AdaptoWeb = new AdaptoWeb();
}