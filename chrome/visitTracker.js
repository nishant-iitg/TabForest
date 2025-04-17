// Store for tracking site visits
let siteVisits = {};

// Function to update visit count
function updateVisitCount(url) {
    if (!url) return;
    
    // Extract domain from URL
    const domain = new URL(url).hostname;
    
    // Update visit count
    if (siteVisits[domain]) {
        siteVisits[domain].count += 1;
        siteVisits[domain].lastVisit = Date.now();
    } else {
        siteVisits[domain] = {
            count: 1,
            lastVisit: Date.now(),
            url: url
        };
    }
    
    // Save to storage
    chrome.storage.local.set({ siteVisits });
}

// Function to get top visited sites
function getTopVisitedSites(limit = 6) {
    // Sort sites by visit count and recency
    const sortedSites = Object.entries(siteVisits)
        .sort((a, b) => {
            // Weighted score: 70% visit count, 30% recency
            const scoreA = a[1].count * 0.7 + (Date.now() - a[1].lastVisit) * 0.3;
            const scoreB = b[1].count * 0.7 + (Date.now() - b[1].lastVisit) * 0.3;
            return scoreB - scoreA;
        });
    
    return sortedSites.slice(0, limit).map(([domain, data]) => ({
        domain,
        url: data.url,
        count: data.count
    }));
}

// Listen for tab updates to track visits
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        updateVisitCount(tab.url);
    }
});

// Export for use in other files
export { getTopVisitedSites };
