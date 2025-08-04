// AdaptoWeb Background Script
class AdaptoWebBackground {
  constructor() {
    this.defaultSettings = {
      enabled: true,
      layoutSimplification: true,
      languageSimplification: false,
      interactionGuidance: true,
      simplificationLevel: 2,
      fontSize: 16,
      lineSpacing: 1.5
    };
    this.init();
  }

  init() {
    chrome.runtime.onInstalled.addListener(() => {
      this.initializeSettings();
    });

    chrome.action.onClicked.addListener((tab) => {
      this.toggleExtension(tab);
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true;
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        this.injectContentScript(tabId);
      }
    });
  }

  async initializeSettings() {
    try {
      const stored = await chrome.storage.sync.get('adaptowebSettings');
      if (!stored.adaptowebSettings) {
        await chrome.storage.sync.set({
          adaptowebSettings: this.defaultSettings
        });
      }
    } catch (error) {
      console.error('AdaptoWeb: Failed to initialize settings:', error);
    }
  }

  async injectContentScript(tabId) {
    try {
      const settings = await this.getSettings();
      if (settings.enabled) {
        await chrome.scripting.executeScript({
          target: { tabId },
          func: this.initializeAdaptoWeb,
          args: [settings]
        });
      }
    } catch (error) {
      console.error('AdaptoWeb: Failed to inject content script:', error);
    }
  }

  initializeAdaptoWeb(settings) {
    if (window.adaptoWebInitialized) return;
    window.adaptoWebInitialized = true;
    
    // This function runs in the content script context
    if (typeof window.AdaptoWeb !== 'undefined') {
      window.AdaptoWeb.updateSettings(settings);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'getSettings':
        const settings = await this.getSettings();
        sendResponse(settings);
        break;
      
      case 'updateSettings':
        await this.updateSettings(message.settings);
        await this.broadcastSettingsUpdate(message.settings);
        sendResponse({ success: true });
        break;
      
      case 'toggleModule':
        await this.toggleModule(message.module, message.enabled);
        sendResponse({ success: true });
        break;
    }
  }

  async getSettings() {
    try {
      const result = await chrome.storage.sync.get('adaptowebSettings');
      return result.adaptowebSettings || this.defaultSettings;
    } catch (error) {
      console.error('AdaptoWeb: Failed to get settings:', error);
      return this.defaultSettings;
    }
  }

  async updateSettings(newSettings) {
    try {
      await chrome.storage.sync.set({
        adaptowebSettings: { ...this.defaultSettings, ...newSettings }
      });
    } catch (error) {
      console.error('AdaptoWeb: Failed to update settings:', error);
    }
  }

  async toggleModule(module, enabled) {
    const settings = await this.getSettings();
    settings[module] = enabled;
    await this.updateSettings(settings);
    await this.broadcastSettingsUpdate(settings);
  }

  async broadcastSettingsUpdate(settings) {
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (!tab.url.startsWith('chrome://')) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'settingsUpdated',
            settings
          }).catch(() => {
            // Tab might not have content script loaded
          });
        }
      }
    } catch (error) {
      console.error('AdaptoWeb: Failed to broadcast settings:', error);
    }
  }

  async toggleExtension(tab) {
    const settings = await this.getSettings();
    settings.enabled = !settings.enabled;
    await this.updateSettings(settings);
    await this.broadcastSettingsUpdate(settings);
  }
}

// Initialize background script
new AdaptoWebBackground();