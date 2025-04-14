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
function createQuickLink(label, url, type = 'default', icon = 'icons/link.png') {
    const link = document.createElement('div');
    link.className = `quick-link ${type}`;
    
    if (type === 'default') {
        link.innerHTML = `
            <img src="${chrome.runtime.getURL(icon)}" alt="${label} icon">
            <span>${label}</span>
        `;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Update the current tab's URL
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.update(tabs[0].id, { url });
                }
            });
        });
    } else if (type === 'add-link') {
        link.innerHTML = `
            <img src="${chrome.runtime.getURL('icons/plus.png')}" alt="Add">
            <span>Add Link</span>
        `;
        link.addEventListener('click', () => {
            const newLink = prompt('Enter the URL for the new link:');
            if (newLink) {
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
    } else if (type === 'remove-link') {
        link.innerHTML = `
            <img src="${chrome.runtime.getURL('icons/remove.png')}" alt="Remove">
            <span>Remove</span>
        `;
        link.addEventListener('click', () => {
            const quickLinksContainer = document.getElementById('quickLinksContainer');
            const quickLinks = Array.from(quickLinksContainer.children);
            const indexToRemove = quickLinks.indexOf(link);
            if (indexToRemove > 0) { // Don't remove the add/remove buttons
                chrome.storage.local.get('quickLinks', (result) => {
                    const links = result.quickLinks || DEFAULT_QUICK_LINKS;
                    links.splice(indexToRemove - 1, 1); // Adjust index to skip buttons
                    chrome.storage.local.set({ quickLinks: links });
                    loadQuickLinks();
                });
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
        
        // Add remove button
        quickLinksContainer.appendChild(createQuickLink('', '', 'remove-link'));
        
        // Add default links
        links.forEach(link => {
            quickLinksContainer.appendChild(createQuickLink(link.label, link.url, 'default', link.icon));
        });
        
        // Add add button
        quickLinksContainer.appendChild(createQuickLink('', '', 'add-link'));
    });
}

// Add CSS for quick links
const quickLinkStyle = document.createElement('style');
quickLinkStyle.textContent = `
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
        color: #333;
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
    // Initialize counters
    initializeCounters();
    
    // Load quick links
    loadQuickLinks();
});