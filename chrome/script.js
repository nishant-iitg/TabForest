// Initialize trees planted ratio (100 tabs = 1 tree)
const TABS_PER_TREE = 100;
// Initialize funds collected ratio (100 tabs = $1)
const TABS_PER_DOLLAR = 100;

// Default quick links
const DEFAULT_QUICK_LINKS = [
    { 
        label: 'Google', 
        url: 'https://www.google.com', 
        icon: 'icons/google.png' 
    },
    { 
        label: 'YouTube', 
        url: 'https://www.youtube.com', 
        icon: 'icons/youtube.png' 
    },
    { 
        label: 'Twitter', 
        url: 'https://www.twitter.com', 
        icon: 'icons/twitter.png' 
    },
    { 
        label: 'Reddit', 
        url: 'https://www.reddit.com', 
        icon: 'icons/reddit.png' 
    },
    { 
        label: 'GitHub', 
        url: 'https://www.github.com', 
        icon: 'icons/github.png' 
    },
    { 
        label: 'LinkedIn', 
        url: 'https://www.linkedin.com', 
        icon: 'icons/linkedin.png' 
    }
];

// Get elements
const tabsCountElement = document.getElementById('tabsCount');
const treesPlantedElement = document.getElementById('treesPlanted');
const fundsCollectedElement = document.getElementById('fundsCollected');
const totalTreesElement = document.getElementById('totalTrees');
const adImageElement = document.getElementById('adImage');
const adTitleElement = document.getElementById('adTitle');
const adLinkElement = document.getElementById('adLink');

// Function to display an ad
function displayAd(adData) {
    const adImageElement = document.getElementById('adImage');
    const adTitleElement = document.getElementById('adTitle');
    const adLinkElement = document.getElementById('adLink');
    
    if (adImageElement && adTitleElement && adLinkElement) {
        adImageElement.src = adData.image;
        adTitleElement.textContent = adData.title;
        adLinkElement.href = adData.url;
        
        // Add visible class for animation
        const adContainer = adImageElement.closest('.ad');
        if (adContainer) {
            adContainer.classList.add('visible');
        }
    } else {
        console.error('Ad elements not found in the DOM');
    }
}

// Function to update counters
function displayCounters(totalTabs, treesPlanted, fundsCollected, totalTrees) {
    if (tabsCountElement) tabsCountElement.textContent = totalTabs;
    if (treesPlantedElement) treesPlantedElement.textContent = treesPlanted;
    if (fundsCollectedElement) {
        fundsCollectedElement.textContent = `$${(fundsCollected / 100).toFixed(2)}`;
    }
    if (totalTreesElement) totalTreesElement.textContent = totalTrees;
}

// Function to create a quick link
function createQuickLink(label, url, type = 'default', icon = 'icons/link.png', index = null) {
    const link = document.createElement('div');
    link.className = `quick-link ${type}`;

    if (type === 'default') {
        link.innerHTML = `
            <img src="${chrome.runtime.getURL(icon)}" alt="${label} icon">
            <span>${label}</span>
            <button class="quick-link-x" title="Remove">&times;</button>
        `;
        // Main link click (excluding the X)
        link.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-link-x')) return;
            e.preventDefault();
            e.stopPropagation();
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.update(tabs[0].id, { url });
                }
            });
        });
        // X button click
        const xBtn = link.querySelector('.quick-link-x');
        if (xBtn) {
            xBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                chrome.storage.local.get('quickLinks', (result) => {
                    const links = result.quickLinks || DEFAULT_QUICK_LINKS;
                    if (index !== null && index >= 0 && index < links.length) {
                        links.splice(index, 1);
                        chrome.storage.local.set({ quickLinks: links });
                        loadQuickLinks();
                    }
                });
            });
        }
    } else if (type === 'add-link') {
        link.innerHTML = `
            <img src="${chrome.runtime.getURL('icons/plus.png')}" alt="Add">
            <span>Add Link</span>
        `;
        link.addEventListener('click', () => {
            let newLink = prompt('Enter the URL for the new link:');
            if (newLink) {
                // Prepend https:// if not present
                if (!/^https?:\/\//i.test(newLink)) {
                    newLink = 'https://' + newLink;
                }
                const newLabel = prompt('Enter a label for the new link:');
                const newIcon = prompt('Enter the icon filename (e.g., google.png):') || 'icons/link.png';
                if (newLabel) {
                    const newLinkObj = { label: newLabel, url: newLink, icon: newIcon };
                    chrome.storage.local.get('quickLinks', (result) => {
                        const links = result.quickLinks || DEFAULT_QUICK_LINKS;
                        links.push(newLinkObj);
                        chrome.storage.local.set({ quickLinks: links });
                        loadQuickLinks();
                    });
                }
            }
        });
    }
    return link;
}

