// UserScripts Configuration
const userScripts = [
    {
        name: 'Reading Mode',
        match: ['*://example.com/*', '*://*.example.com/*'],
        description: 'Adds a reading mode button that simplifies the page layout',
        enabled: true,
        code: function() {
            // Create the reading mode button
            const readingButton = document.createElement('button');
            readingButton.innerHTML = '📖';
            readingButton.style.cssText = `
                position: fixed;
                bottom: 70px;
                right: 20px;
                z-index: 9999;
                padding: 10px;
                border-radius: 50%;
                border: none;
                background: #2196f3;
                color: white;
                cursor: pointer;
                width: 40px;
                height: 40px;
                font-size: 20px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
            `;

            // Add hover effect
            readingButton.onmouseover = () => readingButton.style.transform = 'scale(1.1)';
            readingButton.onmouseout = () => readingButton.style.transform = 'scale(1)';

            // Add the button to the page
            document.body.appendChild(readingButton);

            // Create stylesheet for reading mode
            const readingModeStyles = document.createElement('style');
            readingModeStyles.innerHTML = `
                body.reading-mode {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                body.reading-mode > * {
                    display: none !important;
                }
                body.reading-mode article,
                body.reading-mode main,
                body.reading-mode .content,
                body.reading-mode [role="main"] {
                    display: block !important;
                    width: 90% !important;
                    max-width: 800px !important;
                    margin: 0 auto !important;
                    padding: 20px !important;
                    font-size: 18px !important;
                    line-height: 1.6 !important;
                }
                body.reading-mode img {
                    max-width: 100% !important;
                    height: auto !important;
                    margin: 20px auto !important;
                    display: block !important;
                }
                body.reading-mode h1, 
                body.reading-mode h2, 
                body.reading-mode h3 {
                    margin: 1.5em 0 0.5em 0 !important;
                }
                body.reading-mode p {
                    margin: 1em 0 !important;
                }
            `;
            document.head.appendChild(readingModeStyles);

            // Listen for dark mode changes
            document.addEventListener('darkModeChanged', (e) => {
                if (e.detail.enabled) {
                    readingModeStyles.innerHTML += `
                        body.reading-mode {
                            background-color: #1a1a1a !important;
                            color: #ffffff !important;
                        }
                    `;
                }
            });

            // Toggle reading mode
            let isReadingMode = false;
            
            function toggleReadingMode() {
                isReadingMode = !isReadingMode;
                document.body.classList.toggle('reading-mode', isReadingMode);
                readingButton.style.background = isReadingMode ? '#4CAF50' : '#2196f3';
                
                // Save state
                localStorage.setItem('readingMode', isReadingMode);
                
                // Notify other scripts
                document.dispatchEvent(new CustomEvent('readingModeChanged', {
                    detail: { enabled: isReadingMode }
                }));
            }

            // Restore previous state
            if (localStorage.getItem('readingMode') === 'true') {
                toggleReadingMode();
            }

            // Add click handler
            readingButton.addEventListener('click', toggleReadingMode);
        }
    },
    {
        name: 'Auto Scroll',
        match: ['*://example.com/*'],
        description: 'Adds an auto-scroll feature with speed control',
        enabled: true,
        code: function() {
            // Create the control panel
            const controlPanel = document.createElement('div');
            controlPanel.style.cssText = `
                position: fixed;
                bottom: 120px;
                right: 20px;
                z-index: 9999;
                background: white;
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                gap: 5px;
                transition: all 0.3s ease;
            `;

            // Add controls
            const playButton = document.createElement('button');
            playButton.innerHTML = '▶️';
            playButton.style.cssText = `
                border: none;
                background: #2196f3;
                color: white;
                cursor: pointer;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 20px;
            `;

            const speedControl = document.createElement('input');
            speedControl.type = 'range';
            speedControl.min = '1';
            speedControl.max = '10';
            speedControl.value = localStorage.getItem('autoScrollSpeed') || '5';
            speedControl.style.width = '100px';

            controlPanel.appendChild(playButton);
            controlPanel.appendChild(speedControl);
            document.body.appendChild(controlPanel);

            // Listen for dark mode changes
            document.addEventListener('darkModeChanged', (e) => {
                controlPanel.style.backgroundColor = e.detail.enabled ? '#333' : 'white';
                speedControl.style.backgroundColor = e.detail.enabled ? '#444' : '#ddd';
            });

            // Listen for reading mode changes
            document.addEventListener('readingModeChanged', (e) => {
                if (e.detail.enabled && isScrolling) {
                    toggleScroll(); // Stop scrolling in reading mode
                }
            });

            // Auto scroll functionality
            let isScrolling = false;
            let scrollInterval;

            function toggleScroll() {
                isScrolling = !isScrolling;
                playButton.innerHTML = isScrolling ? '⏸️' : '▶️';
                
                if (isScrolling) {
                    scrollInterval = setInterval(() => {
                        window.scrollBy(0, speedControl.value);
                    }, 50);
                } else {
                    clearInterval(scrollInterval);
                }

                // Save state
                localStorage.setItem('autoScrolling', isScrolling);
            }

            // Add event listeners
            playButton.addEventListener('click', toggleScroll);
            speedControl.addEventListener('input', () => {
                localStorage.setItem('autoScrollSpeed', speedControl.value);
                if (isScrolling) {
                    clearInterval(scrollInterval);
                    scrollInterval = setInterval(() => {
                        window.scrollBy(0, speedControl.value);
                    }, 50);
                }
            });

            // Restore previous state
            if (localStorage.getItem('autoScrolling') === 'true') {
                toggleScroll();
            }
        }
    }
];

// UserScript Injection System
class UserScriptManager {
    constructor() {
        this.scripts = userScripts;
    }

    matchUrl(pattern, url) {
        const regex = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '\\?');
        return new RegExp(`^${regex}$`).test(url);
    }

    shouldRunOnUrl(script, url) {
        return script.match.some(pattern => this.matchUrl(pattern, url));
    }

    async injectScripts(iframe) {
        try {
            const url = iframe.src;
            const enabledScripts = this.scripts.filter(script => 
                script.enabled && this.shouldRunOnUrl(script, url)
            );

            for (const script of enabledScripts) {
                try {
                    // Wait for iframe to load
                    await new Promise(resolve => {
                        if (iframe.contentDocument.readyState === 'complete') {
                            resolve();
                        } else {
                            iframe.onload = resolve;
                        }
                    });

                    // Create a script element
                    const scriptElement = iframe.contentDocument.createElement('script');
                    scriptElement.textContent = `(${script.code.toString()})();`;
                    
                    // Inject the script
                    iframe.contentDocument.body.appendChild(scriptElement);
                    console.log(`Injected script: ${script.name}`);
                } catch (err) {
                    console.error(`Error injecting script ${script.name}:`, err);
                }
            }
        } catch (err) {
            console.error('Error in script injection:', err);
        }
    }
}

// Export the manager
window.userScriptManager = new UserScriptManager();
