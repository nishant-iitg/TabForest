// Default quick links
const DEFAULT_QUICK_LINKS = [
    { label: 'Google', url: '[https://www.google.com](https://www.google.com)' },
    { label: 'YouTube', url: '[https://www.youtube.com](https://www.youtube.com)' },
    { label: 'Twitter', url: '[https://www.twitter.com](https://www.twitter.com)' },
    { label: 'Reddit', url: '[https://www.reddit.com](https://www.reddit.com)' },
    { label: 'GitHub', url: '[https://www.github.com](https://www.github.com)' },
    { label: 'LinkedIn', url: '[https://www.linkedin.com](https://www.linkedin.com)' }
];

// Initialize the settings page
document.addEventListener('DOMContentLoaded', () => {
    // Load saved quick links
    loadQuickLinks();
    
    // Add event listeners
    document.getElementById('addNewLink').addEventListener('click', showAddModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelEdit').addEventListener('click', closeModal);
    document.getElementById('quickLinkForm').addEventListener('submit', handleFormSubmit);
    
    // Add event listeners for edit and delete buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit')) {
            editLink(e.target.dataset.index);
        } else if (e.target.classList.contains('delete')) {
            deleteLink(e.target.dataset.index);
        }
    });
});

// Load saved quick links from storage
function loadQuickLinks() {
    chrome.storage.local.get(['quickLinks'], (result) => {
        const quickLinks = result.quickLinks || DEFAULT_QUICK_LINKS;
        renderQuickLinks(quickLinks);
    });
}

// Render quick links in the grid
function renderQuickLinks(quickLinks) {
    const grid = document.getElementById('quickLinksGrid');
    grid.innerHTML = '';
    
    quickLinks.forEach((link, index) => {
        const linkElement = createQuickLinkElement(link, index);
        grid.appendChild(linkElement);
    });
}

// Create a quick link element
function createQuickLinkElement(link, index) {
    const div = document.createElement('div');
    div.className = 'quick-link-item';
    div.innerHTML = `
        <img class="icon" src="${getFaviconUrl(link.url)}" alt="${link.label} icon">
        <div class="label">${link.label}</div>
        <div class="url">${link.url}</div>
        <div class="actions">
            <button class="edit" data-index="${index}">Edit</button>
            <button class="delete" data-index="${index}">Delete</button>
        </div>
    `;
    return div;
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

// Show add/edit modal
function showAddModal() {
    document.getElementById('modal').style.display = 'block';
    document.getElementById('quickLinkForm').reset();
    document.getElementById('editMode').value = 'false';
}

// Close modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const editMode = formData.get('editMode') === 'true';
    const index = formData.get('index');
    
    const quickLinks = await getQuickLinks();
    
    if (editMode) {
        quickLinks[index] = {
            label: formData.get('label'),
            url: formData.get('url')
        };
    } else {
        quickLinks.push({
            label: formData.get('label'),
            url: formData.get('url')
        });
    }
    
    await saveQuickLinks(quickLinks);
    closeModal();
    renderQuickLinks(quickLinks);
}

// Edit a link
function editLink(index) {
    const quickLinks = getQuickLinks();
    const link = quickLinks[index];
    
    document.getElementById('modal').style.display = 'block';
    document.getElementById('label').value = link.label;
    document.getElementById('url').value = link.url;
    document.getElementById('index').value = index;
    document.getElementById('editMode').value = 'true';
}

// Delete a link
async function deleteLink(index) {
    const quickLinks = await getQuickLinks();
    quickLinks.splice(index, 1);
    await saveQuickLinks(quickLinks);
    renderQuickLinks(quickLinks);
}

// Helper functions for storage
async function getQuickLinks() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['quickLinks'], (result) => {
            resolve(result.quickLinks || DEFAULT_QUICK_LINKS);
        });
    });
}

async function saveQuickLinks(quickLinks) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ quickLinks }, () => {
            resolve();
        });
    });
}