// Function to load quick links
function loadQuickLinks() {
    const quickLinksContainer = document.getElementById('quickLinksContainer');
    if (!quickLinksContainer) return;
    quickLinksContainer.innerHTML = '';
    chrome.storage.local.get('quickLinks', (result) => {
        const links = result.quickLinks || DEFAULT_QUICK_LINKS;
        // Add default links with X buttons
        links.forEach((link, idx) => {
            quickLinksContainer.appendChild(createQuickLink(link.label, link.url, 'default', link.icon, idx));
        });
        // Add add button
        quickLinksContainer.appendChild(createQuickLink('', '', 'add-link'));
    });
}

// Add CSS for quick links
const quickLinkStyle = document.createElement('style');
quickLinkStyle.textContent = `
:root {
    --bg: #f5f5f5;
    --fg: #222;
    --card-bg: #fff;
    --card-border: #e0e0e0;
    --quick-link-bg: #fff;
    --quick-link-fg: #333;
}
body {
    background-color: var(--bg) !important;
    color: var(--fg) !important;
}
body.dark-mode {
    --bg: #181c1f;
    --fg: #f3f3f3;
    --card-bg: #23272a;
    --card-border: #23272a;
    --quick-link-bg: #23272a;
    --quick-link-fg: #f3f3f3;
}
.quick-link {
    background: var(--quick-link-bg) !important;
    color: var(--quick-link-fg) !important;
}

    .quick-links {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem;
    }

    .quick-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: white;
        border-radius: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
        cursor: pointer;
    }

    .quick-link:hover {
        transform: translateY(-2px);
    }

    .quick-link img {
        width: 24px;
        height: 24px;
        object-fit: contain;
    }

    .quick-link span {
        font-size: 0.9rem;
        color: var(--quick-link-fg) !important;
        padding-right: 18px; /* Space for the X button */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .quick-link-x {
        position: absolute;
        top: 2px;
        right: 2px;
        background: linear-gradient(135deg, #f4511e 60%, #ff9800 100%);
        color: #fff;
        border: 2px solid #fff;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(244,81,30,0.18), 0 1.5px 6px rgba(0,0,0,0.10);
        z-index: 3;
        opacity: 0.92;
        transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
        outline: none;
        border: 2px solid #333;
        background-clip: padding-box;
    }
    .quick-link-x:hover {
        background: linear-gradient(135deg, #ff9800 70%, #f4511e 100%);
        box-shadow: 0 0 0 3px #ffe0b2, 0 2px 8px rgba(244,81,30,0.25);
        opacity: 1;
        transform: scale(1.18) rotate(8deg);
    }
    .quick-link-x:hover {
        background: #d84315;
        opacity: 1;
    }

    .quick-link.add-link {
        background: #e3f2fd;
        color: #1976d2;
        cursor: pointer;
    }

    .quick-link.remove-link {
        background: #fff3e0;
        color: #f4511e;
        cursor: pointer;
    }

    .quick-link.add-link:hover {
        background: #bbdefb;
    }

    .quick-link.remove-link:hover {
        background: #ffe0b2;
    }

    .quick-link.add-link img,
    .quick-link.remove-link img {
        width: 16px;
        height: 16px;
    }
`;
try {
    document.head.appendChild(quickLinkStyle);
} catch (error) {
    console.error('Error adding CSS:', error);
    console.error('Error details:', error.stack);
}

