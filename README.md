# AdaptoWeb Browser Extension

AdaptoWeb is a comprehensive browser extension designed to provide real-time adaptive web interfaces for users with cognitive and learning disabilities (CLDs), including ADHD and dyslexia. The extension transforms standard webpages on the client side to reduce cognitive load, improve task efficiency, and enhance user autonomy.

## 🎯 Key Features

### Layout Simplification
- **Content Extraction**: Automatically identifies and extracts main content using DOM traversal and scoring heuristics
- **Distraction Removal**: Removes or hides advertisements, sidebars, pop-ups, auto-playing videos, and social media widgets
- **Clean Formatting**: Applies single-column layout with increased font size and line spacing for improved readability

### Language Simplification
- **AI-Powered Text Simplification**: Uses client-side NLP models to simplify sentence structure and vocabulary while preserving meaning
- **Original Text Preservation**: Maintains original text in data attributes with hover tooltips for reference
- **Adaptive Processing**: Processes text nodes in real-time as content loads

### Interaction Guidance
- **Complex Form Detection**: Identifies multi-step forms and complex interactions
- **Progressive Disclosure**: Groups related form fields into logical steps with guided navigation
- **Step-by-Step Instructions**: Provides clear, sequential guidance through complex processes

## 🏗️ System Architecture

### Extension Components
- **Manifest V3**: Modern Chrome extension structure with service worker
- **Background Script**: Handles global state management and cross-tab communication
- **Content Scripts**: Injected into web pages for DOM manipulation and adaptation logic
- **Popup Interface**: Minimal control interface for toggling modules and settings

### Modular Design
- **Independent Modules**: Each adaptation feature can be enabled/disabled individually
- **Real-time Processing**: All adaptations happen instantly without page reloads
- **Privacy-First**: Complete client-side processing with no external server communication

## ⚙️ Installation & Setup

### Development Setup
1. Clone or download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The AdaptoWeb icon should appear in your browser toolbar

### Production Installation
1. Download from Chrome Web Store (when available)
2. Click "Add to Chrome" and confirm permissions
3. Access settings through the extension icon in the toolbar

## 🎛️ Usage Guide

### Getting Started
1. Click the AdaptoWeb icon in your browser toolbar
2. Toggle the master switch to enable the extension
3. Configure individual modules based on your needs
4. Adjust personalization settings (font size, line spacing)

### Module Configuration

#### Layout Simplification
- **Purpose**: Removes visual distractions and applies clean formatting
- **Best For**: Users with ADHD or attention difficulties
- **Effect**: Cleaner, more focused reading experience

#### Language Simplification
- **Purpose**: Simplifies complex text while preserving meaning
- **Best For**: Users with dyslexia or reading comprehension challenges
- **Features**: Hover to see original text, adjustable simplification levels

#### Interaction Guidance
- **Purpose**: Provides step-by-step help for complex forms
- **Best For**: Users who struggle with multi-step processes
- **Features**: Progressive disclosure, visual guidance, form breakdown

### Personalization Options
- **Font Size**: Adjust from 12px to 24px for optimal readability
- **Line Spacing**: Configure from 1.0x to 2.5x for comfortable reading
- **Simplification Level**: Choose from Basic, Moderate, or Advanced text simplification

## 🔒 Privacy & Security

### Client-Side Processing
- All adaptations happen locally in your browser
- No data is transmitted to external servers
- No tracking or analytics collection

### Permissions Explained
- **activeTab**: Access current tab for content adaptation
- **storage**: Save your preferences locally
- **scripting**: Inject adaptation scripts into web pages
- **host_permissions**: Apply adaptations across all websites

## 🛠️ Technical Details

### Browser Compatibility
- Chrome 88+ (Manifest V3 support required)
- Microsoft Edge 88+
- Other Chromium-based browsers

### Performance Optimization
- Lazy loading of adaptation modules
- Debounced DOM observation for efficiency
- Minimal memory footprint
- Non-blocking script execution

### Accessibility Standards
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences

## 🔧 Advanced Configuration

### Custom Simplification Rules
The language simplification module uses configurable rules for text transformation:
- Complex word replacement
- Sentence structure simplification
- Technical term explanations
- Context-aware processing

### Form Detection Heuristics
The interaction guidance system uses sophisticated algorithms to identify complex forms:
- Field count analysis
- Interaction complexity scoring
- Fieldset grouping detection
- Multi-step process identification

## 🚀 Future Enhancements

### Planned Features
- **Machine Learning Personalization**: Learn from user preferences over time
- **Mobile Browser Support**: Extend functionality to mobile platforms
- **Advanced NLP Models**: Integration with more sophisticated language models
- **Collaborative Filtering**: Community-driven improvement suggestions

### Roadmap
- **v1.1**: Enhanced language models with Transformers.js integration
- **v1.2**: Mobile browser compatibility
- **v1.3**: Machine learning-based personalization
- **v2.0**: Advanced accessibility features and integrations

## 🤝 Contributing

### Development Guidelines
1. Follow modular architecture principles
2. Maintain privacy-first approach
3. Ensure accessibility compliance
4. Test across different websites and use cases

### Bug Reports
- Use GitHub issues for bug reports
- Include browser version and extension version
- Provide steps to reproduce issues
- Include screenshots when relevant

### Feature Requests
- Suggest improvements through GitHub discussions
- Consider impact on different user groups
- Provide use case examples
- Consider technical feasibility

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

### Getting Help
- Check the built-in help system (click the help button in the extension popup)
- Review the FAQ section
- Submit issues through GitHub
- Contact the development team

### Accessibility Support
AdaptoWeb is committed to digital accessibility. If you encounter accessibility barriers while using this extension, please contact our support team for assistance.

---

**AdaptoWeb** - Empowering accessible web experiences for everyone.