// Add event listeners for quick links
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('quick-link')) {
        e.preventDefault();
        e.stopPropagation();
        
        // Update the current tab's URL
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.update(tabs[0].id, { url: e.target.dataset.url });
            }
        });
    } else if (e.target.classList.contains('quick-link-add')) {
        showAddModal();
    } else if (e.target.classList.contains('quick-link-remove')) {
        const quickLinksContainer = document.getElementById('quickLinksContainer');
        const quickLinks = Array.from(quickLinksContainer.children);
        const indexToRemove = quickLinks.indexOf(e.target.closest('.quick-link'));
        if (indexToRemove > 0) { // Don't remove the add/remove buttons
            chrome.storage.local.get('quickLinks', (result) => {
                const links = result.quickLinks || DEFAULT_QUICK_LINKS;
                links.splice(indexToRemove - 1, 1); // Adjust index to skip buttons
                chrome.storage.local.set({ quickLinks: links });
                loadQuickLinks();
            });
        }
    }
});

// Show add modal
function showAddModal() {
    const modal = document.createElement('div');
    modal.className = 'quick-link-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add Quick Link</h2>
            <form id="quickLinkForm">
                <div class="form-group">
                    <label for="linkLabel">Label:</label>
                    <input type="text" id="linkLabel" name="label" required>
                </div>
                <div class="form-group">
                    <label for="linkUrl">URL:</label>
                    <input type="url" id="linkUrl" name="url" required>
                </div>
                <button type="submit">Save</button>
                <button type="button" class="cancel">Cancel</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add form submission handler
    modal.querySelector('#quickLinkForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addQuickLink(e.target);
    });
    
    // Add cancel handler
    modal.querySelector('.cancel').addEventListener('click', () => {
        modal.remove();
    });
}

// Add quick link
function addQuickLink(form) {
    const formData = new FormData(form);
    const newLink = {
        label: formData.get('label'),
        url: formData.get('url')
    };
    
    chrome.storage.local.get(['quickLinks'], (result) => {
        const quickLinks = result.quickLinks || DEFAULT_QUICK_LINKS;
        quickLinks.push(newLink);
        chrome.storage.local.set({ quickLinks }, () => {
            displayQuickLinks(quickLinks);
            form.closest('.quick-link-modal').remove();
        });
    });
}

// Remove quick link
function removeQuickLink(index) {
    chrome.storage.local.get(['quickLinks'], (result) => {
        const quickLinks = result.quickLinks || DEFAULT_QUICK_LINKS;
        quickLinks.splice(index, 1);
        chrome.storage.local.set({ quickLinks }, () => {
            displayQuickLinks(quickLinks);
        });
    });
}

// Get favicon URL for a given URL
function getFaviconUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return `${parsedUrl.origin}/favicon.ico`;
    } catch (e) {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wIVDSAL0vj4SgAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAFElEQVQ4jWNgGAWjYBSMglEwCgAC7AAeCrQWjAAAAABJRU5ErkJggg==';
    }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    
    if (request.action === 'updateCounter') {
        displayCounters(
            request.totalTabs,
            request.treesPlanted,
            request.fundsCollected,
            request.totalTrees
        );
    } else if (request.action === 'displayAd') {
        displayAd(request.adData);
    }
    
    sendResponse({ success: true });
    return true; // Keep the message channel open for async operations
});

// Initialize the counters when the page loads
function initializeCounters() {
    chrome.storage.local.get(['totalTabs', 'treesPlanted', 'fundsCollected', 'totalTrees'], function(result) {
        console.log('Loading saved data:', result);
        try {
            const tabs = parseInt(result.totalTabs) || 0;
            const trees = parseInt(result.treesPlanted) || 0;
            const funds = parseInt(result.fundsCollected) || 0;
            const totalTrees = parseInt(result.totalTrees) || 0;
            
            // Display the values
            displayCounters(tabs, trees, funds, totalTrees);
        } catch (error) {
            console.error('Error loading saved data:', error);
            console.error('Error details:', error.stack);
        }
    });
}

// Add event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // THEME TOGGLE: Remove any existing toggle button to avoid duplicates
    const oldToggle = document.getElementById('themeToggleBtn');
    if (oldToggle) oldToggle.remove();
    // Create and add theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.id = 'themeToggleBtn';
    themeToggle.title = 'Toggle light/dark mode';
    themeToggle.innerHTML = '🌙';
    themeToggle.style.position = 'fixed';
    themeToggle.style.top = '20px';
    themeToggle.style.right = '32px';
    themeToggle.style.zIndex = '9999'; // ensure always on top
    themeToggle.style.background = 'rgba(255,255,255,0.8)';
    themeToggle.style.border = 'none';
    themeToggle.style.borderRadius = '50%';
    themeToggle.style.width = '36px';
    themeToggle.style.height = '36px';
    themeToggle.style.fontSize = '20px';
    themeToggle.style.cursor = 'pointer';
    document.body.appendChild(themeToggle);
    console.log('[TabForest] Theme toggle button created');

    // CUSTOM BACKGROUND BUTTON
    const bgBtn = document.createElement('button');
    bgBtn.id = 'bgSetBtn';
    bgBtn.title = 'Set background image';
    bgBtn.innerHTML = '🖼️';
    bgBtn.style.position = 'fixed';
    bgBtn.style.top = '20px';
    bgBtn.style.right = '76px';
    bgBtn.style.zIndex = '9999';
    bgBtn.style.background = 'rgba(255,255,255,0.8)';
    bgBtn.style.border = 'none';
    bgBtn.style.borderRadius = '50%';
    bgBtn.style.width = '36px';
    bgBtn.style.height = '36px';
    bgBtn.style.fontSize = '20px';
    bgBtn.style.cursor = 'pointer';
    document.body.appendChild(bgBtn);

    // Remove BG button (hidden by default)
    const bgRemoveBtn = document.createElement('button');
    bgRemoveBtn.id = 'bgRemoveBtn';
    bgRemoveBtn.title = 'Remove background image';
    bgRemoveBtn.innerHTML = '❌';
    bgRemoveBtn.style.position = 'fixed';
    bgRemoveBtn.style.top = '20px';
    bgRemoveBtn.style.right = '120px';
    bgRemoveBtn.style.zIndex = '9999';
    bgRemoveBtn.style.background = 'rgba(255,255,255,0.8)';
    bgRemoveBtn.style.border = 'none';
    bgRemoveBtn.style.borderRadius = '50%';
    bgRemoveBtn.style.width = '36px';
    bgRemoveBtn.style.height = '36px';
    bgRemoveBtn.style.fontSize = '20px';
    bgRemoveBtn.style.cursor = 'pointer';
    bgRemoveBtn.style.display = 'none';
    document.body.appendChild(bgRemoveBtn);

    // BG Overlay for readability
    let bgOverlay = document.getElementById('bgOverlay');
    if (!bgOverlay) {
        bgOverlay = document.createElement('div');
        bgOverlay.id = 'bgOverlay';
        bgOverlay.style.position = 'fixed';
        bgOverlay.style.top = 0;
        bgOverlay.style.left = 0;
        bgOverlay.style.width = '100vw';
        bgOverlay.style.height = '100vh';
        bgOverlay.style.zIndex = '0';
        bgOverlay.style.pointerEvents = 'none';
        bgOverlay.style.background = 'rgba(0,0,0,0.28)';
        document.body.appendChild(bgOverlay);
    }

    // Helper: set/remove background
    function setCustomBg(bg) {
        if (bg) {
            document.body.style.backgroundImage = `url('${bg}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            bgOverlay.style.display = '';
            bgRemoveBtn.style.display = '';
        } else {
            document.body.style.backgroundImage = '';
            bgOverlay.style.display = 'none';
            bgRemoveBtn.style.display = 'none';
        }
    }

    // On load, apply saved background
    chrome.storage.local.get('tabforest_bg', (result) => {
        if (result.tabforest_bg) {
            setCustomBg(result.tabforest_bg);
        }
    });

    // BG Set button click: show dialog
    bgBtn.addEventListener('click', () => {
        // Create dialog
        let dialog = document.getElementById('bgDialog');
        if (dialog) dialog.remove();
        dialog = document.createElement('div');
        dialog.id = 'bgDialog';
        dialog.style.position = 'fixed';
        dialog.style.top = '80px';
        dialog.style.left = '50%';
        dialog.style.transform = 'translateX(-50%)';
        dialog.style.background = 'var(--card-bg)';
        dialog.style.color = 'var(--fg)';
        dialog.style.border = '1px solid var(--card-border)';
        dialog.style.borderRadius = '10px';
        dialog.style.padding = '24px 20px 18px 20px';
        dialog.style.zIndex = '10000';
        dialog.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
        dialog.innerHTML = `
            <div style="font-weight:bold;font-size:1.1rem;margin-bottom:0.6em;color:var(--fg) !important;">Set Background Image</div>
            <form id="bgForm">
                <label style="font-size:0.98em;color:var(--fg) !important;">Upload Image: <input type="file" id="bgFile" accept="image/*"></label><br><br>
                <label style="font-size:0.98em;color:var(--fg) !important;">Image URL: <input type="url" id="bgUrl" style="width:220px;color:var(--fg) !important;background:var(--card-bg) !important;border:2px solid var(--card-border) !important;border-radius:7px !important;padding:7px 9px !important;outline:none;box-sizing:border-box;transition:border-color 0.2s;" onfocus="this.style.borderColor='#1976d2'" onblur="this.style.borderColor='var(--card-border)'"></label><br><br>
                <button type="submit" style="margin-right:8px;color:var(--fg) !important;background:var(--card-bg) !important;border:1px solid var(--card-border) !important;">Set</button>
                <button type="button" id="bgCancel" style="color:var(--fg) !important;background:var(--card-bg) !important;border:1px solid var(--card-border) !important;">Cancel</button>
            </form>
            <div id="bgError" style="color:#b71c1c;font-size:0.93em;margin-top:6px;"></div>
        `;
        document.body.appendChild(dialog);
        document.getElementById('bgCancel').onclick = () => dialog.remove();
        // Attach focus/blur listeners to url box for border color
        const urlInput = dialog.querySelector('#bgUrl');
        if (urlInput) {
            urlInput.addEventListener('focus', function() {
                this.style.borderColor = '#1976d2';
            });
            urlInput.addEventListener('blur', function() {
                this.style.borderColor = 'var(--card-border)';
            });
        }
        document.getElementById('bgForm').onsubmit = function(e) {
            e.preventDefault();
            const file = document.getElementById('bgFile').files[0];
            const url = document.getElementById('bgUrl').value.trim();
            const errorDiv = document.getElementById('bgError');
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    chrome.storage.local.set({ tabforest_bg: evt.target.result }, () => {
                        setCustomBg(evt.target.result);
                        dialog.remove();
                    });
                };
                reader.onerror = () => errorDiv.textContent = 'Failed to read file.';
                reader.readAsDataURL(file);
            } else if (url) {
                // Validate URL is image
                if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)) {
                    errorDiv.textContent = 'Please enter a valid image URL.';
                    return;
                }
                chrome.storage.local.set({ tabforest_bg: url }, () => {
                    setCustomBg(url);
                    dialog.remove();
                });
            } else {
                errorDiv.textContent = 'Please select a file or enter an image URL.';
            }
        };
    });

    // BG Remove button click
    bgRemoveBtn.addEventListener('click', () => {
        chrome.storage.local.remove('tabforest_bg', () => {
            setCustomBg(null);
        });
    });


    // Helper to apply theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.innerHTML = '🌙';
        }
        console.log('[TabForest] Theme applied:', theme, '| body.classList:', document.body.className);
    }

    // Load saved theme or system preference
    chrome.storage.local.get('tabforest_theme', (result) => {
        let theme = result.tabforest_theme;
        if (!theme) {
            theme = 'dark'; // Always default to dark mode
        }
        applyTheme(theme);
    });

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        console.log('[TabForest] Theme toggle button CLICKED');
        const isDark = document.body.classList.contains('dark-mode');
        const newTheme = isDark ? 'light' : 'dark';
        chrome.storage.local.set({ tabforest_theme: newTheme }, () => {
            console.log('[TabForest] Theme set to', newTheme);
            applyTheme(newTheme);
        });
    });

    // Initialize counters
    initializeCounters();
    
    // Load quick links
    loadQuickLinks();
});